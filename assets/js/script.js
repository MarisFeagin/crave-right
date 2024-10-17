// Slider Calories JS
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
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
    
    async function formatOpeningHours(openingHours, lat, lng) {
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
    
    
    
    // Function to fetch restaurants using Overpass API
    async function fetchRestaurants(lat, lng) {
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
                markers.forEach(marker => map.removeLayer(marker));
                markers = []; // Reset the markers array
                const userLocation = L.latLng(lat, lng);
    
                if (data.elements && data.elements.length > 0) {
                    data.elements.forEach(async (element) => {
                        if (element.lat && element.lon) {
                            const restaurantLocation = L.latLng(element.lat, element.lon);
                            const distance = userLocation.distanceTo(restaurantLocation);
    
                            if (distance <= radius) {
                                const name = element.tags?.name || 'Unnamed Restaurant';
                                let classification = element.tags?.amenity || 'Unknown Classification';
                                if (classification === 'fast_food') {
                                    classification = 'Quick Service';
                                }
                                classification = capitalizeWords(classification);
                                const dietInfo = element.tags?.diet || 'No diets';
                                const address = element.tags?.address?.full || 'No address provided';
                                const phone = element.tags?.phone || 'No phone number found';
                                const website = element.tags?.website || '#';
                                const openingHours = element.tags?.opening_hours || 'No hours provided';
    
                                // Fetch formatted opening hours
                                const formattedOpeningHours = await formatOpeningHours(openingHours, element.lat, element.lon);
    
                                fetchMenuItems(name).then(items => {
                                    menuItems = items; // Store fetched menu items
                                    const priceRange = getPriceRange(menuItems); // Calculate price range
    
                                    const popupContent = `
                                      <span class="popup">
                                      <h3>${name}</h3>
                                      <p><strong>${classification}</strong></p>
                                      <p><strong>${dietInfo} are currently welcome!</strong></p>
                                      ${priceRange ? `<p><strong>Price Range:</strong> ${priceRange}</p>` : ''}
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
                                });
                            }
                        }
                    });
                } else {
                    console.warn('No restaurants found in the area.');
                }
            })
            .catch(error => console.error('Error fetching restaurant data:', error));
    }
    
    // Event listener for input changes in the search bar
    document.querySelector('#search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            showAllMarkers(); // Show all markers if the search bar is empty
        } else {
            showFilteredMarkers(searchTerm); // Filter markers based on the input
        }
    });
    
    // Function to handle search input
    document.querySelector('.submit').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const searchTerm = document.querySelector('#search').value.toLowerCase().trim();
        
        // Filter and show markers based on the search term
        showFilteredMarkers(searchTerm);
    });
    
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
     });

    
    // Function to show all markers
    function showAllMarkers() {
      markers.forEach(marker => {
        map.addLayer(marker); // Add the marker back to the map
     });
    }
    
    
    let currentRestaurant = {};
    
    function openSideMenu(name, classification, dietInfo, address, phone, website, openingHours) {
        // Set the restaurant name
        document.getElementById('restaurant-name').innerText = name;
    
        // Fetch menu items (you may replace this with your actual menu fetching logic)
        fetchMenuItems(name).then(items => {
            menuItems = items; // Store fetched menu items
            displayMenuItems(menuItems); // Display all items initially
        });
    
        document.getElementById('side-menu').style.display = 'block'; // Show the side menu
    }
    
    function fetchMenuItems(restaurantName) {
        return new Promise(resolve => {
            const exampleMenu = [
                { id: 1, name: "Burger", category: "Main Course", price: 8.99 },
                { id: 2, name: "Fries", category: "Sides", price: 2.99 },
                { id: 3, name: "Salad", category: "Appetizers", price: 5.49 },
                { id: 4, name: "Soda", category: "Drinks", price: 1.50 },
                // Add more items as needed
            ];
            resolve(exampleMenu);
        });
    }
    
    function getPriceRange(items) {
        if (!items.length) return "Price not available";
        
        const prices = items.map(item => item.price);
        const minPrice = Math.min(...prices).toFixed(2);
        const maxPrice = Math.max(...prices).toFixed(2);
        
        return `$${minPrice} - $${maxPrice}`;
    }
    
    
    function displayMenuItems(items) {
        const menuItemsDiv = document.getElementById('menu-items');
        menuItemsDiv.innerHTML = ''; // Clear existing items
    
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <label>
                    ${item.name} (${item.category})
                    <input type="number" min="0" value="0" class="item-quantity" data-item="${item.name}" />
                </label>
            `;
            menuItemsDiv.appendChild(itemDiv);
        });
    }
    function filterMenu() {
        const query = document.getElementById('search-bar').value.toLowerCase();
        const filteredItems = menuItems.filter(item => item.name.toLowerCase().includes(query));
        displayMenuItems(filteredItems);
    }
    
    // Close menu functionality
    document.getElementById('close-menu').addEventListener('click', () => {
        document.getElementById('side-menu').style.display = 'none'; // Hide the side menu
    });
    
    // Handle order submission
    document.getElementById('submit-order').addEventListener('click', () => {
        const selectedItems = Array.from(document.querySelectorAll('#menu-items .item-quantity'))
            .map(input => {
                const quantity = parseInt(input.value);
                const itemName = input.getAttribute('data-item');
                return { name: itemName, quantity: quantity };
            })
            .filter(item => item.quantity > 0); // Filter out items with quantity 0
    
        if (selectedItems.length > 0) {
            alert(`Order submitted: ${selectedItems.map(item => `${item.name} (x${item.quantity})`).join(', ')}`);
        } else {
            alert('No items selected for order.');
        }
    })})



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

