var songresultTemplate = Handlebars.compile($("#songresultTemplate").html());

var lyricsQuery = function(a, s) {
	return "http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist="
						+ encodeURIComponent(a) + "&song=" + encodeURIComponent(s);
}

var lyricsLoader = function(a, t) {
	var site = lyricsQuery(a, t);
	var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + site + '"') + '&format=xml&callback=?';

	$.getJSON(yql, function(r) {
		$.mobile.loading('hide');
		if (r.query.count == 0) {
			/* Query failed. */
			$("#lyricsview").html("Failed to load lyrics. Please try again");
		} else {
			console.log(r);
			var xml = r.results[0];
console.log($(xml).find("Lyric").text());
			$("#lyricsview").html($(xml).find("Lyric").text()).listview("refresh");
		}
	})
}

$("form").submit(function(e) {
	e.preventDefault();
	var a = $("#artist").val();
	var query = "http://developer.echonest.com/api/v4/song/search?callback=?";
	$.mobile.loading('show', {text: "Searching songs...", textVisible: true});
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
		$.mobile.loading('hide');
	  var rawsongs = response.response.songs;
	  var songs = {};
		for (var i = 0 ; i < rawsongs.length; i++) {
			var key = rawsongs[i].artist_id + rawsongs[i].song_hotttnesss.toString();
			if (!(key in songs))
				songs[key] = rawsongs[i];
		}
		console.log(songs);
		$("#songresults").html(songresultTemplate({songs: songs})).listview("refresh");
		$(".openLyrics").on('click', function() {
			$.mobile.loading('show', {text: "Retrieving lyrics...", textVisible: true});
			var self = $(this);
			console.log(self, self.data("artist"), self.data("title"));
			lyricsLoader(self.data("artist"), self.data("title"));
		});
	})

});