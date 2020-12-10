async function refundCustomer() {
    try {
        var customer_id = document.getElementById('cust_id_search').value;
        const response = await fetch(`http://localhost:5000/refundCustomer/?cust_id=${customer_id}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        })
        const jsonData = await response.json();
        refund_result = jsonData;

        console.log(customer_id);
        displayResults(refund_btn);
    } catch(err) {console.log(err.message);}
}

function displayResults(result) {
    const refund_result = document.getElementById('refund_result_display');
    refund_result.innerHTML = result;
}

var refund_btn = document.getElementById('refund_cust_btn');

refund_btn.onclick = function() {
    refundCustomer();
}