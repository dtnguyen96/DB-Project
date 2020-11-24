const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// middleware
app.use(cors());
app.use(express.json());      //req.body

//ROUTES
app.post('/flights', async(req, res)=>{
  try{
    console.log("This is the request: " + req.body);
    const {description} = req.body;
    console.log('SELECT flights.flight_id FROM flights WHERE ' + description[0] + ' = flights.departure_airport');
    const new_flightList = await pool.query(`SELECT flights.flight_id FROM flights WHERE flights.departure_airport = ($1)`
      , [description]);
    console.log(new_flightList);
    res.json(new_flightList.rows);
  } catch(err){ console.log(err.message);}
});

// set up the server listening at port 5000 (the port number can be changed)
app.listen(5000, ()=>{
  console.log("server has started on port 5000");
});