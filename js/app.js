// main app file

var infowindow;
var map;
var service;
var lat;
var lng;
var newYork =  {lat: 40.7493, lng: -73.6407};
var markersArray = [];

var self = this;
self.filterLetter = ko.observable();
self.placeList = ko.observableArray();

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
  
  infowindow = new google.maps.InfoWindow();
   var list = (document.getElementById('right-panel'));
   map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(list);


   // add the searchbox
   // Create the search box and link it to the UI element.
   var input = document.getElementById('pac-input');
   var searchBox = new google.maps.places.SearchBox(input);
        
   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
  // set up
  ko.applyBindings(new viewModel());
  getInitialPlaces();
  computeCenter();
 
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
  

   // string to hold foursquare information
   self.foursquareInfo = '';

 // function to filter KO seach box and markers
  self.filteredItems = ko.computed(function() {
    var filter = self.filterLetter();
    
    if (!filter) {
      return ko.utils.arrayFilter(self.placeList(), function(item) {
        item.marker.setVisible(true);
        return true;
      });
    }

    return ko.utils.arrayFilter(self.placeList(), function(item) {
      if (item.name.toLowerCase().indexOf(filter) === 0) {
        return true;
      } else {
        item.marker.setVisible(false);
        return false;
      };
    });

    }, self);
 };
 // end of viewModel
       

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
// Object to represent data
var Place = function ( data ){
     this.name = data.name;
     this.location = data.geometry.location;
     this.id = data.place_id;

     this.marker = createMarker(data);
}
// Markers for the map.  Set the bounds for the map to fit each marker
function createMarkers (places) {  
    bounds = new google.maps.LatLngBounds();
    
    places.forEach(function (place){
       
        self.placeList.push(new Place(place));
        
        bounds.extend(new google.maps.LatLng(
          place.geometry.location.lat(),
          place.geometry.location.lng()));
    });  

    // adjust map
    map.fitBounds(bounds);
    
    // Take the results of the search and push them into a ko array
    //self.placeList = ko.utils.arrayMap(places, function(item) {
     // return new Place(item);
    //});

    
  }
     
     /*
  Function to create a marker at each place.  This is called on load of the map with the pre-populated list, and also after each search.  Also sets the content of each place's infowindow.
  */
  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      name: place.name.toLowerCase(),
      position: place.geometry.location,
      place_id: place.place_id,
      animation: google.maps.Animation.DROP
    });    
    var address;
    if (place.vicinity !== undefined) {
      address = place.vicinity;
    } else if (place.formatted_address !== undefined) {
      address = place.formatted_address;
    }       
    var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' + address + '</div>' + self.foursquareInfo ;

    google.maps.event.addListener(marker, 'click', function() {      
      infowindow.setContent(contentString);      
      infowindow.open(map, this);
      map.panTo(marker.position); 
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){marker.setAnimation(null);}, 1450);
    });

    markersArray.push(marker);

    return marker;
  }

  /*
    Function that will pan to the position and open an info window of an item clicked in the list.
  */
  self.clickMarker = function (place) {
    var _place;
   
    for(var e = 0; e < self.placeList().length; e++) {      
      if(place.id === self.placeList()[e].id) { 
        _place = self.placeList()[e];
        break; 
      }
    }
    self.getFoursquareInfo(_place);
    map.panTo(_place.marker.position);   
 
 // waits 300 milliseconds for the getFoursquare async function to finish
    setTimeout(function() {
      var contentString = '<div style="font-weight: bold">' + _place.name + '</div>' + self.foursquareInfo;
      infowindow.setContent(contentString);
      infowindow.open(map, _place.marker); 
      _place.marker.setAnimation(google.maps.Animation.DROP); 
    }, 300);     
  };

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