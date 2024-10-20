// Slider Calories JS
const slider = document.getElementById("myRange");
const output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = () => {
    output.innerHTML = slider.value;
};

// Geolocation Error Handling
function handleGeolocationError(err) {
    const messages = {
        1: "Please allow Crave Right to see your geolocation so we can match you with the best local food!",
        default: "Crave Right can't find your location"
    };
    alert(messages[err.code] || messages.default);
}

// Format Opening Hours
async function formatOpeningHours(openingHours, lat, lng) {
    const { DateTime } = luxon;
    const timeZone = 'America/New_York';

    if (!openingHours || openingHours === 'No hours provided') {
        return 'No hours available';
    }

    return openingHours.split(',').map(hours => {
        const [day, timeRange] = hours.trim().split(': ');
        const [start, end] = timeRange?.split(' - ') || [];

        if (!start || !end) return hours;

        const startTime = DateTime.fromFormat(start.trim(), 'hh:mm a', { zone: timeZone });
        const endTime = DateTime.fromFormat(end.trim(), 'hh:mm a', { zone: timeZone });

        if (startTime.invalid || endTime.invalid) return hours;

        return `${day}: ${startTime.setZone(timeZone).toFormat('hh:mm a')} - ${endTime.setZone(timeZone).toFormat('hh:mm a')}`;
    }).join(', ');
}

// Initialize the Map
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([39.38064969597025, -97.90948071443827], 5);
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let markers = [];
    let userMarker, userCircle, hasZoomed;

    // Start Geolocation
    navigator.geolocation.watchPosition(success, handleGeolocationError);

    function success(pos) {
        const { latitude, longitude, accuracy } = pos.coords;

        if (userMarker) {
            map.removeLayer(userMarker);
            map.removeLayer(userCircle);
        }

        userMarker = L.marker([latitude, longitude]).addTo(map);
        userCircle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

        if (!hasZoomed) {
            hasZoomed = map.fitBounds(userCircle.getBounds());
        }

        map.setView([latitude, longitude]);
        fetchRestaurants(latitude, longitude, getSelectedBusinessTypes());
    }

    // Fetch Restaurants Function
    async function fetchRestaurants(lat, lng, selectedTypes) {
        const radius = 5000;
        const overpassUrl = 'https://lz4.overpass-api.de/api/interpreter';
        const typesQuery = selectedTypes.join('|');
        const overpassQuery = `
            [out:json];
            node["amenity"~"${typesQuery}"](around:${radius},${lat},${lng});
            out;
        `.trim();

        try {
            const response = await fetch(`${overpassUrl}?data=${encodeURIComponent(overpassQuery)}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

            const data = await response.json();
            markers.forEach(marker => map.removeLayer(marker));
            markers = [];

            if (data.elements && data.elements.length > 0) {
                const userLocation = L.latLng(lat, lng);
                data.elements.forEach(async (element) => {
                    if (element.lat && element.lon) {
                        const restaurantLocation = L.latLng(element.lat, element.lon);
                        const distance = userLocation.distanceTo(restaurantLocation);

                        if (distance <= radius) {
                            const name = element.tags?.name || 'Unnamed Restaurant';
                            const classification = capitalizeWords(element.tags?.amenity || 'Unknown Classification');
                            const dietInfo = element.tags?.diet || 'No diets';
                            const address = element.tags?.address?.full || 'No Address Provided';
                            const phone = element.tags?.phone || 'No Phone Number Provided';
                            const website = element.tags?.website || '#';
                            const openingHours = element.tags?.opening_hours || 'No Hours Provided';
                            const formattedOpeningHours = await formatOpeningHours(openingHours, element.lat, element.lon);

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

                            const newMarker = L.marker([element.lat, element.lon]).addTo(map).bindPopup(popupContent);
                            markers.push(newMarker);
                        }
                    }
                });
            } else {
                console.warn('No restaurants found in the area.');
            }
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
        }
    }

    // Helper Functions
    function capitalizeWords(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    function getSelectedBusinessTypes() {
        const selectedTypes = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked')).map(cb => cb.value);
        return selectedTypes.length > 0 ? selectedTypes : ['restaurant', 'cafe', 'bar', 'grocery', 'fuel', 'fast_food'];
    }

    // Function to show all markers
    function showAllMarkers() {
        markers.forEach(marker => map.addLayer(marker));
    }

    // Debounce function
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Function to filter and show markers based on the search term
    function showFilteredMarkers(searchTerm) {
        markers.forEach(marker => {
            const popupContent = marker.getPopup().getContent();
            const nameMatch = popupContent.match(/<h3>(.*?)<\/h3>/);
            
            if (nameMatch) {
                const name = nameMatch[1].toLowerCase();
                const isMatch = name.includes(searchTerm);
                if (isMatch) {
                    map.addLayer(marker);
                } else {
                    map.removeLayer(marker);
                }
            }
        });
    }

    // Event Listeners
    document.querySelector('.submit').addEventListener('click', event => {
        event.preventDefault();
        const searchTerm = document.querySelector('#search').value.toLowerCase().trim();
        const selectedBusinessTypes = getSelectedBusinessTypes();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchRestaurants(latitude, longitude, selectedBusinessTypes);
                showFilteredMarkers(searchTerm);
            }, () => {
                console.error("Geolocation permission denied.");
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    });

    document.querySelector('#search').addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase().trim();
        showFilteredMarkers(searchTerm);
    }, 300)); // 300 ms delay for debounce

    document.querySelector('.clear-search').addEventListener('click', function() {
        document.querySelector('#search').value = '';
        showAllMarkers();
    });

    // Dropdown Menu
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            document.querySelectorAll(".dropdown-content.show").forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    };

    // CSS for highlighting matches
    const style = document.createElement('style');
    style.innerHTML = `
        .highlight {
            background-color: yellow; /* Change to desired highlight color */
            border-radius: 5px; /* Optional */
        }
    `;
    document.head.appendChild(style);
});

// Toggle Dropdown Function (if necessary)
function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}


