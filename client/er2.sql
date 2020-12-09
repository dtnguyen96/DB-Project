DROP TABLE IF EXISTS airport CASCADE;

DROP TABLE IF EXISTS boarding_passes CASCADE;

DROP TABLE IF EXISTS seats CASCADE;

DROP TABLE IF EXISTS aircraft CASCADE;

DROP TABLE IF EXISTS tickets CASCADE;

DROP TABLE IF EXISTS ticket_flights CASCADE;

DROP TABLE IF EXISTS bookings CASCADE;

DROP TABLE IF EXISTS flights CASCADE;

DROP TABLE IF EXISTS aircraft CASCADE;

DROP TABLE IF EXISTS customer CASCADE;

DROP TABLE IF EXISTS customer_boarding CASCADE;

DROP TABLE IF EXISTS customer_check_in CASCADE;

DROP TABLE IF EXISTS payment CASCADE;

DROP TABLE IF EXISTS routes CASCADE;

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
    actual_departure timestamp WITH time zone,
    actual_arrival timestamp WITH time zone,
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

CREATE TABLE routes (
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
    CONSTRAINT routes_arrival_airport FOREIGN KEY  (arrival_airport) REFERENCES airport(airport_code) ON DELETE CASCADE,
    CONSTRAINT routes_departure_airport FOREIGN KEY  (departure_airport) REFERENCES airport(airport_code) ON DELETE CASCADE,
    CONSTRAINT main_flight_id FOREIGN KEY (main_flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    book_ref character(6) NOT NULL,
    book_date timestamp WITH time zone NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    PRIMARY KEY(book_ref)
);

CREATE TABLE tickets(
    ticket_no char(13) NOT NULL,
    book_ref character(6) NOT NULL,
    passenger_id varchar(20) NOT NULL,
    passenger_name text NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT tickets_book_ref_fkey FOREIGN KEY (book_ref) REFERENCES bookings(book_ref)
);

CREATE TABLE ticket_flights (
    ticket_no character(13) NOT NULL,
    flight_id integer NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    PRIMARY KEY (ticket_no, flight_id),
    CONSTRAINT "boarding_passes_ticket_no_fkey" FOREIGN KEY (ticket_no, flight_id) REFERENCES ticket_flights(ticket_no, flight_id),
    CONSTRAINT ticket_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    CONSTRAINT ticket_flights_ticket_no_fkey FOREIGN KEY (ticket_no) REFERENCES tickets(ticket_no),
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
    route_id character(10) NOT NULL,

    PRIMARY KEY (customer_id),
    CONSTRAINT customer_book_ref FOREIGN KEY (book_ref) REFERENCES bookings(book_ref),
    CONSTRAINT customer_card_number FOREIGN KEY (card_number) REFERENCES payment(card_number) ON DELETE CASCADE
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
VALUES (
        'PVG',
        'Shanghai Pudong International Airport',
        'Shanghai',
        NULL,
        'CST'
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
    '0'
   );

INSERT INTO flights
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

INSERT INTO routes
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

INSERT INTO routes
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

INSERT INTO routes
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

INSERT INTO seats
VALUES ('773', '001', 'Comfort');

INSERT INTO seats
VALUES ('773', '050', 'Economy');



--       SELECT arrival_airport,
--         intermediate_airport,
--         departure_airport,
--         main_flight_id,
--         intermediate_flight_id
--       FROM routes
--       WHERE routes.departure_airport = 'HOU'
--       AND
--       routes.arrival_airport = 'PVG'
--       AND
--       main_flight_id IN
--         (SELECT flight_id
--           FROM flights
--           WHERE
--             seats_avail_econ >= 1
--             AND
--             movie = '1'
--             AND
--             meal = '1')