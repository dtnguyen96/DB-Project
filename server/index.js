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
    var d_loc = req.param('dloc');
    var a_loc = req.param('aloc');
    
    var d_time = req.param('dtime');
    var a_time = req.param('atime');
    
    var f_cond = req.param('f_cond');

    var a_cnt = parseInt(req.param('a_cnt'));
    var c_cnt = parseInt(req.param('c_cnt'));

    var round = req.param('round');

    var total_ticket_cnt = a_cnt + c_cnt;
    console.log(total_ticket_cnt);

    // console.log("d_loc: " + d_loc.length + "a_loc: " + a_loc.length + "d_time: " + d_time.length + "a_time: " + a_time.length + " ");

    if (isEmpty(d_loc) && isEmpty(a_loc) && isEmpty(d_time) && isEmpty(a_time)){
      var new_flightList = await pool.query(
        `SELECT flight_id, 
          scheduled_departure, 
          scheduled_arrival, 
          departure_airport, 
          arrival_airport, 
          direct_flight, 
          movie, 
          meal 
            FROM flights
            WHERE seats_available >= ` + total_ticket_cnt
            );
    } 
    else if (isEmpty(d_loc) === false && isEmpty(a_loc) === false && (isEmpty(d_time) || isEmpty(a_time)))
    {
      var new_flightList = await pool.query(
        `SELECT flight_id, 
          scheduled_departure, 
          scheduled_arrival, 
          departure_airport, 
          arrival_airport, 
          direct_flight, 
          movie, 
          meal 
            FROM flights WHERE departure_airport = ` + `'` + d_loc + `' 
              AND
            arrival_airport = ` + `'` + a_loc + `'
              AND
            seats_available >= ` + total_ticket_cnt + `
              AND
            direct_flight = ` + `'` + round + `'`
      );
      
      console.log(`SELECT flight_id, 
      scheduled_departure, 
      scheduled_arrival, 
      departure_airport, 
      arrival_airport, 
      direct_flight, 
      movie, 
      meal 
        FROM flights WHERE departure_airport = ` + `'` + d_loc + `' 
          AND
        arrival_airport = ` + `'` + a_loc + `'
          AND
        seats_available >= ` + total_ticket_cnt + `
          AND
        direct_flight = ` + `'` + round + `'`);

    }
    else{
      var new_flightList = await pool.query(
        `SELECT flight_id, 
          scheduled_departure, 
          scheduled_arrival, 
          departure_airport, 
          arrival_airport, 
          direct_flight, 
          movie, 
          meal 
            FROM flights WHERE departure_airport = ` + `'` + d_loc + `' 
              AND
            arrival_airport = ` + `'` + a_loc + `'
              AND
            scheduled_departure >= ` + `'` + d_time + `'
              AND
            scheduled_arrival <= ` + `'` + a_time + `' 
              AND
            seats_available >= ` + total_ticket_cnt
      );
    }

    res.json(new_flightList.rows);
    console.log(new_flightList.rows);
  } catch(err){ console.log(err.message);}
});

app.listen(5000, ()=>{
  console.log("server has started on port 5000");
});

function isEmpty(str) {
  return (!str || 0 === str.length);
}