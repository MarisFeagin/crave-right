// Slider Calories JS
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

function error(err) {
    if (err.code === 1) {
        alert("Please allow Crave Right to see your geolocation so we can match you with the best local food!");
    } else {
        alert("Crave Right can't find your location");
    }
}

async function formatOpeningHours(openingHours, _lat, _lng) {
    const { DateTime } = luxon;

    if (!openingHours || openingHours === 'No hours provided') {
        return 'No hours available';
    }

    // For demonstration, you can use a hardcoded timezone. 
    // Replace this with the actual timezone retrieved from an API if needed.
    const timeZone = 'America/New_York'; // Example timezone; replace as needed

    const hoursArray = openingHours.split(',');

    const formattedHours = hoursArray.map(hours => {
        const parts = hours.trim().split(': '); // Split by ': ' to separate day and time

        if (parts.length < 2) {
            return hours; // Return the original string if format is unexpected
        }

        const day = parts[0];
        const timeRange = parts[1].trim(); // Time range after day

        const [start, end] = timeRange.split(' - ');

        if (!start || !end) {
            return hours; // Return the original string if times are missing
        }

        // Attempt to parse the start and end times
        const startTime = DateTime.fromFormat(start.trim(), 'hh:mm a', { zone: timeZone });
        const endTime = DateTime.fromFormat(end.trim(), 'hh:mm a', { zone: timeZone });

        if (startTime.invalid || endTime.invalid) {
            return hours; // Return the original string if times are invalid
        }

        // Format the times in the local timezone
        return `${day}: ${startTime.setZone(timeZone).toFormat('hh:mm a')} - ${endTime.setZone(timeZone).toFormat('hh:mm a')}`;
    });

    return formattedHours.join(', ');
}

// script.js

let menuItems = []; // Declare menuItems here

// Initialize the map
document.addEventListener('DOMContentLoaded', function() {var map = L.map('map').setView([39.38064969597025, -97.90948071443827], 5);

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
    
    function capitalizeWords(str) {
        return str.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
// Function to get selected business types
function getSelectedBusinessTypes() {
    const selectedTypes = [];
    const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });
    return selectedTypes;
}

async function fetchRestaurants(lat, lng, selectedTypes) {
    const radius = 5000; // Search radius in meters
    const overpassUrl = 'https://lz4.overpass-api.de/api/interpreter';

    const allowedTypes = ['restaurant', 'cafe', 'bar', 'fast_food', 'grocery', 'fuel']; // Allowed types

    const overpassQuery = `
        [out:json];
        node["amenity"~"${allowedTypes.join('|')}"](around:${radius}, ${lat}, ${lng});
        out;
    `;

    try {
        const response = await fetch(overpassUrl + '?data=' + encodeURIComponent(overpassQuery));
        const data = await response.json();
        
        // Process the data
        markers.forEach(marker => map.removeLayer(marker));
        markers = []; // Reset the markers array
        const userLocation = L.latLng(lat, lng);

        if (data.elements && data.elements.length > 0) {
            for (const element of data.elements) {
                if (element.lat && element.lon) {
                    const restaurantLocation = L.latLng(element.lat, element.lon);
                    const distance = userLocation.distanceTo(restaurantLocation);

                    if (distance <= radius) {
                        const name = element.tags?.name || 'Unnamed Restaurant';
                        let classification = element.tags?.amenity || 'Unknown Classification';
                        classification = capitalizeWords(classification);
                        const dietInfo = element.tags?.diet || 'No diets';
                        const address = element.tags?.address?.full || 'No address provided';
                        const phone = element.tags?.phone || 'No phone number found';
                        const website = element.tags?.website || '#';
                        const openingHours = element.tags?.opening_hours || 'No hours provided';

                        // Fetch formatted opening hours
                        const formattedOpeningHours = await formatOpeningHours(openingHours, element.lat, element.lon);

                        // Fetch Menu Items Function
                        // async function fetchMenuItems(_name) {
                        //    const response = await fetch(`your-api-endpoint?name=${_name}`);
                        //    if (!response.ok) throw new Error('Failed to fetch menu items');
                        //    const data = await response.json();
                        //    return data.items; // Assuming the structure contains 'items'
                        // }

                        // const menuItems = await fetchMenuItems(name); // Await the fetched menu items
                        // const priceRange = getPriceRange(menuItems); // Calculate price range 

                        const popupContent = `
                            <span class="popup">
                            <h3>${name}</h3>
                            <p><strong>${classification}</strong></p>
                            <p><strong>${dietInfo} are currently welcome!</strong></p>
                            <button type="button" onclick="openSideMenu('${name}', '${classification}', '${dietInfo}', '${address}', '${phone}', '${website}', '${formattedOpeningHours}')">Order Online</button>
                            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
                            ${phone ? `<p><strong>Phone Number:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
                            ${website !== '#' ? `<p><strong>Website:</strong> <a href="${website}" target="_blank" rel="noopener noreferrer">${name}</a></p>` : ''}
                            ${formattedOpeningHours ? `<p><strong>Open Hours:</strong> ${formattedOpeningHours}</p>` : ''}
                            </span>
                        `;

                        const newMarker = L.marker([element.lat, element.lon])
                            .addTo(map)
                            .bindPopup(popupContent);
                        markers.push(newMarker); // Store the marker
                    }
                }
            }
        } else {
            console.warn('No restaurants found in the area.');
        }
    } catch (error) {
        console.error('Error fetching restaurant data:', error);
    }
  }
});


// Event listener for the Search button
document.querySelector('.submit').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const searchTerm = document.querySelector('#search').value.toLowerCase().trim();
    const selectedBusinessTypes = getSelectedBusinessTypes(); // Get selected types

    // Get user geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const currentLat = position.coords.latitude;  // Get latitude
            const currentLng = position.coords.longitude;  // Get longitude

            // Call fetchRestaurants with user's geolocation
            fetchRestaurants(currentLat, currentLng, selectedBusinessTypes);

            // Optionally filter and show markers based on the search term
            showFilteredMarkers(searchTerm);
        }, () => {
            console.error("Geolocation permission denied.");
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
})

// Event listener for input changes in the search bar
document.querySelector('#search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        showAllMarkers(); // Show all markers if the search bar is empty
    } else {
        showFilteredMarkers(searchTerm); // Filter markers based on the input
    }
})

// Function to show all markers
function showAllMarkers() {
    markers.forEach(marker => {
        map.addLayer(marker); // Add the marker back to the map
    });
}

// Function to filter markers based on the search term
function showFilteredMarkers(searchTerm) {
    markers.forEach(marker => {
        const popupContent = marker.getPopup().getContent();
        const name = popupContent.match(/<h3>(.*?)<\/h3>/)[1]; // Extract the name from popup content
        const nameMatch = name.toLowerCase().includes(searchTerm.toLowerCase()); // Check for a match

        if (nameMatch) {
            map.addLayer(marker); // Show the marker
        } else {
            map.removeLayer(marker); // Hide the marker
        }
    });
}

// Event listener for the Clear Search button
document.querySelector('.clear-search').addEventListener('click', function() {
    document.querySelector('#search').value = ''; // Clear the search input
    showAllMarkers(); // Show all markers
})

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
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
