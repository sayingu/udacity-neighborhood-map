var clientSecretStr = "client_id=0NLQ5FK4IS1NAGQAOEIFXHEI0L1AZ0ATISBGPJ2LDBXH3BJY&" +
	"client_secret=Y4ANNOQHEVKX40HNXT3SG4NK3IGHP4ETLEOKNL1FOFPIC5JR&";

/**
* @description Version string for foursquare api
* @returns {string} 8 digital string for today
*/
var versionStr = function(){
	var dt = new Date();

	var month = dt.getMonth()+1;
	month = (month<10?"0"+month:month);
	var day = dt.getDate();
	day = (day<10?"0"+day:day);

	return "v=" + dt.getFullYear() + month + day;
};

/**
* @description Represents the alert message
* @constructor
* @param {boolean} data.show - Flag for alert display show
* @param {string} data.type - Error type
* @param {string} data.detail - Detail error message
*/
var AlertError = function(data){
	this.show = ko.observable(data.show);
	this.type = ko.observable(data.type);
	this.detail = ko.observable(data.detail);
};

/**
* @description Represents the item
* @constructor
* @param {string} data.name - Place name
* @param {object} data.marker - Object for Google map marker
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
	// Set error msg model to hide
	this.hideError = function(){
		self.alertError({show: false, type: '', detail: ''});
	};
	// Set error msg model to show
	this.showError = function(data){
		self.alertError({
			show: true,
			type: data.responseJSON.meta.errorType,
			detail: data.responseJSON.meta.errorDetail
		});
	};

	
	this.list = ko.observableArray([]);
	// Init left side lists model
	this.initList = function(pos){
		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/search?" +
				clientSecretStr + versionStr(),
			data: "ll=" + pos.lat + "," + pos.lng,
			beforeSend: self.hideError,
			success: function(data){
				if (data && data.meta.code == 200) {
					var venues = data.response.venues;
					venues.forEach(function(venu){
						// Make Google map marker
						venu.marker = new google.maps.Marker({
							position: {lat: venu.location.lat, lng: venu.location.lng},
							map: map
						});

						// Add click event to Google map marker
						venu.marker.addListener('click', function() {
							self.selectLocation(venu);
						});

						// Push list model
						self.list.push(venu);
					});
				}
			},
			error: function(data){
				self.showError(data);
			}
		});
	};

	// Filter to search result lists
	this.keyword = ko.observable($("#keyword").val());

	// Change observable variable only at click event
	this.filter = function(){
		self.keyword($("#keyword").val());
	};


	this.filteredList = ko.computed(function(){
		var keyword = self.keyword();

		// Filter Google map markers
		if (!keyword) {
			self.list().forEach(function(item){
				item.marker.setMap(map);
			});
		} else {
			self.list().forEach(function(item){
				if (item.name.indexOf(keyword) > -1) {
					item.marker.setMap(map);
				} else {
					item.marker.setMap(null);
				}
			});
		}
		
		// Return filtered list
		if (!keyword) {
			return self.list();
		} else {
			return ko.utils.arrayFilter(self.list(), function(item){
				return item.name.indexOf(keyword) > -1;
			});
		}
	});
	
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
		
		// Set detail information to Google map infoWindow
		self.setDetail(venu);
	};

	this.setDetail = function(venu){
		// Get foursquare contents
		var address = venu.location.formattedAddress[0] + 
			(venu.location.formattedAddress[1]?", " + venu.location.formattedAddress[1]:"");
		var contentString = '<div class="info-content">' +
			'<h4>' + venu.name + '</h4>' +
			'<p>' + address + '</p>' +
			'</div>';
		infowindow.setContent(contentString);
		infowindow.open(map, venu.marker);

		// Get foursquare photos
		var photoString = "";
		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/" + venu.id + "/photos?" +
				clientSecretStr + versionStr(),
			beforeSend: self.hideError,
			success: function(data){
				if (data && data.meta.code == 200) {
					var photos = data.response.photos;
					if (photos.count > 0) {
						var items = photos.items;

						// Add photo to infoWindow
						photoString = '<div class="info-img">' +
							'<img src="' + items[0].prefix + '100x100' + items[0].suffix + '">' +
							'</div>';

						infowindow.setContent(photoString + contentString);
					}
				}
			},
			error: function(data){
				self.showError(data);
			}
		});

		// Get foursquare tips
		var tipString = "";
		$.ajax({
			dataType: "json",
			url: "https://api.foursquare.com/v2/venues/" + venu.id + "/tips?" +
				clientSecretStr + versionStr(),
			beforeSend: self.hideError,
			success: function(data){
				console.dir(data);
				if (data && data.meta.code == 200) {
					// TODO: Add tips to detail
					var tips = data.response.tips;
					if (tips.count > 0) {
						var items = tips.items;

						// Add tip to infoWindow
						tipString = '<div class="info-tip">' +
							'<img src="' + items[0].user.photo.prefix + '20x20' + items[0].user.photo.suffix + '">' +
							'<h5>' + items[0].user.firstName + (items[0].user.lastName?' ' + items[0].user.lastName:'') + '</h5>' +
							'<p>' + items[0].text + '</p>' +
							'</div>';

						infowindow.setContent(photoString + contentString + tipString);
					}
				}
			},
			error: function(data){
				self.showError(data);
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