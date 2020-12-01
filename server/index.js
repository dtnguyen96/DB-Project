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
app.get('/flights', async (req, res) => {
  try {
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
    else if (isEmpty(d_loc) === false && isEmpty(a_loc) === false && (isEmpty(d_time) || isEmpty(a_time))) {
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
    else {
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
  } catch (err) { console.log(err.message); }
});
//Send payment data to db
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

    const cust_id = generate_customer_id();

    const book_ref_temp = generate_book_ref();

    let group_travel_bool = '0';

    if (groupTravel === true) { group_travel_bool = '1'; }

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

      console.log(`INSERT INTO ticket_flights
      VALUES ('` + ticket_no +  `','` + flight_id + `','` + fare_condition +  `');`);

      queryCust += `INSERT INTO ticket_flights
      VALUES ('` + ticket_no +  `','` + flight_id + `','` + fare_condition +  `');`;
    }

    const newPayment = await pool.query(`
    BEGIN;
      INSERT INTO payment 
        VALUES(${cardNum}, ${tax}, 15, ${total_amount});
      
      INSERT INTO bookings 
      VALUES  ('` + book_ref_temp + `', CURRENT_TIMESTAMP, cast(${total_amount} as NUMERIC(10,2)));
      
      INSERT INTO customer 
        VALUES (${cust_id}, '` + fname + `' , ${phoneNumber},'` + email + `', '` + book_ref_temp + `', '` + group_travel_bool + `', '` + cardNum + `');

      ` + queryCust + `
        COMMIT;`);

    console.log(newPayment.rows);             
  } catch(err){
    console.log(err.message, err.lineNumber);
  }
});
app.post('/reset', async (req, res) => {
  try {
    var reset = await pool.query(resetStr);
  }
  catch (err) {
    console.log(err.message, err.lineNumber);
  }

});
app.listen(5000, () => {
  console.log("server has started on port 5000");
});

app.delete('/flights/:fullName', async (req, res) => {
  try {
    const { fullName } = req.param;
    const deleteCustomer = await pool.query(
      `DELETE FROM boarding_passes 
        WHERE boarding_passes.ticket_no
          IN (SELECT tickets.ticket_no
              FROM tickets
                WHERE tickets.passenger_name = ${fullName})
        `);
    res.json(`${fullName} was deleted!`);
  } catch (err) { console.log(err.message, err.lineNumber); }
});

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function generate_customer_id() {
  customer_id += 1;
  let cust_id_str = customer_id.toString();

  let str_num_temp = '';
  for (i = 0; i < 8 - cust_id_str.length; i++) {
    str_num_temp += '0';
  }
  return str_num_temp + cust_id_str;
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
    const ticket_nos = pool.query('SELECT ticket_no FROM tickets;');
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
    const passenger_ids = pool.query('SELECT passenger_id FROM tickets;')
    for (i = 0; i < passenger_ids.rows.length; i++) {
      var temp_json = JSON.parse(passenger_ids.rows[i]);
      if (temp_json.passenger_id === passenger_id_new) { passenger_id_new = getRandomInt(9999999999999); }
    }
  } catch (err) { console.log(err.message, err.lineNumber); }

  return passenger_id_new;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
var resetStr = `DROP TABLE IF EXISTS airport CASCADE;
 
DROP TABLE IF EXISTS boarding_passes CASCADE;

DROP TABLE IF EXISTS seats CASCADE;

DROP TABLE IF EXISTS aircraft CASCADE;

DROP TABLE IF EXISTS ticket CASCADE;

DROP TABLE IF EXISTS ticket_flights CASCADE;

DROP TABLE IF EXISTS bookings CASCADE;

DROP TABLE IF EXISTS flights CASCADE;

DROP TABLE IF EXISTS aircraft CASCADE;

DROP TABLE IF EXISTS customer CASCADE;

DROP TABLE IF EXISTS payment CASCADE;

/*create tables*/
CREATE TABLE aircraft(
    aircraft_code char(3),
    model char(25),
    RANGE integer,
    PRIMARY KEY(aircraft_code),
    CONSTRAINT "flights_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code),
    CONSTRAINT "seats_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code) ON DELETE CASCADE
);

CREATE TABLE airport (
    airport_code char(3) NOT NULL,
    airport_name char(40),
    city char(20),
    coordinates point,
    timezone text,
    PRIMARY KEY (airport_code)
);

CREATE TABLE flights (
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
    actual_depature timestamp WITH time zone,
    actual_arrival timestamp WITH time zone,
    direct_flight character(1) NOT NULL,
    movie character(1) NOT NULL,
    meal character(1) NOT NULL,
    PRIMARY KEY (flight_id),
    CONSTRAINT flights_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code),
    CONSTRAINT flights_arrival_airport_fkey FOREIGN KEY (arrival_airport) REFERENCES airport(airport_code),
    CONSTRAINT flights_departure_airport_fkey FOREIGN KEY (departure_airport) REFERENCES airport(airport_code),
    CONSTRAINT flights_check CHECK ((scheduled_arrival > scheduled_departure)),

    CONSTRAINT flights_status_check CHECK (
        (
            (STATUS)::text = ANY (
                ARRAY [('On Time'::character varying)::text, ('Delayed'::character varying)::text, ('Departed'::character varying)::text, ('Arrived'::character varying)::text, ('Scheduled'::character varying)::text, ('Cancelled'::character varying)::text]
            )
        )
    ),
    CONSTRAINT flights_direct_flight CHECK (
        (
            (direct_flight)::text = ANY (
                ARRAY [('0'::character)::text, ('1'::character)::text]
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

CREATE TABLE bookings (
    book_ref character(6) NOT NULL,
    book_date timestamp WITH time zone NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    PRIMARY KEY(book_ref)
);

CREATE TABLE ticket(
    ticket_no char(13) NOT NULL,
    book_ref character(6) NOT NULL,
    passenger_id varchar(20) NOT NULL,
    passenger_name text NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT "tickets_book_ref_fkey" FOREIGN KEY (book_ref) REFERENCES bookings(book_ref)
);

CREATE TABLE ticket_flights (
    ticket_no character(13) NOT NULL,
    flight_id integer NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    PRIMARY KEY (ticket_no, flight_id),
    CONSTRAINT ticket_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    CONSTRAINT ticket_flights_ticket_no_fkey FOREIGN KEY (ticket_no) REFERENCES ticket(ticket_no),
    CONSTRAINT ticket_flights_fare_conditions_check CHECK (
        (
            (fare_conditions)::text = ANY (
                ARRAY [('Economy'::character varying)::text, ('Comfort'::character varying)::text, ('Business'::character varying)::text]
            )
        )
    )
);

CREATE TABLE boarding_passes (
    ticket_no character(13) NOT NULL,
    flight_id integer NOT NULL,
    boarding_no integer NOT NULL,
    seat_no character varying(4) NOT NULL,
    PRIMARY KEY(ticket_no, flight_id),
    CONSTRAINT boarding_passes_ticket_no_fkey FOREIGN KEY (ticket_no, flight_id) REFERENCES ticket_flights(ticket_no, flight_id)
);

CREATE TABLE payment (
    card_number character(16) NOT NULL,
    taxes integer NOT NULL,
    discount integer NOT NULL,
    total_amount integer NOT NULL,
    PRIMARY KEY (card_number)
);

CREATE TABLE customer (
    customer_id character(8) NOT NULL,
    customer_name character(25) NOT NULL,
    customer_telephone character(10) NOT NULL,
    customer_email character(255) NOT NULL,
    book_ref character(6) NOT NULL,
    family_couple_group character(1) NOT NULL,
    card_number character(16) NOT NULL,
    PRIMARY KEY (customer_id),
    CONSTRAINT customer_book_ref FOREIGN KEY (book_ref) REFERENCES bookings(book_ref),
    CONSTRAINT customer_card_number FOREIGN KEY (card_number) REFERENCES payment(card_number)
);


CREATE TABLE seats (
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

INSERT INTO airport
VALUES (
        'HOU',
        'George Bush Airport',
        'Houston',
        NULL,
        'CT'
    );

INSERT INTO airport
VALUES (
        'JFK',
        'John F Kennedy Airport',
        'New York',
        NULL,
        'ET'
    );

INSERT INTO airport
VALUES (
        'LAX',
        'Los Angeles Airport',
        'Los Angeles',
        NULL,
        'PT'
    );

INSERT INTO airport
VALUES ('ORD', 'O Hare Airport', 'Chicago', NULL, 'CT');

INSERT INTO airport
VALUES ('MIA', 'Miami Airport', 'Miami', NULL, 'ET');

INSERT INTO aircraft
VALUES ('773', 'Boeing 777-300', 11100);

INSERT INTO aircraft
VALUES ('763', 'Boeing 767-300', 7900);

INSERT INTO aircraft
VALUES ('SU9', 'Boeing 777-300', 5700);

INSERT INTO aircraft
VALUES ('320', 'Boeing 777-300', 6400);

INSERT INTO aircraft
VALUES ('321', 'Boeing 777-300', 6100);

INSERT INTO flights
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
        '1',
        '1'
   );

INSERT INTO flights
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
    '0',
    '1'
   );

INSERT INTO seats
VALUES ('773', '001', 'Comfort');

INSERT INTO seats
VALUES ('773', '050', 'Economy');`;
