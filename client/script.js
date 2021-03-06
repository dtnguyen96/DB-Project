let flight_info_storage = []

let adult_count = 0
let child_count = 0

let adult_cost = 100
let child_cost = 60

let admin_pass = ""
let admin_generate = false;

let fare_cond = "";
let flight_id = "";
let flight_id_2 = "";

let route_id = "";

let movie_global = "Yes";
let meal_global = "Yes";

let flight_id_buffer = []

async function fetchFlights() {
    var depature_location = document.getElementById('flying_from').value;
    var arrival_location = document.getElementById('flying_to').value;
    var depature_time = document.getElementById('depature_time').value
    var arrival_time = document.getElementById('arrival_time').value;
    var fare_condition = document.getElementById('fare_condition').value;
    var adult_cnt = document.getElementById('adult_cnt').value;
    var child_cnt = document.getElementById('child_cnt').value;
    var movie = document.getElementById('movie').value;
    var meal = document.getElementById('meal').value;

    movie_global = movie;
    meal_global = meal;

    adult_count = Number(adult_cnt);
    child_count = Number(child_cnt);
    fare_cond = fare_condition;

    console.log(adult_count, child_count) 

    if (document.getElementById('one-way').checked === true) { roundtrip = '1'; }
    if (document.getElementById('roundtrip').checked === true) { roundtrip = '0'; }

    const flight_info =
        [depature_location,
            arrival_location,
            depature_time,
            arrival_time,
            fare_condition,
            adult_cnt,
            child_cnt,
            roundtrip,
            movie,
            meal
        ]

    console.log(flight_info);

    try {
       loadFlights(flight_info, "");
       return false;
    } catch (err) { console.log(err.message); }
    
}


async function fetchPayment() {
    var fullName = document.getElementById('fname').value;
    var email = document.getElementById('email').value;
    var adult_cnt = document.getElementById('adult_cnt').value;
    var child_cnt = document.getElementById('child_cnt').value;
    var cardNum = document.getElementById('ccnum').value;
    var ticket_cnt = Number(adult_cnt) + Number(child_cnt);
    var total_amount = Number(document.getElementById('total-amount').innerText.split('$')[1]);
    var phoneNumber = document.getElementById('phone').value;
    var tax_string = document.getElementById('tax').innerText;
    var tax= Number(tax_string.split(" ")[1].split("$")[1]);
    var groupTravel = false;
    var grouptCnt = adult_count + child_count;
    var cust_names = []

    console.log(ticket_cnt);
    console.log(tax);
    if (ticket_cnt > 1){
        groupTravel=true;
    }

    for (i = 0; i < grouptCnt - 1; i++)
    {
        cust_names.push(document.getElementById(`passenger` + i).val);
    }

    const payment_info=[
        fullName,
        email,
        cardNum,
        total_amount,
        phoneNumber,
        tax,
        groupTravel,
        grouptCnt
    ];

    console.log(payment_info);

    try{
        const response = await fetch(`http://localhost:5000/flights/?fname=${payment_info[0]}&email=${payment_info[1]}&cardNum=${payment_info[2]}&total_amount=${payment_info[3]}&phoneNumber=${payment_info[4]}&tax=${payment_info[5]}&groupTravel=${payment_info[6]}&groupCnt=${payment_info[7]}&custName=${cust_names}&fare_cond=${fare_cond}&flight_id=${flight_id}&flight_id_2=${flight_id_2}&route_id=${route_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        
        const jsonData = await response.json();
        var error_display = document.getElementById('error_display');

        console.log(jsonData);

        error_display.innerHTML = `Your ticket # is ${jsonData[0]} and your customer id is ${jsonData[1]}, please save it!`;

        return false;
    } catch (err) { console.log(err.message); }
}

const setFlights = (data) => {
    console.log("This is the data returned: " + data);
    flight_info_storage = data;
}

async function loadFlights(flight_info, type) {
    try{
        const response = await fetch(`http://localhost:5000/flights/?dloc=${flight_info[0]}&aloc=${flight_info[1]}&dtime=${flight_info[2]}&atime=${flight_info[3]}&f_cond=${flight_info[4]}&a_cnt=${flight_info[5]}&c_cnt=${flight_info[6]}&round=${flight_info[7]}&movie=${flight_info[8]}&meal=${flight_info[9]}`);
        const jsonData = await response.json();

        setFlights(jsonData);
        displayFlights();

        return false;
    } catch (err) { console.log(err.message); }
}

async function loadFlightsAdmin() {
    try
    {
        const response = await fetch(`http://localhost:5000/admin`);
        const jsonData = await response.json();

        flight_info_storage = jsonData;
        displayFlightsAdmin();
    } catch(err) {console.log(err.message);}
}

async function loadBookings() {
    try{
        const response = await fetch('http://localhost:5000/displaybookings');
        const jsonData = await response.json();

        flight_info_storage = jsonData;
        displayBookings();
    } catch(err) {console.log(err.message);}
}

async function loadFlightInfoAdmin(flight_id) {
    try {
        const response = await fetch(`http://localhost:5000/admininfo/?flight_id=${flight_id}`);
        const jsonData = await response.json();

        flight_info_storage = jsonData;
        displayFlightInfoAdmin();
    } catch(err) { console.log(err.message);}
}

async function deleteBooking() {
    const book_ref = document.getElementById('refund_value').value;
    console.log(book_ref);
    const response = await fetch(`http://localhost:5000/deleteboarding/?book_ref=${book_ref}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    const jsonData = response.json();
    
    // const info_table = document.getElementById('result-display-table');
    // info_table.innerHTML = jsonData
}

const displayBookings = () => {
    try {
        const info_table = document.getElementById('result-display-table');
        let tableHTML = `
            <tr>
                <th>Book Ref</th>
                <th>Book Date</th>
                <th>Total Amount</th>
            </tr>
        `;
        if (flight_info_storage.length === 0) { info_table.innerHTML += "Query returned nothing";}
        flight_info_storage.map(b_table => {
            tableHTML += `
                <tr>
                    <th>${b_table.book_ref}</th>
                    <th>${b_table.book_date}</th>
                    <th>${b_table.total_amount}</th>
                </tr>
            `;
        });
        info_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

const displayFlightInfoAdmin = () => {
    try {
        const info_table = document.getElementById('result-display-table');
        let tableHTML = `
            <tr>
                <th>Ticket #</th>
                <th>Boarding #</th>
                <th>Seat #</th>
            </tr>
        `;
        if (flight_info_storage.length === 0) { info_table.innerHTML += "Query returned nothing";}
        flight_info_storage.map(i_table => {
            tableHTML += `
                <tr>
                    <th>${i_table.ticket_no}</th>
                    <th>${i_table.boarding_no}</th>
                    <th>${i_table.seat_no}</th>
                </tr>
            `;
        });
        info_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

const displayFlightsAdmin = () => {
    const flight_table = document.getElementById('list');

    let btnHTML = "";
    if (admin_generate === false)
    {
        flight_info_storage.map(f_table => {
            btnHTML += 
            `<button class='submit-btn' onclick='loadFlightInfoAdmin("` + f_table.flight_id + `")'>
                <div>${f_table.flight_id}</div>
                <div>${f_table.departure_airport} → ${f_table.arrival_airport}</div>
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
    if (flight_info_storage.length === 0) { 
        flight_table.innerHTML += "Query returned nothing, make sure the airports are valid!";
    }
    flight_info_storage.map(f_table => {
        var movie_bool = "Yes";
        var meal_bool = "Yes";

        var inter_airport = ``;
        
        if (f_table.intermediate_airport != "NAN") {
            inter_airport = `${f_table.intermediate_airport} →`;
        }

        tableHTML +=
            `<tr>
            <th>${f_table.departure_airport} → ` + inter_airport +  `${f_table.arrival_airport}</th>
            <th>${f_table.scheduled_departure} TO ${f_table.scheduled_arrival}</th>
            <th>${movie_global}</th>
            <th>${meal_global}</th>
            <th><button class='submit-btn_submit' onclick="slide_function(\'` + f_table.main_flight_id + `\' ,\'` + f_table.intermediate_flight_id + `\' ,\'` + f_table.route_id.trim() + `\')"}>Book</button></th>
        </tr>`;
    });
    flight_table.innerHTML += tableHTML;
    if (flight_table.innerHTML ==
        `<tr>
        <th>Flight Route</th>
        <th>Time Frame</th>
        <th>Movie(s)</th>
        <th>Meal(s)</th>
    </tr>`) { document.getElementById('error-msg').innerHTML = 'Bad input received!'; }
}

const displayCart = () => {
    let extra_pass = document.getElementById('extra_passengers');

    var cart = document.getElementById("cart-description");
    var total_price = document.getElementById("total-amount");

    let cartHTML =  "";
    let passengerHTML = "";
    
    if (adult_count > 0) { cartHTML += `<p>Adult ticket x${adult_count}<span class="price">$${adult_count*adult_cost}</span></p>`}
    if (child_count > 0) { cartHTML += `<p>Children ticket x${child_count}<span class="price">$${child_count*child_cost}</span></p>`}
    cartHTML += `<p id='tax'>Tax $${((adult_count*adult_cost + child_count*child_cost)*0.30).toFixed(2)}</p>`
    if (adult_count + child_count > 0) {cart.innerHTML = cartHTML;}

    total_price.innerHTML = `<b>$${((adult_count*adult_cost + child_count*child_cost)*0.30 + (adult_count*adult_cost + child_count*child_cost)).toFixed(2)}</b>`;

    console.log(adult_count + child_count);

    if (adult_count + child_count > 0){
        for (i = 0; i < (adult_count + child_count - 1); i++) {
            passengerHTML += `<label for='passenger${i}'>Name ${i+1}</label><input type='text' id='passenger${i}'>`;
        }
        extra_pass.innerHTML = passengerHTML;
    }
}

var container = document.getElementById('container_slide');
var next = document.getElementById('check_flights_btn');
var prev = document.getElementById('flight_back_btn');
var back_list = document.getElementById('back_button2');

var body = document.getElementById("body_tag");
var html_obj = document.getElementById("html_tag");

var admin_btn = document.getElementById('submit-admin-btn');
var admin_back_btn = document.getElementById('btn-admin-back');
var reset_btn=document.getElementById('reset-btn');
var paymentSubmit=document.getElementById('payment-submit');
var delete_btn = document.getElementById('delete-btn');

var display_bookings_btn = document.getElementById('display-bookings');

var refund_btn = document.getElementById('refund-btn');

var payment_form = document.getElementById('payment-form');


refund_btn.onclick = function() {
    deleteBooking();
}

display_bookings_btn.onclick = function() {
    loadBookings();
}

next.onclick = function (event) {
    fetchFlights();
    container.classList.add("next");
}

function slide_function(flight_id_input, flight_id_input_2, route_id_input) {
    flight_id = flight_id_input;
    flight_id_2 = flight_id_input_2
    route_id = route_id_input;
    console.log(flight_id);
    displayCart();
    container.classList.add("pay");
    body.style.overflow = "inherit";
    html_obj.style.overflow = "inherit";
}

back_list.onclick = function (event) {
    body.style.overflow = "hidden";
    html_obj.style.overflow = "hidden";
    var error_display = document.getElementById('error_display');
    error_display.innerHTML = "";
    container.classList.remove("pay");
}

prev.onclick = function (event) {
    container.classList.remove("next");
    document.getElementById("table_display").innerHTML = `
<tr>
    <th>Flight Route</th>
    <th>Time Frame</th>
    <th>Movie(s)</th>
    <th>Meal(s)</th>
</tr>`;
    document.getElementById('error-msg').innerHTML = '';
}

paymentSubmit.onclick=function(){
    fetchPayment();
    return false;
}

admin_btn.onclick = function(){
    var userinput = document.getElementById('loginform').value;
    
    if (userinput === "123" || admin_pass === "123")
    {
        admin_pass = userinput;
        generate_flight_button();
        loadFlightsAdmin();
        container.classList.add("admin");
    }
}

admin_back_btn.onclick = function(){
    container.classList.remove("admin");
    console.log("adding admin");
}

reset_btn.onclick= async function(){
    try{
        document.getElementById('result-display').innerHTML = "Reseting database...";
        const response = await fetch(`http://localhost:5000/reset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        const jsonData = await response.json();
            document.getElementById('result-display').innerHTML = jsonData;

        return false;
    } catch (err) { console.log(err.message); }
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

delete_btn.onclick = delete_customer();

async function delete_customer(fullName){
    try{
        const response = await fetch(`http://localhost:5000/flights/${fullName}`, {
            method: "DELETE",
        })
        return false;
    } catch(err) { console.log(err.message);}
}
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = async function() {
        try{
            const response = await fetch(`http://localhost:5000/getSql`);
            const jsonData = await response.json();
            modal.style.display = "block";
            document.getElementById('sql-container').innerHTML = jsonData;
        } catch (err) { console.log(err.message); }
    }

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}