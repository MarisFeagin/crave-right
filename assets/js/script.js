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

function capitalizeWords(str) {
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function formatOpeningHours(openingHours, lat, lng) {
    const { DateTime } = luxon;

    // Check if openingHours is valid
    if (!openingHours || openingHours === 'No hours provided') {
        return 'No hours available';
    }

    const hoursArray = openingHours.split(',');
    const formattedHours = hoursArray.map(hours => {
        const parts = hours.trim().split(': '); // Split by ': ' to separate day and time

        // Ensure we have at least two parts (day and time)
        if (parts.length < 2) {
            return hours; // Return the original string if format is unexpected
        }

        const day = parts[0];
        const timeRange = parts[1].trim(); // Time range after day

        // Split the time range into start and end times
        const [start, end] = timeRange.split(' - ');

        // Ensure both start and end times are provided
        if (!start || !end) {
            return hours; // Return the original string if times are missing
        }

        // Get the local timezone from coordinates
        const timeZone = DateTime.local().setZone(DateTime.fromObject({ lat, lng }).zoneName).zoneName;

        // Attempt to parse the start and end times
        const startTime = DateTime.fromFormat(start.trim(), 'hh:mm a', { zone: timeZone });
        const endTime = DateTime.fromFormat(end.trim(), 'hh:mm a', { zone: timeZone });

        // Check for invalid times
        if (startTime.invalid || endTime.invalid) {
            return hours; // Return the original string if times are invalid
        }

        // Format the times in the local timezone
        return `${day}: ${startTime.setZone(timeZone).toFormat('hh:mm a')} - ${endTime.setZone(timeZone).toFormat('hh:mm a')}`;
    });

    return formattedHours.join(', ');
}


// Function to fetch restaurants using Overpass API
function fetchRestaurants(lat, lng) {
    const radius = 5000; // Search radius in meters
    const overpassUrl = 'https://lz4.overpass-api.de/api/interpreter';
    const overpassQuery = `
        [out:json];
        node["amenity"~"restaurant|cafe|bar|grocery|fuel|fast_food"](around:${radius}, ${lat}, ${lng});
        out;
    `;

    fetch(overpassUrl + '?data=' + encodeURIComponent(overpassQuery))
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the API response

            // Clear previous markers
            markers.forEach(marker => map.removeLayer(marker));
            markers = []; // Reset the markers array

            // Create a LatLng object for the user's location
            const userLocation = L.latLng(lat, lng);

            // Extract restaurant coordinates from Overpass API response
            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        const restaurantLocation = L.latLng(element.lat, element.lon);
                        
                        // Calculate the distance from the user's location to the restaurant
                        const distance = userLocation.distanceTo(restaurantLocation);
                        console.log(`Distance to restaurant (${element.lat}, ${element.lon}): ${distance} meters`);

                        // Only add marker if within the specified radius
                        if (distance <= radius) {
                            console.log(`Adding Marker: ${element.lat}, ${element.lon}`); // Log marker coordinates

                            // Construct the popup content
                            const name = element.tags?.name || 'Unnamed Restaurant';
                            
                            // Custom classification for fast food
                            let classification = element.tags?.amenity || 'Unknown Classification';
                            if (classification === 'fast_food') {
                                classification = 'Quick Service';
                            }
                            classification = capitalizeWords(classification);

                            const dietInfo = element.tags?.diet || 'No diets';
                            const address = element.tags?.address?.full || 'No address provided';
                            const phone = element.tags?.phone || 'No phone number';
                            const website = element.tags?.website || '#';
                            const openingHours = element.tags?.opening_hours || 'No hours provided';

                            // Format the opening hours based on local time zone
                            const formattedOpeningHours = formatOpeningHours(openingHours, lat, lng);

                            const popupContent = `
                                <span class="popup">
                                    <h3>${name}</h3>
                                    <p><strong>${classification}</strong></p>
                                    <p><strong>${dietInfo} are currently welcome!</strong></p>
                                    <button type="button" target="_blank">Order Online</button>
                                    <p><strong>Address:</strong> ${address}</p>
                                    <p><strong>Phone Number:</strong> <a href="tel:${phone}">${phone}</a></p>
                                    ${website !== '#' ? `<p><strong>Website:</strong> <a href="${website}" target="_blank" rel="noopener noreferrer">${website}</a></p>` : '<p>No website available</p>'}
                                    <p><strong>Open Hours:</strong> ${formattedOpeningHours}</p>
                                </span>
                            `;

                            const newMarker = L.marker([element.lat, element.lon])
                                .addTo(map)
                                .bindPopup(popupContent);
                            markers.push(newMarker); // Store the marker
                        } else {
                            console.log(`Skipping restaurant (${element.lat}, ${element.lon}), distance: ${distance} meters`);
                        }
                    }
                });
            } else {
                console.warn('No restaurants found in the area.');
            }
        })
        .catch(error => console.error('Error fetching restaurant data:', error));
}

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

