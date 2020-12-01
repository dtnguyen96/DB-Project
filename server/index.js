const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// middleware
app.use(cors());
app.use(express.json());      //req.body

let customer_id = 0;
let book_ref = 0;

//ROUTES
// Query from db 
app.get('/flights', async(req, res)=>{
  try{
    //these are the input from users
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
//Send payment data to db
app.post('/flights', async(req, res)=>{
  try{
    var fname = req.param('fname');

    var email=req.param('email');
    var cardNum = req.param('cardNum');
    var total_amount = req.param('total_amount');
    var phoneNumber = req.param('phoneNumber');
    var tax= req.param('tax');
    var groupTravel = req.param('groupTravel');
    var groupCnt = req.param('groupCnt');
    var custNames = req.param('custName');

    const cust_id =
     generate_customer_id();
    const book_ref_temp = generate_book_ref();

    let group_travel_bool = '0';

    if (groupTravel === true){ group_travel_bool = '1';}

    var ticket_no = generate_ticket_no();
    var passenger_id = generate_passenger_id();

    queryCust = `INSERT INTO tickets 
    VALUES ('` + ticket_no + `','` + book_ref_temp + `','` + passenger_id + `','` + phoneNumber + `');`;
    
    for (i = 0; i < groupCnt - 1; i++) {
      console.log(i);
      ticket_no = generate_ticket_no();
      passenger_id = generate_passenger_id();
      queryCust += `INSERT INTO tickets 
      VALUES ('` + ticket_no + `','` + book_ref_temp + `','` + passenger_id + `','` + phoneNumber + `');`;
    }

    const newPayment = await pool.query(`
    BEGIN;
      INSERT INTO payment 
        VALUES(${cardNum}, ${tax}, 15, ${total_amount});
      
      INSERT INTO bookings 
      VALUES  ('` + book_ref_temp + `', CURRENT_TIMESTAMP, cast(${total_amount} as NUMERIC(10,2)));
      
      INSERT INTO customer 
        VALUES (${cust_id}, '` + fname + `' , ${phoneNumber},'` + email + `', '` + book_ref_temp +`', '` + group_travel_bool + `', '` + cardNum + `');

      ` + queryCust + `
        COMMIT;`);

    console.log(newPayment.rows);             
  } catch(err){
    console.log(err.message, err.lineNumber);
  }
});

app.listen(5000, ()=>{
  console.log("server has started on port 5000");
});

app.delete('/flights/:fullName', async (req, res) => {
  try{
    const { fullName } = req.param;
    const deleteCustomer = await pool.query(
      `DELETE FROM boarding_passes 
        WHERE boarding_passes.ticket_no
          IN (SELECT tickets.ticket_no
              FROM tickets
                WHERE tickets.passenger_name = ${fullName})
        `);
        res.json(`${fullName} was deleted!`);
  } catch(err) { console.log(err.message, err.lineNumber);}
});

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function generate_customer_id(){
  customer_id += 1;
  let cust_id_str = customer_id.toString();

  let str_num_temp = '';
  for (i = 0; i < 8-cust_id_str.length; i++)
  {
    str_num_temp += '0';
  }
  return str_num_temp + cust_id_str;
}

function generate_book_ref(){
  book_ref += 1;
  let book_ref_str = book_ref.toString();

  let str_book_temp = '';
  for (i = 0; i < 6-book_ref_str.length; i++)
  {
    str_book_temp += '0';
  }
  console.log((str_book_temp + book_ref_str).length)
  return book_ref_str;
}

function generate_ticket_no(){
  var ticket_no_new = 0;
  ticket_no_new = getRandomInt(9999999999999);

  try {
    const ticket_nos = pool.query('SELECT ticket_no FROM tickets;');
      for (i = 0; i < ticket_nos.rows.length; i++)
      {
        var temp_json = JSON.parse(ticket_nos.rows[i]);
        if (temp_json.ticket_no === ticket_no_new){ ticket_no_new = getRandomInt(9999999999999);}
      }
  } catch(err) { console.log(err.message, err.lineNumber);}
  return ticket_no_new;
}

function generate_passenger_id(){
  var passenger_id_new = 0;
  passenger_id = getRandomInt(99999999999999999999);
  try {
    const passenger_ids = pool.query('SELECT passenger_id FROM tickets;')
    for (i = 0; i < passenger_ids.rows.length; i++)
    {
      var temp_json = JSON.parse(passenger_ids.rows[i]);
      if (temp_json.passenger_id === passenger_id_new){ passenger_id_new = getRandomInt(9999999999999);}
    }
} catch(err) { console.log(err.message, err.lineNumber);}

  return passenger_id_new;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}