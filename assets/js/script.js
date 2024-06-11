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

// Slider Calories JS
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

