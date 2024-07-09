// Get the button and container elements from HTML:
const button = document.getElementById("theButton")
const data = document.getElementById("info")

var value = 0;
var userName = 'anon';
const input = document.getElementById("inputName");

var nameData = [userName, value];

const allDataMap = new Map();

function setNumber(num) {
    value = num;
    console.log("Set number to: " + value);

    if (input.value != '' && input.value != userName) {
        userName = input.value;
        console.log("Set user's name to: " + userName);
    }

};

// Function for when POST button is clicked:
function postToServer() {
    nameData = [{userName, value}];

    // Get the reciever endpoint from Python using fetch:
    fetch("http://127.0.0.1:5000/receiver", 
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            // Strigify the payload into JSON:
            body:JSON.stringify(nameData)}).then(res=>{
                if (res.ok){
                    return res.json()
                } else {
                    alert("error")
                }
            }).then(jsonResponse=>{
                updateTable();
                
                console.log(jsonResponse)
            } 
            ).catch((err) => console.error(err));
            
}

// Function to create and update the table
function updateTable() {
    const tbody = document.querySelector('#mapTable tbody');
    tbody.innerHTML = ''; // Clear existing table rows

    allDataMap.forEach((value, key) => {
        const row = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        const valueCell = document.createElement('td');
        valueCell.textContent = value;

        row.appendChild(keyCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });
}

updateTable();

window.addEventListener("DOMContentLoaded", () => {
    const messages = document.createElement("ul");
    document.body.appendChild(messages);
  
    const websocket = new WebSocket("ws://localhost:5678/");
    websocket.onmessage = ({ data }) => {

        console.log(data);

        const inputStr = data.replace(/'/g, '"');
        
        const parsedArray = JSON.parse(inputStr);

        parsedArray.forEach(innerArray => {
            innerArray.forEach(entry => {
                allDataMap.set(entry.userName, entry.value);
            });
        });

        updateTable();

        console.log(allDataMap);
       
    };
  });