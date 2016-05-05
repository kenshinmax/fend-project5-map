// main app file

// app data
var initialMuseums =
  [
    {	
   	  name: "LI Childrens Museum",
   	  lat: "40.732616",
   	  long: "-73.599392"
    },
    {
     name: "Brooklyn Childrens Museum",
     lat: "40.687474",
     long: "-73.941143"
    },
    {
     name: "Flushing Museum of Science",
     lat: "40.747675",
     long: "-73.851681"
    }
  ];

// Object that represents a Museum
var Museum = function ( data ) {
   this.name = ko.observable(data.name);
   this.lat = ko.observable(data.lat);
   this.long = ko.observable(data.long);
};

// View for list of museums
var listView = function () {
	var map;
    
    
}

// app viewModel
var viewModel = function () {
   var self = this;
   var newYork = new google.maps.LatLng(40.7493, -73.6407);
   //var newYork = {lat: -33.866, lng: 151.196};
   this.museumList = ko.observableArray([]);

   this.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
          mapTypeControl: true,
          center: newYork,
          zoom: 12,
          mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_CENTER
          },
          zoomControl: true,
          zoomControlOptions: {
              position: google.maps.ControlPosition.LEFT_CENTER
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
              position: google.maps.ControlPosition.LEFT_TOP
          },
          fullscreenControl: true
        });

       var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: newYork,
          radius: 500,
          type: ['store']
        }, this.processResults);
   }
   // populate the array
   initialMuseums.forEach( function(museumItem) {
      self.museumList.push(new Museum(museumItem));
   });
   
   this.processResults = function (results, status, pagination) {
   	console.log("Calling processResults!!!");
     if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
     } else {
       createMarkers(results);

     }
   }

   this.createMarkers = function (places) {
   	   console.log("Calling create markers!!!");
       var bounds = new google.maps.LatLngBounds();
       var placesList = document.getElementById('places');

       for (var i = 0, place; place = places[i]; i++) {
          var image = {
           url: place.icon,
           size: new google.maps.Size(71, 71),
           origin: new google.maps.Point(0, 0),
           anchor: new google.maps.Point(17, 34),
           scaledSize: new google.maps.Size(25, 25)
       };

       var marker = new google.maps.Marker({
           map: map,
           icon: image,
           title: place.name,
           position: place.geometry.location
       });

    placesList.innerHTML += '<li>' + place.name + '</li>';

    bounds.extend(place.geometry.location);
  }
  map.fitBounds(bounds);
}
   google.maps.event.addDomListener(window, 'load', this.initMap);
};

$(function(){
 ko.applyBindings(new viewModel());
});