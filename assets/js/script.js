// Slider Calories JS
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

// Map JS
var map = L.map('map').setView([39.38064969597025, -97.90948071443827], 5);

      var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      osm.addTo(map);
  navigator.geolocation.watchPosition(success, error);

  let marker, circle, zoomed;

  function success(pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    if (marker) {
      map.removeLayer(marker);
      map.removeLayer(circle);
    }

    marker = L.marker([lat, lng,]).addTo(map);
    circle = L.circle([lat, lng,], { radius: accuracy }).addTo(map);

    if (!zoomed) {
      zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, lng]);
  }

  function error(err) {
    if (err.code === 1) {
      alert("Please allow Crave Right to see your geolocation so we can match you with the best local food!");
    } else {
      alert("Crave Right can't find your location");
    }
  }

// Map Markers JS
// Get user's location
navigator.geolocation.getCurrentPosition(function(position) {
  var userLat = position.coords.latitude;
  var userLng = position.coords.longitude;

  // Validate latitude and longitude
  if (isNaN(userLat) || isNaN(userLng)) {
    console.error("Invalid latitude or longitude.");
    return;
  }

  // Query Overpass API for restaurant nodes in the user's area
  var overpassUrl = 'https://lz4.overpass-api.de/api/interpreter';
  var overpassQuery = '[out:json];node["amenity"="restaurant"](around:' + userLat + "," + userLng + ',1000);out;';

  fetch(overpassUrl + '?data=' + encodeURIComponent(overpassQuery))
  .then(response => response.json())
  .then(data => {
      // Extract restaurant coordinates from Overpass API response
      var restaurantCoordinates = data.elements.map(function(element) {
        return {
          lat: element.lat,
          lon: element.lon,
        }
      })
      // Add markers for restaurant coordinates in the user's area
      restaurantCoordinates.forEach(function(coord) {
          L.marker([coord.lat, coord.lon]).addTo(map);
      });
  })
  .catch(error => console.error('Error fetching restaurant data:', error));
});

// Marker
L.marker([33.7018381,-78.8711748], {
  title: "River City Cafe"
})
.bindPopup(`
  <span class="popup">
    <h2> River City Cafe </h2>
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

