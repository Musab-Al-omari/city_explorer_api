
'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();


// Application Dependencies
const superagent = require('superagent');
const express = require('express');
const cors =require('cors');


// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());


// Route Definitions
app.get('/location',handleLocation);
app.get('/weather',handleWeather);
app.get('/parks',handleParks);
// app.get('/parks',handleParksRequest);



// Express has an internal error handler.
// so this means if you did not create your own.
// express handler will respond


app.use('*', notFoundHandler); // 404 not found url
app.use(errorHandler);

let lat ='';
let lon ='';
let city= '';
function notFoundHandler(request, response) {
  response.status(404).send('requested API is Not Found!');
}



// eslint-disable-next-line no-unused-vars
function errorHandler(err, request, response, next) {
  response.status(500).send('something is wrong in server');
}

const myLocalLocations = {};
function handleLocation(request,response) {
  // causing an error by purpose to run the error handler
  // let x;
  // x.push("asd");


  city = request.query.city;


  // instead of reading from .json file
  // we will be requesting data from another external API
  // if (myLocalLocations(url))
  // caching locally in a variable, to avoid some extra work
  // console.log(myLocalLocations);


  if (myLocalLocations[city]) {
    // console.log('2.from my local data');


    response.send(myLocalLocations[city]);

  } else {

    // console.log('1.from the location API');


    let key = process.env.locationIq;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    superagent.get(url).then(res=> {


      // use response.body to get the response data itself
      // console.log(res.body);


      const locationData = res.body[0];
      // console.log(locationData);
      lat=locationData.lat;
      lon= locationData.lon;
      const location = new Location(city, locationData);


      // console.log(location);
      // give me the first object in array
      myLocalLocations[city] = location;
      response.send(location);

    }).catch((err)=> {
      console.log('ERROR IN LOCATION API');
      console.log(err);
    });
  }
}



function Location(city,date) {
  this.search_query = city;
  this.formatted_query = date.display_name;
  this.latitude = date.lat;
  this.longitude = date.lon;
}







function handleWeather(request,response){
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
    superagent.get(url).then(res=> {
      // console.log('iam res',res.body);
      myWeatherArray=res.body.data.map(WeatherData=>{

        let time =WeatherData.datetime;

        time=time.replace('-','/');

        let date = new Date(time);

        let timeToDate=date.toString();

        let newDate= timeToDate.slice(0,16);

        let newweather= new Weather( WeatherData,newDate);
        // console.log('newweather',newWeather);
        return newweather;

      });
      // console.log(myWeatherArray);
      response.send(myWeatherArray);

    }).catch((err)=> {

      console.log('ERROR IN wether API');

      console.log(err);
    });
  }
}


// constructor for weather

function Weather(WeatherData,newDate) {

  this.forecast=WeatherData.weather['description'];
  this.time=newDate;
}




// park
function handleParks(request,response) {
  let key =process.env.PARKS_API_KEY;
  let url =`https://developer.nps.gov/api/v1/parks?lat=${request.latitude}&lon=${request.longitude}&parkCode=acad&api_key=${key}`;
  superagent.get(url).then(res=>{
    let myParkArray=[];
    res.body.data.map(parkDate=>{
      myParkArray.push(new Park(parkDate));
    });

    response.send(myParkArray);
  }).catch((err)=> {

    console.log('ERROR IN park API');
    console.log(err);
  });
}

// park constractor
function Park(parkDate) {
  this.name=parkDate.name;
  let myarr= Object.values(parkDate.addresses[0]);
  this.address=myarr.toString();
  this.fee=parkDate.fees.toString() ||':0.00';
  this.description=parkDate.description;
  this.url=parkDate.url;
}


// app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
app.listen(PORT || 5000, () =>console.log(`App is running on Server on port: 5000`));





























































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


// constractor for weather
// function Weather(weatherDescription,newDate) {
//   this.forecast=weatherDescription;
//   this.time=newDate;
// }


// app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
