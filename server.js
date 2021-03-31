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



// Express has an internal error handler.
// so this means if you did not create your own.
// express handler will respond


app.use('*', notFoundHandler); // 404 not found url
app.use(errorHandler);

let lat = '';
let lon = '';
let city = '';



// location constructor
function Location(city, date) {
  this.search_query = city;
  this.formatted_query = date.display_name;
  this.latitude = date.lat;
  this.longitude = date.lon;
}

// SQL function
function dataBase(request, response) {
  let name = request.query.name;
  let SQL = 'SELECT * FROM location name=$1';
  client.query(SQL, [name]).then(result => {
    response.send(result.rows);
  });

}

function notFoundHandler(request, response) {

  response.status(404).send('requested API is Not Found!');
}



// eslint-disable-next-line no-unused-vars
function errorHandler(err, request, response, next) {
  response.status(500).send('something is wrong in server');
}


function handleLocation(request, response) {

  city = request.query.city;
  let key = process.env.locationIq;
  let SQL = 'SElECT * FROM location WHERE city=$1';

  client.query(SQL, [city]).then(result => {
    console.log(result.rowCount > 0);
    if (result.rowCount > 0) {

      console.log('from data base');
      response.send(result.rows[0]);

    } else {

      console.log('1.from the location API');

      const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
      superagent.get(url).then(res => {

        const location = new Location(city, res.body[0]);

        SQL = 'INSERT INTO location (city,display_name,latitude,longitude)VALUES($1,$2,$3,$4)';
        let values = [city, location.display_name, location.lat, location.lon];
        client.query(SQL, values)
          .then(() => {
            response.send(location);
          });

        // myLocalLocations[city] = location;
      }).catch((err) => {
        console.log('ERROR IN LOCATION API');
        console.log(err);
      });
    }

  });

}


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