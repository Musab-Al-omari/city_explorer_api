'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const express = require('express');
const pg = require('pg');
const cors = require('cors');

// Application Setup
const client = new pg.Client(process.env.DATABASE_URL);
// eslint-disable-next-line no-unused-vars
client.on('Erroe', err => console.log('pg problem'));

const PORT = process.env.PORT;
const app = express();
app.use(cors());

// Route Definitions
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handleParks);
app.get('/citys', dataBase);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);


app.use('*', notFoundHandler); // 404 not found url
app.use(errorHandler);

let lat = '';
let lon = '';
let city = '';

function notFoundHandler(request, response) {
    response.status(404).send('requested API is Not Found!');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, request, response, next) {
    response.status(500).send('something is wrong in server');
}


// movies


function movieHandler(request, response) {
    let city = request.query.city
        // console.log('this is slected query',city);

    let key = process.env.MOVIE_API_KEY;
    // console.log('this is slected key',key);

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;

    superagent.get(url).then((res) => {

        const movies = new Movie(res.body.results[0]);
        // console.log('movie body',res.body.results[0]);
        // let values = [movies.title, movies.overview, movies.average_votes,
        //   movies.total_votes, movies.image_url, movies.popularity, movies.released_on
        // ];
        // console.log(values);
        response.send(movies);
    }).catch((err) => {
        console.log('ERROR IN movie API');
        console.log(err);
    });



}

function Movie(data) {
    this.title = data.title;
    this.overview = data.overview;
    this.average_votes = data.vote_average;
    this.total_votes = data.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    this.popularity = data.popularity;
    this.released_on = data.release_date;

}







// YELP


function yelpHandler(request, response) {
    let city = request.query.city

    let key = process.env.YELP_API_KEY;

    const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;

    superagent.get(url).set('Authorization', `Bearer ${key}`).then((res) => {

        const resturent = new Resturent(res.body.businesses[0]);

        let values = [resturent.name, resturent.image_url, resturent.price,
            resturent.rating, resturent.url
        ];

        response.send(resturent);

    }).catch((err) => {
        console.log('ERROR IN yelp yelp');
        console.log(err);
    });

}

function Resturent(data) {
    this.name = data.name;
    this.image_url = data.image_url
    this.price = data.price
    this.rating = data.rating
    this.url = data.url
}


// location


// SQL function
function dataBase(request, response) {
    let name = request.query.name;
    let SQL = 'SELECT * FROM location name=$1';
    client.query(SQL, [name]).then(result => {
        response.send(result.rows);
    });

}



function handleLocation(request, response) {

    city = request.query.city;
    let key = process.env.locationIq;
    let SQL = 'SElECT * FROM location WHERE city=$1';

    client.query(SQL, [city]).then(result => {
        console.log(result.rowCount > 0);
        if (result.rowCount > 0) {
            console.log('from data base');
            response.send(result.rows);

        } else {
            console.log('1.from the location API');
            const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
            superagent.get(url).then(res => {

                const location = new Location(city, res.body[0]);

                SQL = 'INSERT INTO location (city,display_name,latitude,longitude)VALUES($1,$2,$3,$4)';

                let values = [location.search_query, location.formatted_query, location.latitude, location.longitude];
                // console.log('hello', values);
                // console.log('hello', location);

                client.query(SQL, values)
                    .then(() => {
                        // console.log(location);
                        response.send(location);
                    });
                //
                // myLocalLocations[city] = location;
            }).catch((err) => {
                console.log('ERROR IN LOCATION API');
                console.log(err);
            });
        }

    });

}

// location constructor
function Location(city, date) {
    this.search_query = city;
    this.formatted_query = date.display_name;
    this.latitude = date.lat;
    this.longitude = date.lon;
}



// weather

function handleWeather(request, response) {
    // console.log('hi');
    let myWeatherArray = [];

    // const city = request.query.city;




    if (myWeatherArray.city) {
        // console.log('2.from my local data');


        response.send(myWeatherArray);

    } else {

        let key = process.env.WEATHER_API_KEY;
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
        // const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
        // console.log('url',url);
        superagent.get(url).then(res => {
            // console.log('iam res',res.body);
            myWeatherArray = res.body.data.map(WeatherData => {

                let time = WeatherData.datetime;

                time = time.replace('-', '/');

                let date = new Date(time);

                let timeToDate = date.toString();

                let newDate = timeToDate.slice(0, 16);

                let newweather = new Weather(WeatherData, newDate);
                // console.log('newweather',newWeather);
                return newweather;

            });
            // console.log(myWeatherArray);
            response.send(myWeatherArray);

        }).catch((err) => {

            console.log('ERROR IN wether API');

            console.log(err);
        });
    }
}


// constructor for weather

function Weather(WeatherData, newDate) {

    this.forecast = WeatherData.weather['description'];
    this.time = newDate;
}








// park
function handleParks(request, response) {
    let key = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?lat=${request.latitude}&lon=${request.longitude}&parkCode=acad&api_key=${key}`;
    superagent.get(url).then(res => {
        let myParkArray = [];
        res.body.data.map(parkDate => {
            myParkArray.push(new Park(parkDate));
        });

        response.send(myParkArray);
    }).catch((err) => {

        console.log('ERROR IN park API');
        console.log(err);
    });
}

// park constractor
function Park(parkDate) {
    this.name = parkDate.name;
    let myarr = Object.values(parkDate.addresses[0]);
    this.address = myarr.toString();
    this.fee = parkDate.fees.toString() || ':0.00';
    this.description = parkDate.description;
    this.url = parkDate.url;
}

client.connect()
    .then(() => {
        console.log('connected');
        // app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
        app.listen(PORT || 5000, () => console.log(`App is running ${PORT}`));
    })
    .catch(e => console.error(e.message));




























































// function handleLocation(request,response) {
//   const getLocation = require('./dataDirectory/location.json');
//   //   searched city
//   const city = request.query.city;
//   let name= getLocation[0].display_name;
//   let newCity = city;
//   let latitude= getLocation[0].lat;
//   let longitude= getLocation[0].lon;


//   let responToRequestObject= new CityLocation(newCity,name,latitude,longitude);
//   response.send(responToRequestObject);
// //   return responToRequestObject;
// }



// // constractor for locations
// function CityLocation(newCity,name,latitude,longitude) {
//   this.newCity=newCity;
//   this.name=name;
//   this.latitude=latitude;
//   this.longitude=longitude;
// }




// function handleWeather(request,response){

//   let getWeather = require('./dataDirectory/weather.json');

//   let objectArray = [];


//   for(let i=0 ; i<getWeather.data.length;i++){
//     let weatherDescription=getWeather.data[i].weather['description'];

//     // console.log(weatherDescription);
//     let time =getWeather.data[i].datetime;
//     time=time.replace('-','/');
//     let date = new Date(time);
//     let timeToDate=date.toString();
//     let newDate= timeToDate.slice(0,16);
//     let responseToOpject= new Weather(weatherDescription,newDate);
//     objectArray.push(responseToOpject);
//   }

//   response.send(objectArray);

// }

// let i ='2020-04-13'
// let date = new Date(i);
// let timeData = date.toString();
// let newDate = timeData.slice(0, 16);

// console.log(date);
// console.log(timeData);
// console.log(newDate);


// constructor for weather
// function Weather(weatherDescription,newDate) {
//   this.forecast=weatherDescription;
//   this.time=newDate;
// }