async function searchCustomer() {
    try{
        var cust_id = document.getElementById('cust-input').value;
        const response = await fetch(`http://localhost:5000/findCustomer/?cust_id=${cust_id}`);
    const jsonData = await response.json();

    displayCustomer(jsonData);
    } catch(err) {console.log(err.message);}
}

function displayCustomer(data) {
    try {
        var result_table = document.getElementById('inquiries-display-table');
        let tableHTML = "";
        data.map(c_table => {
            tableHTML += `
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

var find_cust_btn = document.getElementById('findcust-btn');

find_cust_btn.onclick = function() {
    searchCustomer();
}
