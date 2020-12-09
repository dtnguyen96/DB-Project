SELECT flight_id, 
      scheduled_departure, 
      scheduled_arrival, 
      departure_airport, 
      arrival_airport, 
      direct_flight, 
      movie, 
      meal 
        FROM flights
        WHERE seats_available >= 0