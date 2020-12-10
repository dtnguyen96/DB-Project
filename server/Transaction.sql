
    BEGIN;
      INSERT INTO payment 
        VALUES(1111111111111111, 30, 15, 130);
      
      INSERT INTO bookings 
      VALUES  ('1', CURRENT_TIMESTAMP, cast(130 as NUMERIC(10,2)));
      
      INSERT INTO customer 
        VALUES (00000001, 'nr' , 1281865815,'neriyahbutler21@gmail.com', '1', '0', '1111111111111111', '1');

      INSERT INTO tickets 
    VALUES ('1308896242003','1','0','1281865815','830');INSERT INTO passenger_check_in
    VALUES ('1308896242003', 'NOTCHECKED',0);INSERT INTO ticket_flights
    VALUES ('1308896242003','1001','Economy');UPDATE flights SET seats_available = seats_available - 1, seats_avail_econ = seats_avail_econ - 1, seats_booked = seats_booked + 1 WHERE flight_id = 1001;
        COMMIT;