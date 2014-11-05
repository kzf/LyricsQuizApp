
var lyricsQuery = function(a, s) {
	return "http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist="
						+ encodeURIComponent(a) + "&song=" + encodeURIComponent(s);
}

var lyricsLoader = function(a, t) {
	return function() {
				var site = lyricsQuery(a, t);
				var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + site + '"') + '&format=xml&callback=?';

				$.getJSON(yql, function(r) {
					if (r.query.count == 0) {
						/* Query failed. */
						$(".lyrics").html("Failed to load lyrics. Please try again");
					} else {
						console.log(r);
						var xml = r.results[0];

						$(".lyrics").html($(xml).find("Lyric").text());
					}
				});
			}
}

$("#submit").click(function() {
	var a = $("#artist").val();
	var query = "http://developer.echonest.com/api/v4/song/search?callback=?";
	$.getJSON(query, {
		combined: a,
		sort: 'song_hotttnesss-desc',
		format: 'jsonp',
		bucket: 'song_hotttnesss',
		api_key: 'PN76ZGJURTRYCDD3L',
		results: 100
	}, function(response, a, b) {
		/* Remove duplicate songs from the response by matching songs with the 
	     same artist and hotttnesss */
		console.log(response.response, a, b);
	  var rawsongs = response.response.songs;
	  var songs = {};
		for (var i = 0 ; i < rawsongs.length; i++) {
			var key = rawsongs[i].artist_id + rawsongs[i].song_hotttnesss.toString();
			if (!(key in songs))
				songs[key] = rawsongs[i];
		}
		$(".content").html("");
		for (var s in songs) {
			var link = $("<a href='#'>" + songs[s].title + "</a><br />");
			link.click(lyricsLoader(songs[s].artist_name, songs[s].title));
			$(".content").append(link);
		}	
	})

});