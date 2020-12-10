var container_check = document.getElementById('container_slide_check');

var search_btn_search = document.getElementById('submit-btn-search');
var search_btn = document.getElementById('list_display_btn');
var luggage_btn = document.getElementById('luggage_btn');

var back_list_btn = document.getElementById('back_list');
var back_luggage_btn = document.getElementById('back_luggage');

let ticket_list_storage = []
let boarding_list_storage = []

let global_ticket_id = ""
let global_flight_id = ""
let global_seat_no = ""

search_btn_search.onclick=function(){
    fetchList();
    container_check.classList.add("list");
}

back_list_btn.onclick = function() {
    container_check.classList.remove("list");
    boarding_table = document.getElementById('ticket_results');
    
    boarding_table.innerHTML = `
    <tr>
        <th>Flight ID</th>
        <th>Departure Time</th>
        <th>Arrival Time</th>
        <th>Passenger</th>
        <th>Seat</th>
    </tr> 
`;
}

search_btn.onclick = function(){
    container_check.classList.add("bags");
}

back_luggage_btn.onclick = function() {
    container_check.classList.remove('bags');
}

luggage_btn.onclick = function(){
    sendLuggageCount();
    container_check.classList.add("tickets");
}

async function sendLuggageCount() {
    var luggage_input = document.getElementById('luggage_cnt').value;
    console.log('luggage cnt:', luggage_input);
    try{
        const response = await fetch(`http://localhost:5000/checkin/?ticket_id=${global_ticket_id}&luggage_cnt=${luggage_input}&flight_id=${global_flight_id}&seat_no=${global_seat_no}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        })
        const jsonData = await response.json();
        boarding_list_storage = jsonData;

        displayBoardingPass();

        return false;
    } catch(err) {console.log(err.message);}
}

async function fetchList() {
    var ticket_id = document.getElementById('ticket_input').value;
    global_ticket_id = ticket_id;
    try{
        const response = await fetch(`http://localhost:5000/checkin/list/?ticket_id=${ticket_id}`);
        const jsonData = await response.json();

        setList(jsonData);
        displayList();

        return true;
    } catch (err) { 
        console.log(err.message); 
        return false
    }
}

const setList = (data) => {
    ticket_list_storage = data;
    console.log('This is the list data saved:', ticket_list_storage);
}

const displayList = () => {
    const boarding_table = document.getElementById('ticket_results');

    let tableHTML = "";
    if (ticket_list_storage.length === 0) { console.log('Query returned nothing');}
    ticket_list_storage.map(t_table => {
        tableHTML += `
            <tr>
            <th>${t_table.flight_id}</th>
            <th>${t_table.scheduled_departure}</th>
            <th>${t_table.scheduled_arrival}</th>
            <th>${t_table.passenger_name}</th>
            <th>${t_table.seat_no}</th>`;

        global_flight_id = t_table.flight_id;
        global_seat_no = t_table.seat_no;
    });

    boarding_table.innerHTML += tableHTML;
}

const displayBoardingPass = () => {
    const boarding_pass = document.getElementById('boardings');

    let tableHTML = "";
    if (boarding_list_storage.length === 0) { console.log('Query returned nothing');}
    boarding_list_storage.map(d_table => {
        tableHTML += `
            <tr>
                <th>${d_table.ticket_no}</th>
                <th>${d_table.flight_id}</th>
                <th>${d_table.boarding_no}</th>
                <th>${d_table.seat_no}</th>
            </tr>
        `
    })
    boarding_pass.innerHTML += tableHTML;
}