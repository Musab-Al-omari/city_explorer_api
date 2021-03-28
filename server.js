
'use strict';
const express = require('express');
const cors =require('cors');
const PORT = 3000;


const app = express();
app.use(cors());
app.get('/location',handleLocation);
// app.get('/weather',handleWeather);







function handleLocation(request,response) {


  const getLocation = require('./dataDirectory/location.json');
  const city = request.query.city;
  let name= getLocation[0].display_name;
  let newCity = city;
  let latitude= getLocation[0].lat;
  let longitude= getLocation[0].lon;


  let responToRequestObject= new CityLocation(name,newCity,latitude,longitude);
  response.send(responToRequestObject);
//   return responToRequestObject;
}



// constractor
function CityLocation(newCity,name,latitude,longitude) {
  this.newCity=newCity;
  this.name=name;
  this.latitude=latitude;
  this.longitude=longitude;
}




























app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
