async function searchCustomer() {
    try{
        var customer_id = document.getElementById('cust-input').value;
        const response = await fetch(`http://localhost:5000/cust_search/?cust_id=${customer_id}`);
    const jsonData = await response.json();

    displayCustomer(jsonData);
    } catch(err) {console.log(err.message);}
}

async function searchFlight() {
    try{
        var flight_id = document.getElementById('flight-input').value;
        const response = await fetch(`http://localhost:5000/flight_search/?flight_id=${flight_id}`);
    const jsonData = await response.json();

    displayFlights(jsonData);
    } catch(err) {console.log(err.message);}
}

async function searchBooking() {
    try{
        var book_ref = document.getElementById('booking-input').value;
        const response = await fetch(`http://localhost:5000/booking_search/?book_ref=${book_ref}`);
        const jsonData = await response.json();

    displayBookings(jsonData);
    } catch(err) {console.log(err.message);}
}

async function searchTickets() {
    try{
        var ticket_no = document.getElementById('ticket-input').value;
        const response = await fetch(`http://localhost:5000/ticket_search/?ticket_no=${ticket_no}`);
        const jsonData = await response.json();

    displayTicket(jsonData);
    } catch(err) {console.log(err.message);}
}

async function searchBoarding() {
    try{
        var boarding_no = document.getElementById('boarding-input').value;
        const response = await fetch(`http://localhost:5000/boarding_search/?boarding_no=${boarding_no}`);
        const jsonData = await response.json();

    displayBoarding(jsonData);
    } catch(err) {console.log(err.message);}
}

function displayBoarding(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(b_table => {
            tableHTML += `
                <tr>
                    <th>Ticket No</th>
                    <th>Flight Id</th>
                    <th>Boarding No</th>
                    <th>Seat No</th>
                </tr>
                <tr></tr>
                <tr>
                    <th>${b_table.ticket_no}</th>
                    <th>${b_table.flight_id}</th>
                    <th>${b_table.boarding_no}</th>
                    <th>${b_table.seat_no}</th>
                </tr>
            `;
        })
        result_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}


function displayCustomer(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(c_table => {
            tableHTML += `
                <tr>
                    <th>Customer Id</th>
                    <th>Customer Name</th>
                    <th>Customer Telephone</th>
                    <th>Customer Email</th>
                    <th>Book Ref</th>
                    <th>Family/Couple/Group</th>
                    <th>Card #</th>
                    <th>Route Id</th>
                </tr>
                <tr></tr>
                <tr>
                    <th>${c_table.customer_id}</th>
                    <th>${c_table.customer_name}</th>
                    <th>${c_table.customer_telephone}</th>
                    <th>${c_table.customer_email}</th>
                    <th>${c_table.book_ref}</th>
                    <th>${c_table.family_couple_group}</th>
                    <th>${c_table.card_number}</th>
                    <th>${c_table.route_id}</th>
                </tr>
            `;
        })
        result_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

function displayFlights(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(f_table => {
            tableHTML += `
                <tr>
                    <th>Flight ID</th>
                    <th>Flight #</th>
                    <th>Scheduled Departure</th>
                    <th>Scheduled Arrival</th>
                    <th>Status</th>
                    <th>Departure Airport</th>
                    <th>Arrival Airport</th>
                </tr>
                <tr></tr>
                <tr>
                    <th>${f_table.flight_id}</th>
                    <th>${f_table.flight_no}</th>
                    <th>${f_table.scheduled_departure}</th>
                    <th>${f_table.scheduled_arrival}</th>
                    <th>${f_table.status}</th>
                    <th>${f_table.departure_airport}</th>
                    <th>${f_table.arrival_airport}</th>
                </tr>
            `;
        })
        result_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

function displayBookings(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(b_table => {
            tableHTML += `
                <tr>
                    <th>Book Ref</th>
                    <th>Book Date</th>
                    <th>Total Amount</th>
                </tr>
                <tr></tr>
                <tr>
                    <th>${b_table.book_ref}</th>
                    <th>${b_table.book_date}</th>
                    <th>${b_table.total_amount}</th>
                </tr>
            `;
        })
        result_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

function displayTicket(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(t_table => {
            tableHTML += `
                <tr>
                    <th>Ticket No</th>
                    <th>Book Ref</th>
                    <th>Passenger Id</th>
                    <th>Passenger Name</th>
                    <th>Seat No</th>
                </tr>
                <tr></tr>
                <tr>
                    <th>${t_table.ticket_no}</th>
                    <th>${t_table.book_ref}</th>
                    <th>${t_table.passenger_id}</th>
                    <th>${t_table.passenger_name}</th>
                    <th>${t_table.seat_no}</th>
                </tr>
            `;
        })
        result_table.innerHTML = tableHTML;
    } catch(err) {console.log(err.message);}
}

var find_cust_btn = document.getElementById('findcust-btn');
var find_flight_btn = document.getElementById('findflight-btn');
var find_bookings_btn = document.getElementById('findbooking-btn');
var find_ticket_btn = document.getElementById('findticket-btn');
var find_boarding_btn = document.getElementById('findboarding-btn');


find_cust_btn.onclick = function() {
    searchCustomer();
}

find_flight_btn.onclick = function() {
    searchFlight();
}

find_bookings_btn.onclick = function() {
    searchBooking();
}

find_ticket_btn.onclick = function() {
    searchTickets();
}

find_boarding_btn.onclick = function() {
    searchBoarding();
}