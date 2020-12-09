var container_check = document.getElementById('container_slide_check');

var search_btn_search = document.getElementById('submit-btn-search');
var search_btn = document.getElementById('list_display_btn');
var luggage_btn = document.getElementById('luggage_btn');

let ticket_list_storage = []

search_btn_search.onclick=function(){
    fetchList();
    container_check.classList.add("list");
}

search_btn.onclick = function(){
    container_check.classList.add("bags");
}

luggage_btn.onclick = function(){
    container_check.classList.add("tickets");
}

async function fetchList() {
    var ticket_id = document.getElementById('ticket_input').value;
    try{
        const response = await fetch(`http://localhost:5000/checkin/list/?ticket_id=${ticket_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        return false;
    } catch (err) { console.log(err.message); }
}

const setList = (data) => {
    ticket_list_storage = data;
    console.log('This is the list data saved:', ticket_list_storage);
}