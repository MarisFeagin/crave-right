// Map JS
var map = L.map('map').setView([39.38064969597025, -97.90948071443827], 5);

      var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      osm.addTo(map);

// Drop down JS Diets
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("Diets").classList.toggle("show-diets");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn-diets')) {
    var dropdowns = document.getElementsByClassName("dropdown-content-diets");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show-diets')) {
        openDropdown.classList.remove('show-diets');
      }
    }
  }
};

// Drop down JS Allergens
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("Allergens").classList.toggle("show-allergens");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn-allergens')) {
    var dropdowns = document.getElementsByClassName("dropdown-content-allergens");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show-allergens')) {
        openDropdown.classList.remove('show-allergens');
      }
    }
  }
};

// Slider JS Calories
var sliderCal = document.getElementById("calories-per-meal");
var outputCal = document.getElementsById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
};


