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
        const body = {description: flight_info};
        const response = await fetch('http://localhost:5000/flights', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })
    } catch (err) { console.log(err.message);}
}