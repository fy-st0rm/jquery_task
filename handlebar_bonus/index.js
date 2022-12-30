// npm install express
// npm install express-handlebars
// npm install node-fetch
// use fetch to get data from third party sources
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var express = require('express');
var app = express();
var path = require('path');

const handlebars = require('express-handlebars');
//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');
//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', handlebars({
	layoutsDir: __dirname + '/views',
	defaultLayout: null // without this definition it looks for main.handlebars
}));
// for some reason this is required in order to use pm2 with arm-based linux os in order to find views
//app.set('views', __dirname + '/views'); 


var users = [];
users.push({ name: "Ville" });
users.push({ name: "John" });
users.push({ name: "Bertha" });


async function fetch_football_data() {
	var eventList = [
		"1.6.2020 Finland-Sweden", "20.6.2020 Futsal tournament in Kuopio",
		"21.11.2020 Ending of season", "28.11.2020 Little christmas"
	];
	let locations = [];
	let players = [];
	let teams = {};
	let series = [];

	try {
		// Fetching all data
		let loc_res = await fetch("http://animalhospital.freemyip.com/sensor/location");
		let p_res = await fetch("http://animalhospital.freemyip.com/football/players");
		let t_res    = await fetch("http://animalhospital.freemyip.com/football/teams");
		let s_res= await fetch("http://animalhospital.freemyip.com/football/statistics");

		// Assigning data
		locations = await loc_res.json();
		players = await p_res.json();
		series = await s_res.json();

		// Sorting series with descending points
		series.sort((a, b) => {return b.Points - a.Points});

		// Maping teams with respective id
		let tmp = await t_res.json();
		tmp.map((team) => {
			teams[team.Id] = team;
		});

	} catch (error) {
		console.log(error);
	}
	
	return {
		eventList: eventList,
		locations: locations,
		players  : players,
		teams    : teams,
		series   : series
	};
}

app.get('/', function (req, res) {
	// server finds index.handlebars file from views folder and renders it to user
	res.render('index', {
		title: "Ville",
		subtitle: "HELLO EVERYONE"
	});
});

app.get('/football', async function (req, res) {
	var data = await fetch_football_data();
	res.render('football', {
		title  : "Welcome to Football page",
		events : data.eventList,
		options: data.locations,
	});

});

// returns rendered seriestable
app.get('/series', async function (req, res) {
	var data = await fetch_football_data();
	var series = [];
	var i = 1;

	// Constructing series
	data.series.map((team) => {
		series.push({
			Pos         : i,
			Name        : data.teams[team.Id].Name,
			Victories   : team.Victories,
			Lossess     : team.Lossess,
			Goals_done  : team.Goals_done,
			Goals_passed: team.Goals_passed,
			Points      : team.Points
		});
		i += 1;
	});

	res.render('series', {
		series: series
	});
});

// return rendered player table
app.get('/players', async function (req, res) {
	var data = await fetch_football_data();
	var teams = [];

	// Getting names of teams
	for (const team in data.teams) {
		teams.push(data.teams[team].Name);
	}
	// Rendering the list
	res.render('player', {
		players: data.players,
		teams: teams
	});
});


app.get('/devices', async function (req, res) {
	// to test if rendering works
	var devices = null;
	try {
		// this sends http request to url and sets http response to response
		const response = await fetch("http://animalhospital.freemyip.com/sensor/device");
		console.log(response);
		// parses data from content with .json() -function
		devices = await response.json();
		console.log(devices);
	}
	catch (error) {
		console.log(error);
	}
	res.render('device', {
		devices: devices
	})
});


// fetching data with asynchronuous function
app.get('/users', async function (req, res) {
	var devices = null;
	try {
		// fetch actually returns Promise type object. It can either resolve or reject.
		// usually when we fetch data from another server than our own, we ca
		// do it with Promise by awaiting either resolve or reject
		// if data fetch is succesful, data is sent with resolve function
		// this sends http request to url and sets http response to response
		const response = await fetch("http://animalhospital.freemyip.com/sensor/device");
		console.log(response);
		// parses data from content with .json() -function
		devices = await response.json();
		console.log(devices);
	}
	catch (error) { // if promise is reject
		console.log(error);
	}
	if (devices == null) // add "default values" to add some data to page
		devices = [{ deviceid: -1, shorname: "ALL", information: "empty" }];
	res.render('users', {
		userlist: users,
		devices: devices, // we'll put in types to types in handlebars
		languages: ["English", "Finnish", "Swedish"]
	});
});

app.get('/users2', function (req, res) {
	// working example of handling promises with callback functions
	// async is not required when doing this
	fetch("http://animalhospital.freemyip.com/sensor/device").then(function (data) {
		console.log("types = " + JSON.stringify(data));
		return data.json(); // data is returned to callback function as a parameter
	}).then((devices) => { 
		// if you want to add more functionality after fetching data, you can do it here
		// for example call some other function here
		// which also means this can be removed
		return devices;
	}).catch(function (msg) { // promise is reject
		console.log("Error: " + msg);
	}).then((devices) => {
		// this will be executed even if there are errors
		if (devices == null) devices = [{ deviceid: -1, shorname: "ALL", information: "empty" }];
		res.render('users', {
			title: 'Users',
			subtitle: 'best',
			users: users,
			languages: ['English', 'Finnish', 'Swedish'],
			devices: devices
		});
	});
});

app.listen(3003);
console.log('Express server listening on port 3003');

