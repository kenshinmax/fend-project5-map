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


// Object to represent data
var Place = function ( data ){
   this.name = data.name;
   this.location = data.geometry.location;
   this.id = data.place_id;
}; 


// app viewModel
var viewModel = function () {
   var self = this;
   self.newYork =  {lat: 40.7493, lng: -73.6407};
   self.placeList = ko.observableArray([]);
   self.markersArray = [];
   var infowindow;


   // Finds the center of the map to get lat and lng values
  self.computeCenter = function() {
    var latAndLng = map.getCenter();
      lat = latAndLng.lat();
      lng = latAndLng.lng(); 
   }

   self.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
          mapTypeControl: true,
          center: self.newYork,
          zoom: 12,
          mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_LEFT
          },
          zoomControl: true,
          zoomControlOptions: {
              position: google.maps.ControlPosition.LEFT_CENTER
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          fullscreenControl: true
        });

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: self.newYork,
          radius: 500,
          type: ['museums']
        }, self.processResults);
        self.computeCenter();

        infowindow = new google.maps.InfoWindow();
        var list = (document.getElementById('right-panel'));
        map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(list);


        // add the searchbox
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // add searchbox listener

        searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        
          if (places.length == 0) {
           return;
           }
            // Clear out the old markers.
          self.markersArray.forEach(function(marker) {
            marker.setMap(null);
          });
          
          // Clear out my observable array
          self.placeList.removeAll();

          // Loop over the results of the search
          places.forEach(function(place) {
             self.createMarker(place);
             //self.placeList.push( new Place(p))
          });
        
          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          
          self.createMarkers(places);
          map.fitBounds(bounds);
          self.computeCenter();
        });
        google.maps.event.addListener(map, 'bounds_changed', function(){
        var bounds = map.getBounds();
         searchBox.setBounds(bounds);
        });   

   };
  // end if initMap()
   
   this.processResults = function (results, status, pagination) {
   	
     if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
     } else {
       self.createMarkers(results);

     }
   };

   // Markers for the map.  Set the bounds for the map to fit each marker
   this.createMarkers = function (places) {  
       var bounds = new google.maps.LatLngBounds();
       for (var i = 0, place; place = places[i]; i++) {
            bounds.extend(place.geometry.location);
            self.createMarker (place);
       }
      
       // Take the results of the search and push them into a ko array
       places.forEach( function(placeItem) {
          self.placeList.push( new Place(placeItem));
       }); 

       map.fitBounds(bounds);
   };
   
  /*
   *  Method to handle each marker creation and add the eventListener
  */
  self.createMarker = function (place) {
      
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
             place_id: place.place_id,
             position: place.geometry.location,
             animation: google.maps.Animation.DROP
           });
       var contentString = '<div style="font-weight: bold">' + place.name + '</div>';

       google.maps.event.addListener(marker, 'click', function() {      
          infowindow.setContent(contentString);      
          infowindow.open(map, this);
          map.panTo(marker.position); 
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){marker.setAnimation(null);}, 1450);
       });
       self.markersArray.push(marker);
      
  }  
   /*
  }
  Function that will pan to the position and open an info window of an item clicked in the list.
  */
  self.clickMarker = function(place) {
    var marker;
    
    for(var e = 0; e < self.markersArray.length; e++) {      
      if(place.id === self.markersArray[e].place_id) { 
        marker = self.markersArray[e];
        break; 
      }
    }

    map.panTo(marker.position);   

    // waits 300 milliseconds
    setTimeout(function() {
      var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>';
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