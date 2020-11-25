const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// middleware
app.use(cors());
app.use(express.json());      //req.body

//ROUTES
app.get('/flights', async(req, res)=>{
  try{

    // const {description} = req.body;
    // console.log(description);
    var d_loc = req.param('dloc');
    console.log('SELECT flights.flight_id FROM flights WHERE ' + d_loc + ' = flights.departure_airport');
    const new_flightList = await pool.query(`SELECT flight_id FROM flights WHERE departure_airport = ` + `'` + d_loc + `'`);
    res.json(new_flightList.rows);
    console.log(new_flightList.rows);
  } catch(err){ console.log(err.message);}
});

// set up the server listening at port 5000 (the port number can be changed)
app.listen(5000, ()=>{
  console.log("server has started on port 5000");
});