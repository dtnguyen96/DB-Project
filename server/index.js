const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const { query } = require('./db');
const fs = require('fs');
let sql_str='';
// middleware
app.use(cors());
app.use(express.json());

let customer_id = 0
let book_ref = 0
app.get('/flights', async (req, res) => {
  try {
    var d_loc = req.param('dloc').toUpperCase();
    var a_loc = req.param('aloc').toUpperCase();

    var d_time = req.param('dtime');
    var a_time = req.param('atime');

    var a_cnt = parseInt(req.param('a_cnt'));
    var c_cnt = parseInt(req.param('c_cnt'));

    var round = req.param('round');
    var total_ticket_cnt = a_cnt + c_cnt;

    var type = req.param('f_cond');

    var meal_bool = req.param('meal');
    var movie_bool = req.param('movie');

    var meal = '0';
    var movie = '0';

    if (meal_bool === 'Yes') { meal = '1'; }
    if (movie_bool === 'Yes') { movie = '1'; }

    var seat_type = "seats_avail_econ";
    if (type === 'Business') {
      seat_type = "seats_avail_business";
    }

    var new_flight_list_str = ``;

    if (a_time === '' && d_time === '' && d_loc === '' && a_loc === '') {
      new_flight_list_str = `
      SELECT route_id, 
        arrival_airport, 
        intermediate_airport,
        departure_airport,
        main_flight_id,
        intermediate_flight_id,
        scheduled_departure,
        scheduled_arrival
      FROM a7i743.routes
      WHERE main_flight_id IN
        (SELECT flight_id
          FROM a7i743.flights
          WHERE
            "` + seat_type + `" >= ` + total_ticket_cnt + ` 
            AND 
            movie = '` + movie + `'
            AND
            meal = '` + meal + `')`;
    }
    else if (a_time === '' && d_time === '') {
      new_flight_list_str = `
      SELECT route_id, 
        arrival_airport, 
        intermediate_airport,
        departure_airport,
        main_flight_id,
        intermediate_flight_id,
        scheduled_departure,
        scheduled_arrival
      FROM a7i743.routes
      WHERE a7i743.routes.departure_airport = ` + `'` + d_loc + `'
      AND
      a7i743.routes.arrival_airport = ` + `'` + a_loc + `'
      AND
      main_flight_id IN
        (SELECT flight_id
          FROM a7i743.flights
          WHERE
            "` + seat_type + `" >= ` + total_ticket_cnt + ` 
            AND 
            movie = '` + movie + `'
            AND
            meal = '` + meal + `')`;
      
    }
    else {
      new_flight_list_str = `
      SELECT route_id,
        arrival_airport, 
        intermediate_airport,
        departure_airport,
        main_flight_id,
        intermediate_flight_id,
        scheduled_departure,
        scheduled_arrival
      FROM a7i743.routes
      WHERE a7i743.routes.departure_airport = ` + `'` + d_loc + `'
      AND
      a7i743.routes.arrival_airport = ` + `'` + a_loc + `'
      AND
      scheduled_arrival >= ` + a_time + `
      AND
      scheduled_departure <= ` + d_time + `
      main_flight_id IN
        (SELECT flight_id
          FROM a7i743.flights
          WHERE
            "` + seat_type + `" >= ` + total_ticket_cnt + ` 
            AND 
            movie = '` + movie + `'
            AND
            meal = '` + meal + `')`;
    }
   
    var new_flight_list = await pool.query(new_flight_list_str);
    sql_str += new_flight_list_str
    //console.log(new_flight_list_str)
    
    //  fs.writeFile('Query.sql', new_flight_list_str, (err) => {
    //    if (err) throw err;
    //  })
     res.json(new_flight_list.rows);
    console.log(new_flight_list.rows);
  } catch (err) { res.json("Error! Check your input!");}
});

app.post('/flights', async (req, res) => {
  try {
    var fname = req.param('fname');
    var email = req.param('email');
    var cardNum = req.param('cardNum');
    var total_amount = req.param('total_amount');
    var phoneNumber = req.param('phoneNumber');
    var tax = req.param('tax');
    var groupTravel = req.param('groupTravel');
    var groupCnt = req.param('groupCnt');
    var custNames = req.param('custName');
    var fare_condition = req.param('fare_cond');
    var flight_id = req.param('flight_id');
    var flight_id_2 = req.param('flight_id_2');
    var route_id = req.param('route_id');

    var seat_type = '';

    var cust_id = generate_customer_id();

    var book_ref_temp = generate_book_ref();

    let group_travel_bool = '0';

    if (groupTravel === true) { group_travel_bool = '1'; }
    if (fare_condition === "Economy") { seat_type = 'seats_avail_econ'; }
    else { seat_type = 'seats_avail_business'; }

    var ticket_no = generate_ticket_no();
    var passenger_id = generate_passenger_id();
    var boarding_no = generate_boarding_no();
    seat_no = generate_seat_no();

    queryCust = `INSERT INTO a7i743.tickets 
    VALUES ('` + ticket_no + `','` + book_ref_temp + `','` + passenger_id + `','` + phoneNumber + `','` + seat_no + `');`;

    queryCust += `INSERT INTO a7i743.passenger_check_in
    VALUES ('` + ticket_no + `', 'NOTCHECKED',` + 0 + `);`;

    queryCust += `INSERT INTO a7i743.ticket_flights
    VALUES ('` + ticket_no + `','` + flight_id + `','` + fare_condition + `');`;

    queryCust += `UPDATE a7i743.flights SET seats_available = seats_available - 1, ` + seat_type + ` = ` + seat_type + ` - 1, seats_booked = seats_booked + 1 WHERE flight_id = ` + flight_id + `;`;

    for (i = 0; i < groupCnt - 1; i++) {
      ticket_no = generate_ticket_no();
      passenger_id = generate_passenger_id();
      seat_no = generate_seat_no();
      boarding_no = generate_boarding_no();

      queryCust += `INSERT INTO a7i743.tickets 
      VALUES ('` + ticket_no + `','` + book_ref_temp + `','` + passenger_id + `','` + phoneNumber + `','` + seat_no + `');`;

      queryCust += `INSERT INTO a7i743.passenger_check_in
      VALUES ('` + ticket_no + `',` + 'NOTCHECKED' + `,` + 0 + `);`;

      queryCust += `INSERT INTO a7i743.ticket_flights
      VALUES ('` + ticket_no + `','` + flight_id + `','` + fare_condition + `');`;

      if (flight_id_2 != -1) {
        queryCust += `INSERT INTO a7i743.ticket_flights
        VALUES ('` + ticket_no + `','` + flight_id_2 + `','` + fare_condition + `');`;
      }

      queryCust += `UPDATE a7i743.flights SET seats_available = seats_available - 1, ` + seat_type + ` = ` + seat_type + ` - 1, seats_booked = seats_booked + 1 WHERE flight_id = ` + flight_id + `;`;

      if (flight_id_2 != -1) {
        queryCust += `UPDATE a7i743.flights SET seats_available = seats_available - 1, ` + seat_type + ` = ` + seat_type + ` - 1, seats_booked = seats_booked + 1 WHERE flight_id = ` + flight_id_2 + `;`;
      }
    }
    sql_str+= queryCust;

    let paymentPostString = `
    BEGIN;
      INSERT INTO a7i743.payment 
        VALUES(${cardNum}, ${tax}, 15, ${total_amount});
      
      INSERT INTO a7i743.bookings 
      VALUES  ('` + book_ref_temp + `', CURRENT_TIMESTAMP, cast(${total_amount} as NUMERIC(10,2)));
      
      INSERT INTO a7i743.customer 
        VALUES (${cust_id}, '` + fname + `' , ${phoneNumber},'` + email + `', '` + book_ref_temp + `', '` + group_travel_bool + `', '` + cardNum + `', '` + route_id + `');

      ` + queryCust + `
        COMMIT;`;
    const newPayment = await pool.query(paymentPostString);
    sql_str+= paymentPostString;
    // fs.writeFile('Transaction.sql', paymentPostString, (err) => {
    //   if (err) throw err;
    // })

    console.log(newPayment.rows);
    res.json([ticket_no, cust_id]);

  } catch (err) {
    res.json("Error! Check your input!");
  }
});

app.get('/admin', async (req, res) => {
  try
  {
    const query_str = `
    SELECT
      flight_id,
      departure_airport,
      arrival_airport,
      status
    FROM a7i743.flights
    ORDER BY flight_id;      
    `; 
    const query_result = await pool.query(query_str);
    sql_str+= query_str;
    res.json(query_result.rows);
  } catch (err) {console.log(err.message);}
});

app.get('/admininfo', async (req, res) => {
  try {
    const flight_id = req.param('flight_id');
    const query_str = `
      SELECT
        ticket_no,
        boarding_no,
        seat_no
      FROM a7i743.boarding_passes
      WHERE flight_id = '` + flight_id + `';
    `;

    const query_result = await pool.query(query_str);
    sql_str+= query_str;
    res.json(query_result.rows);
  } catch(err) {console.log(err.message);}
});

app.get('/displaybookings', async (req, res) => {
  try{
    const query_str = `
      SELECT
        book_ref,
        book_date,
        total_amount
      FROM a7i743.bookings;
    `;

    const query_result = await pool.query(query_str);
    sql_str+= query_str;
    console.log(query_result.rows);
    res.json(query_result.rows);
  } catch(err) {console.log(err.message);}
})

app.get('/cust_search', async (req, res) => {
  try{
    const cust_id = req.param('cust_id');
    const query_str = `
      SELECT 
        customer_id,
        customer_name,
        customer_telephone,
        customer_email,
        book_ref,
        family_couple_group,
        card_number,
        route_id
      FROM a7i743.customer
      WHERE customer_id = '` + cust_id + `';
    `;

    const query_result = await pool.query(query_str);
    sql_str+= query_str;
    res.json(query_result.rows); 
  } catch(err) {console.log(err.message);}
})

// app.get('/flight_search', async (req, res) => {
//   try{
//     const flight_id = req.param('flight_id');
//     const query_str = `
//       SELECT 
//         customer_id,
//         customer_name,
//         customer_telephone,
//         customer_email,
//         book_ref,
//         family_couple_group,
//         card_number,
//         route_id
//       FROM a7i743.customer
//       WHERE customer_id = '` + flight_id + `';
//     `;


//     const query_result = await pool.query(query_str);
//     res.json(query_result.rows); 
//   } catch(err) {console.log(err.message);}
// })

app.post('/reset', async (req, res) => {
  try {
    console.log('Reseting...');
    var reset = await pool.query(resetStr);
    res.json("Database reseted!");
  }
  catch (err) {
    res.json("Database failed to be reset.");
    console.log(err.toString());
  }

});

app.delete('/flights/:fullName', async (req, res) => {
  try {
    const { fullName } = req.param;

    let deleteCustomerString = `DELETE FROM a7i743.boarding_passes 
    WHERE a7i743.boarding_passes.ticket_no
      IN (SELECT a7i743.tickets.ticket_no
          FROM a7i743.tickets
            WHERE a7i743.tickets.passenger_name = ${fullName})
    `;
    const deleteCustomer = await pool.query(deleteCustomerString);
    sql_str+= deleteCustomerString;
    res.json(`${fullName} was deleted!`);
  } catch (err) { res.json("Error! Check your input!");}
});

app.delete('/deleteboarding', async (req, res) => {
  try{
    const book_ref = req.param('book_ref');
    const query_str = `
    BEGIN;
      DELETE FROM a7i743.ticket_flights
      WHERE ticket_no IN
        (
          SELECT ticket_no
          FROM a7i743.tickets
          WHERE book_ref = '` + book_ref +  `'
        );

      DELETE FROM a7i743.passenger_check_in
      WHERE ticket_no IN
      (
        SELECT ticket_no
        FROM a7i743.tickets
        WHERE book_ref = '` + book_ref +  `'
      );

      DELETE FROM a7i743.tickets
      WHERE book_ref = '` + book_ref + `';

      DELETE FROM a7i743.payment
      WHERE card_number IN
      (
        SELECT card_number
        FROM a7i743.customer
        WHERE book_ref = '` + book_ref + `'
      );

      DELETE FROM a7i743.customer
      WHERE book_ref = '` + book_ref + `';

      DELETE FROM a7i743.bookings
      WHERE book_ref = '` + book_ref + `';
    COMMIT;`;
    const deleteBooking = await pool.query(query_str);
    sql_str+= query_str;
    res.json('Refund has been processed!');
  } catch(err) {console.log(err.message);}
})

app.get('/checkin/list', async (req, res) => {
  try {
    const ticket_id = req.param('ticket_id');
    var query_str = '';

    if (ticket_id !== "")
    {
      query_str = `
        SELECT DISTINCT a7i743.flights.flight_id,
        a7i743.flights.scheduled_departure,
        a7i743.flights.scheduled_arrival,
        a7i743.tickets.passenger_name,
        a7i743.tickets.seat_no
        FROM a7i743.tickets
        INNER JOIN a7i743.flights
        ON (
          SELECT flight_id
          FROM a7i743.ticket_flights
            WHERE ticket_no = '` + ticket_id + `'
        ) = a7i743.flights.flight_id
        WHERE a7i743.tickets.ticket_no = '` + ticket_id + `'
          ORDER BY flight_id;
      `;
      const boarding_list = await pool.query(query_str);
      sql_str+= query_str;
      console.log('ticket search result:', boarding_list.rows);
      res.json(boarding_list.rows);
    }
  } catch (err) {res.json("Error! Check your input!");}
});
app.get('/getSql', async (req, res) => {
  try {
      res.json(sql_str);
    }
   catch (err) {res.json("Error! Check your input!");}
  });
app.post('/checkin', async (req, res) => {
  try {
    const ticket_id = req.param('ticket_id');
    const luggage_cnt = req.param('luggage_cnt');
    const boarding_no = generate_boarding_no();
    const flight_id = req.param('flight_id');
    const seat_no = req.param('seat_no');



    const queryStr = `
    BEGIN;
      UPDATE a7i743.passenger_check_in
      SET
        luggage_count = ` + luggage_cnt + `,
        passenger_status = 'CHECKED'
      WHERE ticket_no = '` + ticket_id + `';
      
      INSERT INTO a7i743.passenger_boarding
        VALUES (
          '` + ticket_id + `', 'NOTBOARDED'
        );

      INSERT INTO a7i743.boarding_passes
          VALUES (
            '` + ticket_id + `','`
            + flight_id + `','
            ` + boarding_no + `','`
            + seat_no + `'
          );
    COMMIT;`;
    sql_str+= queryStr;
    const passenger_query = await pool.query(queryStr);

    const querystr2 = `
    SELECT
      ticket_no, 
      flight_id, 
      boarding_no, 
      seat_no
    FROM a7i743.boarding_passes
    WHERE ticket_no = '` + ticket_id + `'
    ;`;

    const query_result = await pool.query(querystr2);
    sql_str+= querystr2;
    console.log('display boarding stuff:', query_result.rows)
    res.json(query_result.rows);
  }
  catch (err) {res.json("Error! Check your input!");}
})

app.post('/refundCustomer', async (req, res) => {
  try {
    var cust_id = req.param('cust_id');

    console.log(cust_id);

    const query_str = `
      BEGIN;
        DELETE FROM a7i743.ticket_flights
        WHERE ticket_no IN
        (
          SELECT ticket_no
          FROM a7i743.tickets
          WHERE book_ref = (SELECT book_ref FROM a7i743.customer
                              WHERE customer_id = '` + cust_id + `')
        );

        DELETE FROM a7i743.passenger_check_in
        WHERE ticket_no IN
        (
          SELECT ticket_no
          FROM a7i743.tickets
          WHERE book_ref = (SELECT book_ref FROM a7i743.customer
                              WHERE customer_id = '` + cust_id + `')
        );

      DELETE FROM a7i743.tickets
      WHERE book_ref = '` + book_ref + `';

      DELETE FROM a7i743.payment
      WHERE card_number IN
            (
              SELECT card_number
              FROM a7i743.customer
              WHERE book_ref = '` + book_ref + `'
            );
      
      DELETE FROM a7i743.customer
      WHERE book_ref = '` + book_ref + `';
      
      DELETE FROM a7i743.bookings
      WHERE book_ref = '` + book_ref + `';

      COMMIT;
    `;
    const query_result = await pool.query(query_str);
    sql_str+= query_str;
    res.json("Refund has successfully been processed!");
  } catch(err) {
    console.log(err.message);
    res.json("Refund failed to be processed!");
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function generate_customer_id() {
  customer_id += 1;
  let cust_id_str = customer_id.toString();

  return cust_id_str;
}

function generate_book_ref() {
  book_ref += 1;
  let book_ref_str = book_ref.toString();

  let str_book_temp = '';
  for (i = 0; i < 6 - book_ref_str.length; i++) {
    str_book_temp += '0';
  }
  console.log((str_book_temp + book_ref_str).length)
  return book_ref_str;
}

function generate_ticket_no() {
  var ticket_no_new = 0;
  ticket_no_new = getRandomInt(9999999999999);

  try {
    let generateTicketString = 'SELECT ticket_no FROM a7i743.tickets;';
    const ticket_nos = pool.query(generateTicketString);
    // fs.appendFile('Query.sql', generateTicketString, function (err) {
    //   if (err) throw err;
    // });
    for (i = 0; i < ticket_nos.rows.length; i++) {
      var temp_json = JSON.parse(ticket_nos.rows[i]);
      if (temp_json.ticket_no === ticket_no_new) { ticket_no_new = getRandomInt(9999999999999); }
    }
  } catch (err) { console.log(err.message, err.lineNumber); }
  return ticket_no_new;
}

function generate_passenger_id() {
  var passenger_id_new = 0;
  passenger_id = getRandomInt(99999999999999999999);
  try {
    let generatePassengerStr = 'SELECT passenger_id FROM a7i743.tickets;';
    const passenger_ids = pool.query(generatePassengerStr)
    // fs.appendFile('Query.sql', generatePassengerStr, function (err) {
    //   if (err) throw err;
    // });
    for (i = 0; i < passenger_ids.rows.length; i++) {
      var temp_json = JSON.parse(passenger_ids.rows[i]);
      if (temp_json.passenger_id === passenger_id_new) { passenger_id_new = getRandomInt(9999999999999); }
    }
  } catch (err) { console.log(err.message, err.lineNumber); }

  return passenger_id_new;
}

function generate_seat_no()
{
  var seat_no_new = getRandomInt(999);

  try {
    let generateSeatStr='SELECT seat_no FROM a7i743.tickets;';
    const seat_nos = pool.query(generateSeatStr);

    // fs.appendFile('Query.sql', generateSeatStr, function (err) {
    //   if (err) throw err;
    // });

    if (seat_no.rows === undefined){ return seat_no_new;}
    for (i = 0; i < seat_nos.rows.length; i++) {
      var temp_json = JSON.parse(seat_nos.rows[i]);
      if (temp_json.seat_no === seat_no_new) {
        var seat_no_new = "";
        var seat_num = getRandomInt(99);
        seat_no_new = seat_num;
      }
    }
  } catch (err) { console.log(err.message); }

  return seat_no_new;
}

function generate_boarding_no() {
  var boarding_no_new = getRandomInt(99999999);
  try {
    let generateBoardingStr = 'SELECT boarding_no FROM a7i743.boarding_passes;';
    const boarding_nos = pool.query(generateBoardingStr)
    // fs.appendFile('Query.sql', generateBoardingStr, function (err) {
    //   if (err) throw err;
    // });
    for (i = 0; i < boarding_nos.rows.length; i++) 
    {
      var temp_json = JSON.parse(boarding_nos.rows[i]);
      if (temp_json.boarding_no === boarding_no_new) { boarding_no_new = getRandomInt(99999999); }
    }
  } catch (err) { console.log(err.message); }

  return boarding_no_new;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
console.log(sql_str);
var resetStr = `
SET SCHEMA 'a7i743';

BEGIN;
SET SCHEMA 'a7i743';

DROP TABLE IF EXISTS a7i743.airport CASCADE;

DROP TABLE IF EXISTS a7i743.boarding_passes CASCADE;

DROP TABLE IF EXISTS a7i743.seats CASCADE;

DROP TABLE IF EXISTS a7i743.aircraft CASCADE;

DROP TABLE IF EXISTS a7i743.tickets CASCADE;

DROP TABLE IF EXISTS a7i743.ticket_flights CASCADE;

DROP TABLE IF EXISTS a7i743.bookings CASCADE;

DROP TABLE IF EXISTS a7i743.flights CASCADE;

DROP TABLE IF EXISTS a7i743.aircraft CASCADE;

DROP TABLE IF EXISTS a7i743.customer CASCADE;

DROP TABLE IF EXISTS a7i743.passenger_boarding CASCADE;

DROP TABLE IF EXISTS a7i743.passenger_check_in CASCADE;

DROP TABLE IF EXISTS a7i743.payment CASCADE;

DROP TABLE IF EXISTS a7i743.routes CASCADE;

/*create tables*/
CREATE TABLE a7i743.aircraft(
    aircraft_code char(3),
    model char(25),
    RANGE integer,
    PRIMARY KEY(aircraft_code),
    CONSTRAINT "flights_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES a7i743.aircraft(aircraft_code),
    CONSTRAINT "seats_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES a7i743.aircraft(aircraft_code) ON DELETE CASCADE
);

CREATE TABLE a7i743.airport (
    airport_code char(3) NOT NULL,
    airport_name char(40),
    city char(20),
    coordinates point,
    timezone text,
    PRIMARY KEY (airport_code)
);

CREATE TABLE a7i743.flights (
    flight_id integer NOT NULL,
    flight_no character(6) NOT NULL,
    scheduled_departure timestamp WITH time zone NOT NULL,
    scheduled_arrival timestamp WITH time zone NOT NULL,
    departure_airport character(3) NOT NULL,
    arrival_airport character(3) NOT NULL,
    STATUS character varying(20) NOT NULL,
    aircraft_code character(3) NOT NULL,
    seats_available integer NOT NULL,
    seats_avail_econ integer NOT NULL,
    seats_avail_business integer NOT NULL,
    seats_booked integer NOT NULL,
    actual_departure timestamp WITH time zone,
    actual_arrival timestamp WITH time zone,
    movie character(1) NOT NULL,
    meal character(1) NOT NULL,

    PRIMARY KEY (flight_id),
    CONSTRAINT flights_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES a7i743.aircraft(aircraft_code),
    CONSTRAINT flights_arrival_airport_fkey FOREIGN KEY (arrival_airport) REFERENCES a7i743.airport(airport_code),
    CONSTRAINT flights_departure_airport_fkey FOREIGN KEY (departure_airport) REFERENCES a7i743.airport(airport_code),
    CONSTRAINT flights_check CHECK ((scheduled_arrival > scheduled_departure)),

    CONSTRAINT flights_status_check CHECK (
        (
            (STATUS)::text = ANY (
                ARRAY [('On Time'::character varying)::text, ('Delayed'::character varying)::text, ('Departed'::character varying)::text, ('Arrived'::character varying)::text, ('Scheduled'::character varying)::text, ('Cancelled'::character varying)::text]
            )
        )
    ),
    CONSTRAINT flights_movie_flight CHECK (
        (
            (movie)::text = ANY (
                ARRAY [('0'::character)::text, ('1'::character)::text]
                )
        )
    ),
    CONSTRAINT flights_meal_flight CHECK (
        (
            (meal)::text = ANY (
                ARRAY [('0'::character)::text, ('1'::character)::text]
                )
        )
    )
);

CREATE TABLE a7i743.routes (
    route_id character(10) NOT NULL,
    arrival_airport character(3) NOT NULL,
    departure_airport character(3) NOT NULL,
    intermediate_airport character(3) NOT NULL,
    scheduled_departure timestamp WITH time zone NOT NULL,
    scheduled_arrival timestamp WITH time zone NOT NULL,
    direct_flight character(1) NOT NULL,
    main_flight_id integer NOT NULL,
    intermediate_flight_id integer NOT NULL,
    PRIMARY KEY (route_id),
    CONSTRAINT routes_arrival_airport FOREIGN KEY  (arrival_airport) REFERENCES a7i743.airport(airport_code) ON DELETE CASCADE,
    CONSTRAINT routes_departure_airport FOREIGN KEY  (departure_airport) REFERENCES a7i743.airport(airport_code) ON DELETE CASCADE,
    CONSTRAINT main_flight_id FOREIGN KEY (main_flight_id) REFERENCES a7i743.flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE a7i743.bookings (
    book_ref character(6) NOT NULL,
    book_date timestamp WITH time zone NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    PRIMARY KEY(book_ref)
);

CREATE TABLE a7i743.tickets(
    ticket_no char(13) NOT NULL,
    book_ref character(6) NOT NULL,
    passenger_id varchar(20) NOT NULL,
    passenger_name text NOT NULL,
    seat_no character varying(4) NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT tickets_book_ref_fkey FOREIGN KEY (book_ref) REFERENCES a7i743.bookings(book_ref),
    CONSTRAINT "passenger_check_in_ticket_no" FOREIGN KEY (ticket_no) REFERENCES a7i743.tickets(ticket_no),
    CONSTRAINT "passenger_boarding_ticket_no" FOREIGN KEY (ticket_no) REFERENCES a7i743.tickets(ticket_no)
);

CREATE TABLE a7i743.passenger_check_in(
    ticket_no char(13) NOT NULL,
    passenger_status text NOT NULL,
    luggage_count integer NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT passenger_check_in_ticket_no FOREIGN KEY (ticket_no) REFERENCES a7i743.tickets(ticket_no)
);

CREATE TABLE a7i743.passenger_boarding(
    ticket_no char(13) NOT NULL,
    passenger_status text NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT passenger_boarding_ticket_no FOREIGN KEY (ticket_no) REFERENCES a7i743.tickets(ticket_no)
);

CREATE TABLE a7i743.ticket_flights (
    ticket_no character(13) NOT NULL,
    flight_id integer NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    PRIMARY KEY (ticket_no, flight_id),
    CONSTRAINT "boarding_passes_ticket_no_fkey" FOREIGN KEY (ticket_no, flight_id) REFERENCES a7i743.ticket_flights(ticket_no, flight_id),
    CONSTRAINT ticket_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES a7i743.flights(flight_id),
    CONSTRAINT ticket_flights_ticket_no_fkey FOREIGN KEY (ticket_no) REFERENCES a7i743.tickets(ticket_no),
    CONSTRAINT ticket_flights_fare_conditions_check CHECK (
        (
            (fare_conditions)::text = ANY (
                ARRAY [('Economy'::character varying)::text, ('Comfort'::character varying)::text, ('Business'::character varying)::text]
            )
        )
    )
);

CREATE TABLE a7i743.boarding_passes (
    ticket_no character(13) NOT NULL,
    flight_id integer NOT NULL,
    boarding_no integer NOT NULL,
    seat_no character varying(4) NOT NULL,
    PRIMARY KEY(ticket_no, flight_id),
    CONSTRAINT boarding_passes_ticket_no_fkey FOREIGN KEY (ticket_no, flight_id) REFERENCES a7i743.ticket_flights(ticket_no, flight_id)
);

CREATE TABLE a7i743.payment (
    card_number character(16) NOT NULL,
    taxes integer NOT NULL,
    discount integer NOT NULL,
    total_amount integer NOT NULL,
    PRIMARY KEY (card_number)
);

CREATE TABLE a7i743.customer (
    customer_id character(8) NOT NULL,
    customer_name character(25) NOT NULL,
    customer_telephone character(10) NOT NULL,
    customer_email character(255) NOT NULL,
    book_ref character(6) NOT NULL,
    family_couple_group character(1) NOT NULL,
    card_number character(16) NOT NULL,
    route_id character(10) NOT NULL,

    PRIMARY KEY (customer_id),
    CONSTRAINT customer_book_ref FOREIGN KEY (book_ref) REFERENCES a7i743.bookings(book_ref),
    CONSTRAINT customer_card_number FOREIGN KEY (card_number) REFERENCES a7i743.payment(card_number) ON DELETE CASCADE
);


CREATE TABLE a7i743.seats (
    aircraft_code character(3) NOT NULL,
    seat_no character varying(4) NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    PRIMARY KEY (aircraft_code, seat_no),
    CONSTRAINT seats_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code) ON DELETE CASCADE,
    CONSTRAINT seats_fare_conditions_check CHECK (
        (
            (fare_conditions)::text = ANY (
                ARRAY [('Economy'::character varying)::text, ('Comfort'::character varying)::text, ('Business'::character varying)::text]
            )
        )
    )
);

INSERT INTO a7i743.airport
VALUES (
        'HOU',
        'George Bush Airport',
        'Houston',
        NULL,
        'CT'
    );

INSERT INTO a7i743.airport
VALUES (
        'JFK',
        'John F Kennedy Airport',
        'New York',
        NULL,
        'ET'
    );

INSERT INTO a7i743.airport
VALUES (
        'LAX',
        'Los Angeles Airport',
        'Los Angeles',
        NULL,
        'PT'
    );

INSERT INTO a7i743.airport
VALUES (
        'PVG',
        'Shanghai Pudong International Airport',
        'Shanghai',
        NULL,
        'CST'
        );

INSERT INTO a7i743.airport
VALUES ('ORD', 'O Hare Airport', 'Chicago', NULL, 'CT');

INSERT INTO a7i743.airport
VALUES ('MIA', 'Miami Airport', 'Miami', NULL, 'ET');

INSERT INTO a7i743.aircraft
VALUES ('773', 'Boeing 777-300', 11100);

INSERT INTO a7i743.aircraft
VALUES ('763', 'Boeing 767-300', 7900);

INSERT INTO a7i743.aircraft
VALUES ('SU9', 'Boeing 777-300', 5700);

INSERT INTO a7i743.aircraft
VALUES ('320', 'Boeing 777-300', 6400);

INSERT INTO a7i743.aircraft
VALUES ('321', 'Boeing 777-300', 6100);

INSERT INTO a7i743.flights
VALUES (
       1001,
       'PG0010',
       '2020-11-10 09:50:00+03',
       '2020-11-10 14:55:00+03',
       'HOU',
       'JFK',
       'Scheduled',
       '773',
           50,
            10,
            40,
           0,
        NULL,
        NULL,
        '1',
        '1'
   );

INSERT INTO a7i743.flights
VALUES (
     1002,
     'PG0020',
     '2020-11-11 09:50:00+03',
     '2020-11-11 15:55:00+03',
     'LAX',
     'JFK',
     'Scheduled',
     '763',
     50,
     20,
     30,
     0,
     NULL,
	 NULL,
    '1',
    '0'
   );

INSERT INTO a7i743.flights
VALUES (
        1003,
        'PG0030',
        '2020-11-10 11:50:00+03',
        '2020-12-11 09:50:00+03',
        'JFK',
        'PVG',
        'Scheduled',
        '773',
        50,
        20,
        30,
        0,
        NULL,
        NULL,
        '1',
        '1'
);

INSERT INTO a7i743.routes
VALUES (
    '1',
    'JFK',
    'HOU',
    'NAN',
    '2020-11-10 09:50:00+03',
    '2020-11-10 14:55:00+03',
    '1',
    1001,
    -1
);

INSERT INTO a7i743.routes
VALUES (
    '2',
    'JFK',
    'LAX',
    'NAN',
    '2020-11-11 09:50:00+03',
    '2020-11-11 15:55:00+03',
    '1',
    1002,
    -1
);

INSERT INTO a7i743.routes
VALUES (
        '3',
        'PVG',
        'HOU',
        'JFK',
        '2020-11-11 09:50:00+03',
        '2020-12-11 09:50:00+03',
        '1',
        1001,
        1003
       );

INSERT INTO a7i743.seats
VALUES ('773', '001', 'Comfort');

INSERT INTO a7i743.seats
VALUES ('773', '050', 'Economy');

COMMIT;`;