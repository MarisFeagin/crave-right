function initMap() {

  const centerMap = {lat: 36.042787, lng: -161.6333136,}
   
   const mapOptions = {
     center: centerMap,
     zoom: 8,
   } 
  
   const map = new google.maps.Map(document.getElementById('map'), mapOptions);
};