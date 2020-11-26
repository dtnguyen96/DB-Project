let flight_info_storage = []

async function fetchFlights() {
    var depature_location = document.getElementById('flying_from').value;
    var arrival_location = document.getElementById('flying_to').value;
    var depature_time = document.getElementById('depature_time').value
    var arrival_time = document.getElementById('arrival_time').value;
    var fare_condition = document.getElementById('fare_condition').value;
    var adult_cnt = document.getElementById('adult_cnt').value;
    var child_cnt = document.getElementById('child_cnt').value;

    const flight_info = 
        [depature_location,
        arrival_location,
        depature_time,
        arrival_time,
        fare_condition,
        adult_cnt,
        child_cnt]

    try {
        // const body = {description: flight_info};
        const response = await fetch(`http://localhost:5000/flights/?dloc=${flight_info[0]}&aloc=${flight_info[1]}&dtime=${flight_info[2]}&atime=${flight_info[3]}&f_cond=${flight_info[4]}&a_cnt=${flight_info[5]}&c_cnt=${flight_info[6]}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })
        loadFlights(flight_info);
        return false;
    } catch (err) { console.log(err.message);}
}

const setFlights = (data) => {
    console.log("This is the data returned: " + data);
    flight_info_storage = data;
}

async function loadFlights(flight_info) {
    try{
        const response = await fetch(`http://localhost:5000/flights/?dloc=${flight_info[0]}&aloc=${flight_info[1]}&dtime=${flight_info[2]}&atime=${flight_info[3]}&f_cond=${flight_info[4]}&a_cnt=${flight_info[5]}&c_cnt=${flight_info[6]}`);
        const jsonData = await response.json();

        setFlights(jsonData);
        displayFlights();

        return false;
    } catch (err){ console.log(err.message);}
}

const displayFlights = () => {
    const flight_table = document.getElementById('table_display');

    let tableHTML = "";
    flight_info_storage.map(f_table => {
        var movie_bool = "Yes";
        var meal_bool = "Yes";

        if (f_table.movie == '0'){ movie_bool = "No";}
        if (f_table.meal_bool == '0'){ meal_bool = "No";}

        tableHTML += 
        `<tr>
            <th>FLIGHT ${f_table.flight_id}</th>
            <th>${f_table.departure_airport} TO ${f_table.arrival_airport}</th>
            <th>${f_table.scheduled_departure} TO ${f_table.scheduled_arrival}</th>
            <th>Movie: ${movie_bool}</th>
            <th>Meal: ${meal_bool}</th>
            <th><button class='submit-btn'>Book</button></th>
        </tr>`;
    });
    flight_table.innerHTML = tableHTML;
}