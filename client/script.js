let flight_info_storage = []
let admin_pass = ""
let admin_generate = false;

async function fetchFlights() {
    var depature_location = document.getElementById('flying_from').value;
    var arrival_location = document.getElementById('flying_to').value;
    var depature_time = document.getElementById('depature_time').value
    var arrival_time = document.getElementById('arrival_time').value;
    var fare_condition = document.getElementById('fare_condition').value;
    var adult_cnt = document.getElementById('adult_cnt').value;
    var child_cnt = document.getElementById('child_cnt').value;

    var roundtrip = '';

    if (document.getElementById('one-way').checked === true){ roundtrip = '1';}
    if (document.getElementById('roundtrip').cheked === true){ roundtrip = '0';}

    const flight_info = 
        [depature_location,
        arrival_location,
        depature_time,
        arrival_time,
        fare_condition,
        adult_cnt,
        child_cnt,
        roundtrip
    ]

    try {
        loadFlights(flight_info, "");
        return false;
    } catch (err) { console.log(err.message);}
}

const setFlights = (data) => {
    console.log("This is the data returned: " + data);
    flight_info_storage = data;
}

async function loadFlights(flight_info, type) {
    try{
        const response = await fetch(`http://localhost:5000/flights/?dloc=${flight_info[0]}&aloc=${flight_info[1]}&dtime=${flight_info[2]}&atime=${flight_info[3]}&f_cond=${flight_info[4]}&a_cnt=${flight_info[5]}&c_cnt=${flight_info[6]}&round=${flight_info[7]}`);
        const jsonData = await response.json();

        setFlights(jsonData);
        if (type != "admin"){displayFlights();}
        else {displayFlightsAdmin();}

        return false;
    } catch (err){ console.log(err.message);}
}

const displayFlightsAdmin = () => {
    const flight_table = document.getElementById('list');

    let btnHTML = "";
    if (!admin_generate)
    {
        flight_info_storage.map(f_table => {
            btnHTML += 
            `<button class='submit-btn'>
                <div>${f_table.flight_id}</div>
                <div>${f_table.departure_airport} TO ${f_table.arrival_airport}</div>
            </button>
            `
        });
        flight_table.innerHTML += btnHTML;
        admin_generate = true;
    }
}

const displayFlights = () => {
    const flight_table = document.getElementById('table_display');

    let tableHTML = "";
    if (flight_info_storage.length === 0){console.log('zerooo');}
    flight_info_storage.map(f_table => {
        var movie_bool = "Yes";
        var meal_bool = "Yes";
        var direct_flight = "Yes";

        if (f_table.movie === '0'){ movie_bool = "No";}
        if (f_table.meal === '0'){ meal_bool = "No";}
        if (f_table.direct_flight === '0'){ direct_flight = "No";}


        tableHTML += 
        `<tr>
            <th>${f_table.flight_id}</th>
            <th>${f_table.departure_airport} TO ${f_table.arrival_airport}</th>
            <th>${f_table.scheduled_departure} TO ${f_table.scheduled_arrival}</th>
            <th>${movie_bool}</th>
            <th>${meal_bool}</th>
            <th>${direct_flight}</th>
            <th><button class='submit-btn_submit' onclick="slide_function()">Book</button></th>
        </tr>`;
    });
    flight_table.innerHTML += tableHTML;
    if (flight_table.innerHTML == 
        `<tbody><tr>
        <th>Flight</th>
        <th>Flight Route</th>
        <th>Time Frame</th>
        <th>Movie(s)</th>
        <th>Meal(s)</th>
        <th>Direct Flight</th> 
    </tr>
</tbody>`){ document.getElementById('error-msg').innerHTML = 'Bad input received!';}
}

var container = document.getElementById('container_slide');
var next = document.getElementById('check_flights_btn');
var prev = document.getElementById('flight_back_btn');
var back_list = document.getElementById('back_button2');

var body = document.getElementById("body_tag");
var html_obj = document.getElementById("html_tag");

var admin_btn = document.getElementById('submit-admin-btn');
var admin_back_btn = document.getElementById('btn-admin-back');

next.onclick = function(event){
    fetchFlights();
    container.classList.add("next");
}

function slide_function(){
    container.classList.add("pay");
    body.style.overflow = "inherit";
    html_obj.style.overflow = "inherit";
    
}

back_list.onclick = function(event){
    body.style.overflow = "hidden";
    html_obj.style.overflow = "hidden";
    container.classList.remove("pay");
}

prev.onclick = function(event){
    container.classList.remove("next");
    document.getElementById("table_display").innerHTML = `<tr>
    <th>Flight</th>
    <th>Flight Route</th>
    <th>Time Frame</th>
    <th>Movie(s)</th>
    <th>Meal(s)</th>
    <th>Direct Flight</th>
</tr>`;
    document.getElementById('error-msg').innerHTML = '';
}

admin_btn.onclick = function(){
    var userinput = document.getElementById('loginform').value;
    
    if (userinput === "123" || admin_pass === "123")
    {
        admin_pass = userinput;
        generate_flight_button();
        container.classList.add("admin");
    }
}

admin_back_btn.onclick = function(){
    container.classList.remove("admin");
}

function generate_flight_button(){
    const flight_info = 
        ["",
        "",
        "",
        "",
        "",
        0,
        0,
        ""
        ]
    loadFlights(flight_info, "admin");
}