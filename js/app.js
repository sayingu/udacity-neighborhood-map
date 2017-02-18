var initMap = function(){
	var myLatLng = {lat: -25.363, lng: 131.044};

	// Create a map object and specify the DOM element for display.
	this.map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng,
		zoom: 4
	});
}

var list = function(){
	var url = "https://api.foursquare.com/v2/venues/search?" +
		"client_id=0NLQ5FK4IS1NAGQAOEIFXHEI0L1AZ0ATISBGPJ2LDBXH3BJY&" +
		"client_secret=Y4ANNOQHEVKX40HNXT3SG4NK3IGHP4ETLEOKNL1FOFPIC5JR&" +
		"v=20170218&" +
		"near=" + encodeURI($("input[name='address']").val());

	$.ajax({
		dataType: "json",
		url: url,
		beforeSend: function(){
			$("#alert").hide();
		},
		success: function(data){
			var html = "";
			if (data && data.meta.code == 200) {
				var venues = data.response.venues;

				var latlngbounds = new google.maps.LatLngBounds();
				for (var i=0; i<venues.length; i++) {
					if (venues[i]) {
						if (i == 0) {
							map.setCenter(new google.maps.LatLng(venues[i].location.lat, venues[i].location.lng));
						}

						html += "<a href='' class='list-group-item'>" + venues[i].name + "</a>";

						var marker = new google.maps.Marker({
							position: {lat: venues[i].location.lat, lng: venues[i].location.lng},
							map: map
						});

						latlngbounds.extend({lat: venues[i].location.lat, lng: venues[i].location.lng});
					}
				}
				map.fitBounds(latlngbounds);
			}
			
			$("#list").html(html);
		},
		error: function(data) {
			var html = "";
			html += "<strong>" + data.responseJSON.meta.errorType + "</strong>";
			html += " " + data.responseJSON.meta.errorDetail;
			$("#alert").html(html).show();
		}
	});
};

$(document).ready(function(){
	$("#btn_search").on("click", list);
});
