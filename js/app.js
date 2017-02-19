var clientSecretStr = "client_id=0NLQ5FK4IS1NAGQAOEIFXHEI0L1AZ0ATISBGPJ2LDBXH3BJY&" +
	"client_secret=Y4ANNOQHEVKX40HNXT3SG4NK3IGHP4ETLEOKNL1FOFPIC5JR&";

var versionStr = "v=20170220";

/**
* @description Represents a book
* @constructor
* @param {string} title - The title of the book
* @param {string} author - The author of the book
* @returns {number} Sum of a and b
*/
var AlertError = function(data){
	this.show = ko.observable(data.show);
	this.type = ko.observable(data.type);
	this.detail = ko.observable(data.detail);
};

/**
* @description Represents a book
* @constructor
* @param {string} title - The title of the book
* @param {string} author - The author of the book
* @returns {number} Sum of a and b
*/
var Item = function(data){
	// this.id = ko.observable(data.id);
	this.name = ko.observable(data.name);
	this.marker = ko.observable(data.marker);
	// this.tips = ko.observable(data.stats.tips);
	// this.photos = ko.observable(data.stats.photos);
};

var ViewModel = function() {
    var self = this;
	
	// Init error msg model
	this.alertError = ko.observable({show: false, type: '', detail: ''});

	// Init left side lists model
	this.list = ko.observableArray([]);
	
	this.initList = function(pos){
		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/search?" +
				clientSecretStr + versionStr,
			data: "ll=" + pos.lat + "," + pos.lng,
			beforeSend: function(){
				self.alertError({show: false, type: '', detail: ''});
			},
			success: function(data){
				if (data && data.meta.code == 200) {
					var venues = data.response.venues;
					venues.forEach(function(venu){
						//
						venu.marker = new google.maps.Marker({
							position: {lat: venu.location.lat, lng: venu.location.lng},
							map: map
						});

						venu.marker.addListener('click', function() {
							self.selectLocation(venu);
						});

						// Push list model
						self.list.push(venu);
					});
				}
			},
			error: function(data){
				self.alertError({
					show: true,
					type: data.responseJSON.meta.errorType,
					detail: data.responseJSON.meta.errorDetail
				});
			}
		});
	};

	// Filter to search result lists
	this.filterList = function(){
		// TODO
	};

	// Select left side lists item or marker in map.
	// Show additional data in maps infoWindow
	this.selectLocation = function(venu){
		// All markers set to default
		self.list().forEach(function(item){
			item.marker.setAnimation(null);
			item.marker.setIcon('https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1');
		});

		// Changing color and drop animation to the marker
		venu.marker.setIcon('https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png');
		venu.marker.setAnimation(google.maps.Animation.DROP);
		
		// TODO
		// Get foursquare photos and tips if that has count over 0
		self.setDetail(venu);
	};

	this.setDetail = function(venu){
		var address = venu.location.formattedAddress[0] + 
			(venu.location.formattedAddress[1]?", " + venu.location.formattedAddress[1]:"");
		var contentString = '<div class="info-content">' +
			'<h4>' + venu.name + '</h4>' +
			'<p>' + address + '</p>' +
			'</div>';
		infowindow.setContent(contentString);
		infowindow.open(map, venu.marker);

		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/" + venu.id + "/photos?" +
				clientSecretStr + versionStr,
			beforeSend: function(){
				self.alertError({show: false, type: '', detail: ''});
			},
			success: function(data){
				if (data && data.meta.code == 200) {
					var photos = data.response.photos;
					if (photos.count > 0) {
						var items = photos.items;

						// Display detail information to infoWindow
						var photoString = '<div class="info-img">' +
							'<img src="' + items[0].prefix + '100x100' + items[0].suffix + '">' +
							'</div>';

						infowindow.setContent(photoString + contentString);
					}
				}
			},
			error: function(data){
				self.alertError({
					show: true,
					type: data.responseJSON.meta.errorType,
					detail: data.responseJSON.meta.errorDetail
				});
			}
		});

		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/" + venu.id + "/tips?" +
				clientSecretStr + versionStr,
			beforeSend: function(){
				self.alertError({show: false, type: '', detail: ''});
			},
			success: function(data){
				if (data && data.meta.code == 200) {
					console.dir(data);

					// TODO: Add tips to detail

					/*
					var photos = data.response.photos;
					if (photos.count > 0) {
						var items = photos.items;

						// Display detail information to infoWindow
						var photoString = '<div class="info-img">' +
							'<img src="' + items[0].prefix + '100x100' + items[0].suffix + '">' +
							'</div>';

						infowindow.setContent(photoString + contentString);
					}
					*/
				}
			},
			error: function(data){
				self.alertError({
					show: true,
					type: data.responseJSON.meta.errorType,
					detail: data.responseJSON.meta.errorDetail
				});
			}
		});
	}
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

/**
* @description Google Map API Initialize function
*/
var initMap = function(){
	// Set default location to "Trafalgar Square, London, England"
	var myLatLng = {lat: 51.508027, lng: -0.128081};

	this.map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng,
		zoom: 18
	});

	this.infowindow = new google.maps.InfoWindow({});

	// Call knockout initList function
	viewModel.initList(myLatLng);

	/*
	* If set default location lists by users current locations,
	* Uncomment this.
	*
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var currLatLng = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(currLatLng);

			viewModel.initList(currLatLng);
		}, function(){
			viewModel.initList(myLatLng);
		});
	} else {
	}
	*/
};