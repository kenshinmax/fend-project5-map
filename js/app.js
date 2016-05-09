// main app file

var infowindow;
var map;
var service;
var lat;
var lng;
var newYork =  {lat: 40.7493, lng: -73.6407};


// google callback funciton to get things started
function initMap () {

  // Define the controls and display
  map = new google.maps.Map(document.getElementById('map'), {
   mapTypeControl: true,
   center: newYork,
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
  
  
  ko.applyBindings(new viewModel());
}
// end if initMap()

 // Will let the user know when Google Maps fails to load.
function failedToLoad() {
         $('#map').html("Google Maps Failed to Load");
}

// Finds the center of the map to get lat and lng values
function computeCenter() {
    var latAndLng = map.getCenter();
      lat = latAndLng.lat();
      lng = latAndLng.lng(); 
}


// app viewModel
var viewModel = function () {
   var self = this;
   self.filterLetter = ko.observable();
   self.placeList = [];
   self.markersArray = [];
   // string to hold foursquare information
   self.foursquareInfo = '';
   // Plot the list of initial places
   getInitialPlaces();

   computeCenter();

   infowindow = new google.maps.InfoWindow();
   var list = (document.getElementById('right-panel'));
   map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(list);


   // add the searchbox
   // Create the search box and link it to the UI element.
   var input = document.getElementById('pac-input');
   var searchBox = new google.maps.places.SearchBox(input);
        
   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
   
   // Object to represent data
   var Place = function ( data ){
   this.name = data.name;
   this.location = data.geometry.location;
   this.id = data.place_id;
   var image = {
             url: data.icon,    
             scaledSize: new google.maps.Size(25, 25)
           };
   this.marker = new google.maps.Marker({
    position: data.geometry.location,
    title: this.name,
    icon: image,
    map: map,
    animation: google.maps.Animation.DROP
   });

   var contentString = '<div style="font-weight: bold">' + data.name + '</div>' + self.foursquareInfo;
 
   google.maps.event.addListener(this.marker, 'click', function() {      
    infowindow.setContent(contentString);      
    infowindow.open(map, this);
    map.panTo(data.geometry.location); 
    this.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){this.marker.setAnimation(null);}, 1450);
   }); 
  }; 

  function getInitialPlaces() {
       var request = {
         location: newYork,
        radius: 600,
        types: ['museums', 'food']
       };

       infowindow = new google.maps.InfoWindow();
       service = new google.maps.places.PlacesService(map);

       // constrcut the request and invoke Google callback
       service.nearbySearch(request, processResults);    
  }  

  // manage results and create markers 
  function processResults (results, status, pagination) {  	  
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
         return;
       } else {
         createMarkers(results);
       }
  }

  // Markers for the map.  Set the bounds for the map to fit each marker
  function createMarkers (places) {  

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
        bounds.extend(place.geometry.location);
     }
      
    // Take the results of the search and push them into a ko array
    self.placeList = ko.utils.arrayMap(places, function(item) {
      return new Place(item);
    });
         
     map.fitBounds(bounds);
  }
     
  /*
    Function that will pan to the position and open an info window of an item clicked in the list.
  */
  self.clickMarker = function (place) {
    var _place;
   
    for(var e = 0; e < self.placeList.length; e++) {      
      if(place.id === self.placeList[e].id) { 
        _place = self.placeList[e];
        break; 
      }
    }
    self.getFoursquareInfo(_place);
    map.panTo(_place.marker.position);   

  };
   
  // function to filter KO seach box and markers
  self.filteredItems = ko.computed(function() {
    var filter = self.filterLetter();
    
    if (!filter) {
      return ko.utils.arrayFilter(self.placeList, function(item) {
        item.marker.setVisible(true);
        return true;
      });
    }

    return ko.utils.arrayFilter(self.placeList, function(item) {
      if (item.name.toLowerCase().indexOf(filter) === 0) {
        return true
      } else {
        item.marker.setVisible(false);
        return false
      };
    });

  }, this);
  
  // Foursquare Credentials
  var clientID = 'N0WMOXAOMVUA0DE54FKXEVNKMOJQ02YDNFSFNEXKTEKYGB2G';
  var clientSecret = '33DZIX5ZKDQQF1L0R3ATMQKPT3YX5BELITTVBWSFMKZS3QM2';

  self.getFoursquareInfo = function(point) {
    // creats our foursquare URL
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20130815' + '&ll=' +lat+ ',' +lng+ '&query=\'' +point.name +'\'&limit=1';
    
    $.getJSON(foursquareURL)
      .done(function(response) {
        self.foursquareInfo = '<p>Foursquare:<br>';
        var venue = response.response.venues[0];         
        // Name       
        var venueName = venue.name;
            if (venueName !== null && venueName !== undefined) {
                self.foursquareInfo += 'Name: ' +
                  venueName + '<br>';
            } else {
              self.foursquareInfo += 'Name: Not Found';
            }   
        // Phone Number     
        var phoneNum = venue.contact.formattedPhone;
            if (phoneNum !== null && phoneNum !== undefined) {
                self.foursquareInfo += 'Phone: ' +
                  phoneNum + '<br>';
            } else {
              self.foursquareInfo += 'Phone: Not Found';
            }
        // Twitter
        var twitterId = venue.contact.twitter;
            if (twitterId !== null && twitterId !== undefined) {
              self.foursquareInfo += 'twitter: @' +
                  twitterId + '<br>';
            } 
      });
  };  
};
