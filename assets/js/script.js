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

// Filter Markers
let myJSON=[
     {
       lat:10,
       lon:10,
       demographic:['youth']
     },
     {
       lat:6,
       lon:10,
       demographic:['adults','men']
     },
     {
       lat:10,
       lon:12,
       demographic:['adults']
     },
     {
       lat:7,
       lon:8,
       demographic:['adults','seniors','women']
     }
   ]

let myMarkers = L.featureGroup().addTo(map);

filter();
btnForm.onclick=()=>filter();

function filter() {

	myMarkers.clearLayers();

	let myJSONcopy = JSON.parse(JSON.stringify(myJSON));

	let categories=[];
  
	if (cbAdults.checked) {
  	categories.push('adults');
  }
  if (cbYouth.checked) {
  	categories.push('youth');
  }
  if (cbSeniors.checked) {
  	categories.push('seniors')
  }
  if (cbMen.checked) {
  	categories.push('men');
  }
  if (cbWomen.checked) {
  	categories.push('women');
  }
  
  
  for (let i=0;i<myJSONcopy.length;i++){
   for (let j=0;j<categories.length;j++){
   	for (let k=0;k<myJSONcopy[i].demographic.length;k++)
    	if (categories[j]==myJSONcopy[i].demographic[k] && !myJSONcopy[i].added){
      	L.circleMarker([myJSONcopy[i].lat,myJSONcopy[i].lon]).addTo(myMarkers);
        myJSONcopy[i].added=true;
        break;
      }
   }
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

