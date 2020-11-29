DROP TABLE IF EXISTS airport CASCADE;

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