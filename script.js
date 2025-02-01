

// Initialize the map centered on Delhi
var map = L.map('map').setView([28.629696, 77.230282], 12);

// Set up the OSM tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define Delhi's boundary using a polygon (you can adjust coordinates for more precision)
var delhiBoundary = [
    [28.4042, 76.8376],  // South-West corner
    [28.8838, 77.3880]   // North-East corner
];

// Create the polygon for Delhi's boundary
var polygon = L.polygon([
    [28.4042, 76.8376],
    [28.8838, 76.8376],
    [28.8838, 77.3880],
    [28.4042, 77.3880]
], {color: 'blue'}).addTo(map);

// Initialize a draggable marker at a default location (Connaught Place)
var marker = L.marker([28.629696, 77.230282], { draggable: true }).addTo(map);

// Function to check if the marker is inside Delhi's boundary
function isWithinDelhiBounds(lat, lng) {
    // Create a LatLng object for the marker's position
    var latLng = L.latLng(lat, lng);
    
    // Check if the marker's position is within the polygon (Delhi boundary)
    return polygon.contains(latLng);
}

// Function to find the closest region based on marker position
function getClosestRegion(lat, lng) {
    var closestRegion = '';
    var minDistance = Infinity;

    // Predefined regions with latitude and longitude (you can add more as needed)
    var regions = {
        'Connaught Place': [28.629696, 77.230282],
        'Chandni Chowk': [28.6504, 77.2331],
        'India Gate': [28.6128, 77.2295],
        'Qutub Minar': [28.5245, 77.1855],
        'Red Fort': [28.6562, 77.2410]
    };

    // Iterate over regions and calculate the distance to the marker
    for (var region in regions) {
        var regionLatLng = regions[region];
        var distance = map.distance([lat, lng], regionLatLng);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestRegion = region;
        }
    }
    return closestRegion;
}

// Update latitude, longitude, and region when the marker is moved
marker.on('dragend', function (e) {
    var latLng = marker.getLatLng();
    var lat = latLng.lat.toFixed(6);
    var lng = latLng.lng.toFixed(6);
    document.getElementById('latitude').innerText = lat;
    document.getElementById('longitude').innerText = lng;

    // Get and display the closest region name
    var regionName = getClosestRegion(lat, lng);
    document.getElementById('region').innerText = regionName;
});

// Handle the Send Data button click
document.getElementById('sendData').addEventListener('click', function () {
    var latitude = parseFloat(document.getElementById('latitude').innerText);
    var longitude = parseFloat(document.getElementById('longitude').innerText);
    var date = document.getElementById('date').value;

    if (latitude === 'N/A' || longitude === 'N/A') {
        alert('Please select a region on the map!');
        return;
    }

    // Check if the selected region is within Delhi's boundary
    if (!isWithinDelhiBounds(latitude, longitude)) {
        alert("The selected area is not within Delhi! Please select a region within Delhi.");
        return;
    }

    // Send POST request to Flask backend for prediction
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `latitude=${latitude}&longitude=${longitude}&date=${date}`
    })
    .then(response => response.json())
    .then(data => {
        // Update the UI with prediction data
        document.getElementById('predicted-load').innerText = data.predicted_load + ' MWh';
        document.getElementById('temperature').innerText = data.temperature + ' °C';
        document.getElementById('humidity').innerText = data.humidity + ' %';
        document.getElementById('holiday').innerText = data.holiday;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
