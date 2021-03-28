
'use strict';
const express = require('express');
const cors =require('cors');
const PORT = 3000;


const app = express();
app.use(cors());
app.get('/location',handleLocation);
app.get('/weather',handleWeather);







function handleLocation(request,response) {
  const getLocation = require('./dataDirectory/location.json');
  //   searched city
  const city = request.query.city;
  let name= getLocation[0].display_name;
  let newCity = city;
  let latitude= getLocation[0].lat;
  let longitude= getLocation[0].lon;


  let responToRequestObject= new CityLocation(newCity,name,latitude,longitude);
  response.send(responToRequestObject);
//   return responToRequestObject;
}



// constractor for locations
function CityLocation(newCity,name,latitude,longitude) {
  this.newCity=newCity;
  this.name=name;
  this.latitude=latitude;
  this.longitude=longitude;
}










function handleWeather(request,response){

  let getWeather = require('./dataDirectory/weather.json');

  let objectArray = [];


  for(let i=0 ; i<getWeather.data.length;i++){
    let weatherDescription=getWeather.data[i].weather['description'];

    // console.log(weatherDescription);
    let time =getWeather.data[i].datetime;
    time=time.replace('-','/');
    let date = new Date(time);
    let timeToDate=date.toString();
    let newDate= timeToDate.slice(0,16);
    let responseToOpject= new Weather(weatherDescription,newDate);
    objectArray.push(responseToOpject);
  }


  response.send(objectArray);

}

// let i ='2020-04-13'
// let date = new Date(i);
// let timeData = date.toString();
// let newDate = timeData.slice(0, 16);

// console.log(date);
// console.log(timeData);
// console.log(newDate);


// constractor for weather
function Weather(weatherDescription,newDate) {
  this.forecast=weatherDescription;
  this.time=newDate;
}





app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
