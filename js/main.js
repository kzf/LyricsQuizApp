var quizzes = {};
quizzes['80spop'] = { title: "80s Pop Quiz" }

var songresultTemplate = Handlebars.compile($("#songresultTemplate").html());
var favouritesTemplate = Handlebars.compile($("#favouritesTemplate").html());

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

	$("#addFavourite").data("song", true).data("title", t).data("artist", a);
}

$("#addFavourite").click(function() {
	var self = $(this);
	var song = Boolean(self.data("song"));
	var title = self.data("title");
	var artist = self.data("artist");
	var favs = JSON.parse(localStorage["favourites"]);
	favs.push({song: song, artist: artist, title: title});
	localStorage["favourites"] = JSON.stringify(favs);
	$("#favouriteslist").html(favouritesTemplate({favourites: favs})).listview("refresh");
})

var searchByCombined = function(c) {
	$.mobile.loading('show', {text: "Searching songs...", textVisible: true});
	var query = "http://www.chartlyrics.com/search.aspx?q=" + encodeURIComponent(c);
	var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + 
						encodeURIComponent('select * from html where url="' + query + 
						'" and xpath="//tr/td[not(@style)]/a"') + '&format=json&callback=?';
	$.getJSON(yql, function(r) {
		$('body').pagecontainer("change", "#results");
		$.mobile.loading('hide');
		var songs = {};
		console.log(r.query.results.a);
		r.query.results.a.forEach(function(a, i) {
			var data = a.content.split(' - ');
			songs[i] = { artist_name: data[0], title: data[1] };
		});
		console.log(songs);
		$("#songresults").html(songresultTemplate({songs: songs})).listview("refresh");
		$(".openLyrics").on('click', function() {
			$.mobile.loading('show', {text: "Retrieving lyrics...", textVisible: true});
			var self = $(this);
			console.log(self, self.data("artist"), self.data("title"));
			lyricsLoader(self.data("artist"), self.data("title"));
		});
	})
}

var loadFavourites = function() {

	var updateFavourites = function(favs) {
		return $("#favouriteslist").html(favouritesTemplate({favourites: favs})).listview("refresh");
	}

	var deleteFavourite = function(id) {
		favs.splice(id, 1);
		localStorage["favourites"] = JSON.stringify(favs);
		updateFavourites(favs).listview("refresh");
	}

	var favs = localStorage["favourites"];
	if (!favs) {
		favs = [
			{ song: true,
				artist: 'Queen',
			  title: 'Bohemian Rhapsody'},
			{ song: false,
				quiz: '80spop' }
		];
		localStorage["favourites"] = JSON.stringify(favs);
	} else {
		console.log("got it");
		favs = JSON.parse(favs);
	}

	$(".deleteFavourite").click(function() {
		var id = $(this).data("index");
		var self = favs[id];
		$("#songToDelete").text(self.song ? self.title : self.quiz);
		$("#confirmDelete").data("index", id);
	});
	
	$("#confirmDelete").click(function() {
		var id = $(this).data("index");
		deleteFavourite(id);
	});

}

var addFavourite = function(song, title, artist) {
	var favs = JSON.parse(localStorage["favourites"]);
	if (song) {
		favs.push({song: true, artist: artist, title: title});
	} else {
		favs.push({song: false, quiz: title});
	}
	localStorage["favourites"] = JSON.stringify(favs);
}

/* Initial Set Up */
loadFavourites();


$("#combinedform").submit(function(e) {
	e.preventDefault();
	var c = $("#combined").val();
	searchByCombined(c);
});

$(document).bind("mobileinit", function(){
	$('body').pagecontainer({defaults: true}).pagecontainer("change", "#search");
});