var list = function(){
	var url = "https://api.foursquare.com/v2/venues/search?" +
		"client_id=0NLQ5FK4IS1NAGQAOEIFXHEI0L1AZ0ATISBGPJ2LDBXH3BJY&" +
		"client_secret=Y4ANNOQHEVKX40HNXT3SG4NK3IGHP4ETLEOKNL1FOFPIC5JR&" +
		"v=20170218&" +
		"near=" + encodeURI($("input[name='address']").val());

	//alert(url);
	//return;

	$.ajax({
		dataType: "json",
		url: url,
		success: function(data){
			var html = "<ul>";
			if (data && data.meta.code == 200) {
				var venues = data.response.venues;
				for (var i=0; i<venues.length; i++) {
					if (venues[i]) {
						html += "<li>" + venues[i].name + "</li>";
					}
				}
			}
			html += "</ul>";
			
			$("#list").html(html);
		}
	});
};

$(document).ready(function(){
	$("input[name='submit']").on("click", list);
});
