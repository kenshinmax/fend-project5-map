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

var Place = function ( data ){
   this.name = ko.observable(data.name);
}; 

// View for list of museums
var listView = function () {
	var map;
    
    
}

// app viewModel
var viewModel = function () {
   var self = this;
   self.newYork =  {lat: 40.7493, lng: -73.6407};
   //var newYork = {lat: -33.866, lng: 151.196};
   self.museumList = ko.observableArray([]);
   self.placeList = ko.observableArray([]);
   
   var infowindow;
   self.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
          mapTypeControl: true,
          center: self.newYork,
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
          location: self.newYork,
          radius: 500,
          type: ['museums']
        }, self.processResults);

        infowindow = new google.maps.InfoWindow();
   }
   // populate the array
   initialMuseums.forEach( function(museumItem) {
      self.museumList.push(new Museum(museumItem));
   });
   
   this.processResults = function (results, status, pagination) {
   	
     if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
     } else {
       self.createMarkers(results);

     }
   }

   this.createMarkers = function (places) {
   	   
       var bounds = new google.maps.LatLngBounds();
       //var placesList = document.getElementById('places');

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
       // Take the results of the search and push them into a ko array
       places.forEach( function(placeItem) {
          self.placeList.push( new Place(placeItem));
       }); 
      var contentString = '<div style="font-weight: bold">' + place.name + '</div>';

      google.maps.event.addListener(marker, 'click', function() {      
        infowindow.setContent(contentString);      
        infowindow.open(map, this);
        map.panTo(marker.position); 
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){marker.setAnimation(null);}, 1450);
      });

     bounds.extend(place.geometry.location);
     }
     map.fitBounds(bounds);
   }

   /*
  Function that will pan to the position and open an info window of an item clicked in the list.
  */
  self.clickMarker = function(place) {
    var marker;

    for(var e = 0; e < markersArray.length; e++) {      
      if(place.place_id === markersArray[e].place_id) { 
        marker = markersArray[e];
        break; 
      }
    } 
    //self.getFoursquareInfo(place);         
    map.panTo(marker.position);   

    // waits 300 milliseconds for the getFoursquare async function to finish
    setTimeout(function() {
      var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' 
      infowindow.setContent(contentString);
      infowindow.open(map, marker); 
      marker.setAnimation(google.maps.Animation.DROP); 
    }, 300);     
  };

   google.maps.event.addDomListener(window, 'load', this.initMap);
};

$(function(){
 ko.applyBindings(new viewModel());
});