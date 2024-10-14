// Slider Calories JS
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

// script.js

// Initialize the map
var map = L.map('map').setView([39.38064969597025, -97.90948071443827], 5);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

osm.addTo(map);

// Geolocation variables
let marker, circle, zoomed;
let markers = []; // Array to store restaurant markers

// Start geolocation
navigator.geolocation.watchPosition(success, error);

function success(pos) {
    const lat = pos.coords.latitude; // Define lat here
    const lng = pos.coords.longitude; // Define lng here
    const accuracy = pos.coords.accuracy;

    // Remove old marker and circle
    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }

    // Add new marker and circle
    marker = L.marker([lat, lng]).addTo(map);
    circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);

    if (!zoomed) {
        zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, lng]);

    // Fetch and display restaurants after user location is obtained
    fetchRestaurants(lat, lng);
}

function error(err) {
    if (err.code === 1) {
        alert("Please allow Crave Right to see your geolocation so we can match you with the best local food!");
    } else {
        alert("Crave Right can't find your location");
    }
}

// Function to fetch restaurants using Overpass API
function fetchRestaurants(lat, lng) {
    const radius = 6500; // Search radius in meters
    const overpassUrl = 'https://lz4.overpass-api.de/api/interpreter';
    const overpassQuery = `
        [out:json];
        node["amenity"="restaurant"](around:${radius}, ${lat}, ${lng});
        out;
    `;

    fetch(overpassUrl + '?data=' + encodeURIComponent(overpassQuery))
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the API response

            // Clear previous markers
            markers.forEach(marker => map.removeLayer(marker));
            markers = []; // Reset the markers array

            // Extract restaurant coordinates from Overpass API response
            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        console.log(`Adding Marker: ${element.lat}, ${element.lon}`); // Log marker coordinates
                        const newMarker = L.marker([element.lat, element.lon]).addTo(map)
                            .bindPopup(element.tags?.name || 'Unnamed Restaurant');
                        markers.push(newMarker); // Store the marker
                    }
                });
            } else {
                console.warn('No restaurants found in the area.');
            }
        })
        .catch(error => console.error('Error fetching restaurant data:', error));
}




// Test Marker
L.marker([33.7018381,-78.8711748], {
  title: "River City Cafe"
})
.bindPopup(`
  <span class="popup">
    <p>Classification</p><p>Notable Diets/Allergies</p>
    <svg>
    <button type="button" target="_blank">Order Online</button>
    <h3>Menu</h3>
    <p>Address</p>  
    <p>Phone Number: <a href="tel:(843)-420-4202">(843)-420-4202</a></p>
    <a href=" " target="_blank">Website</a>
    <p>Op Hours</p>
    <ul>
     <li>Mon-Fri: 6:00 AM - 9:00 PM</li>
     <li>Sat-Sun: 8:00 AM - 10:00 PM</li>
    </ul>
  </span>
  `)
.addTo(map)

/* Dropdown Filter Menu */
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

