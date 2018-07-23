var socket = io.connect();

var map; // Map.
var mapCS; // Size of the map components.
var mapGDC; // Default count of the golds.
var mapGC; // Current count of the golds.
var mapC; // Map components.
var player; // Current player path.
var players = {}; // Players in the map.
var playersData; // Players data.
var dirs; // Directions.
var mapCamps = {}; // Camps in the map.
var mapCTypes; // Types of map components.
var outerWalls = {}; // Outer walls.
var playersGolds = {}; // Golds of players.
var playersBullets = {}; // Bullets of players.
var nullEDW; // Default width of the null energy.
var dir; // For saving direction of player for shooting.

// e.preventDefault();

socket.on("START", function(d)
{
	mapC = [];
	mapHL = d.mapHL;
	mapVL = d.mapVL;
	mapCS = d.mapCS;
	mapGDC = d.mapGDC;
	dirs = d.dirs;
	playersData = d.playersData;
	dir = dirs.l;
	
	if (!player)
	{
		player = d.player;
		alert("Hello! You are " + player + " player.");
	} // Read current player path.
	
	for (ov in d.outerWalls) // Read outer walls.
		outerWalls[ov] = new SQUARE(d.outerWalls[ov].width, d.outerWalls[ov].height, "", d.outerWalls[ov].x, d.outerWalls[ov].y);
	for (i = 0; i < d.mapC.length; i++) // Read map.
		mapC.push([new IMAGE(d.mapC[i][0].width, d.mapC[i][0].height, d.mapC[i][0].skin, d.mapC[i][0].x, d.mapC[i][0].y), d.mapC[i][1]]);
	for (camp in d.mapCamps) // Read camps.
		mapCamps[camp] = new IMAGE(d.mapCamps[camp].width, d.mapCamps[camp].height, d.mapCamps[camp].skin, d.mapCamps[camp].x, d.mapCamps[camp].y);
	for (p in d.players) // Read players and golds.
	{
		players[p] = new IMAGE(d.players[p].width, d.players[p].height, d.players[p].skin, d.players[p].x, d.players[p].y);
		playersGolds[p] = new IMAGE(playersData[p].gS.width, playersData[p].gS.height, playersData[p].gS.skin, playersData[p].gS.x, playersData[p].gS.y);
		playersBullets[p] = new IMAGE(playersData[p].bS.width, playersData[p].bS.height, playersData[p].bS.skin, playersData[p].bS.x, playersData[p].bS.y);
	}
	
	socket.on("newDirS", function(d1)
	{
		playersData = d1.playersData; // Update players data.
		for (p in d1.players)
		{
			players[p] = new IMAGE(d1.players[p].width, d1.players[p].height, d1.players[p].skin, d1.players[p].x, d1.players[p].y);
			playersGolds[p] = new IMAGE(playersData[p].gS.width, playersData[p].gS.height, playersData[p].gS.skin, playersData[p].gS.x, playersData[p].gS.y);
		} // Update players and golds.
		
		mapC = [];
		for (i = 0; i < d1.mapC.length; i++) // Update map.
			mapC.push([new IMAGE(d1.mapC[i][0].width, d1.mapC[i][0].height, d1.mapC[i][0].skin, d1.mapC[i][0].x, d1.mapC[i][0].y), d1.mapC[i][1]]);
			
		document.getElementById("gC").innerHTML = "Golds: " + d1.playersData[player].gC;
	}); // Read physics geometry to skins.
	
	var e = d.playersEnergy;
	var cW = mapHL * mapCS, ch = mapVL * mapCS + 32;
	var fEW = e[0] * cW / (e[0] + e[1]);
	
	document.getElementById("container").style.width = (mapHL * mapCS) * 1.5 + "px";
	document.getElementById("container").style.margin = "auto";
	document.getElementById("eC").style.width = mapHL * mapCS + "px";
	document.getElementById("eC").style.marginLeft = (mapVL * mapCS) * 0.5 + "px";
	document.getElementById("game").style.width = mapHL * mapCS + "px";
	document.getElementById("game").style.height = mapVL * mapCS + "px";
	document.getElementById("game").style.marginLeft = (mapVL * mapCS) * 0.5 + "px";
	document.getElementById("fE").style.width = fEW + "px";
	document.getElementById("el").style.marginLeft = fEW + "px";
	document.getElementById("chat").style.width = (mapVL * mapCS) * 0.5 + "px";
	document.getElementById("chat").style.height = mapVL * mapCS + 32 + "px";
	document.getElementById("chMs").style.height = mapVL * mapCS + 12 + "px";
	
	socket.on("newEnergiesS", function(d1)
	{
		ew = (mapHL * mapCS) / 100 * (d1.playersData[player].e * 100 / (e[1]));
		document.getElementById("sE").style.width = ew + "px";
		if (ew <= fEW)
			document.getElementById("fE").style.width = document.getElementById("sE").style.width;
	});
	
	black = new IMAGE(5000, 5000, "resources/black.png", 0, 0);
	
	document.getElementById("chEI").onkeydown = function(e)
	{
		if(e.keyCode == 13) document.getElementById("chES").click();
	}
	document.getElementById("chES").onclick = function(e)
	{
		e.preventDefault();
		if (document.getElementById("chEI").value)
		{
			socket.emit("newMessage", socket.id, document.getElementById("chEI").value.split("<").join("&lt;").split(">").join("&gt;"));
			setTimeout(function(){canEnter = true}, 1000);
			document.getElementById("chEI").value = "";
		}
	}
	
	socket.on("newMessageS", function(d)
	{
		document.getElementById("chMs").innerHTML += "<p style='margin: 0; color: " + d.player + "'>" + d.message + "</p>";
	});
	
	socket.on("newShootS", function(d)
	{
		playersBullets[d.player].x = d.pos.x;
		playersBullets[d.player].y = d.pos.y;
	});
	
	SCENEKeys = true; // Enable keyDown listener.
	SCENE.CREATE(mapHL * mapCS, mapVL * mapCS, "START"); // Create scene.
});

function SCENEUPDATE()
{
	SCENE.CLEAR(); // Clear scene.
	
	for (i = 0; i < mapC.length; i++) mapC[i][0].update(); // Update map components.
	for (c in mapCamps) mapCamps[c].update(); // Update map camps.
	for (p in players)
	{
		players[p].update(); // Update players.
		playersBullets[p].update(); // Update players.
		if (playersData[p].gB)
		{
			playersGolds[p].x = players[p].x;
			playersGolds[p].y = players[p].y;
			playersGolds[p].update();
		} // Update golds of players.
	}
	
	if (black)
	{
		black.x = players[player].x - black.width / 2 + players[player].width / 2;
		black.y = players[player].y - black.height / 2 + players[player].height / 2;
		black.update();
	}
	/*
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.fillRect(0, 0, 5000, 5000);
	ctx.beginPath();
	ctx.fillStyle="#ffffff";
	ctx.arc(2500, 2500, 125, 0, 2 * Math.PI);
	ctx.fill();
	*/ // Draw a black.
	
	/* Movement of player. */
	// socket.id --> socket.socket.sessionid (in old versions)
	if (keyDown(dirs.l.keyCode))
	{
		dir = dirs.l;
		socket.emit("newDir", socket.id, dirs.l); // Left.
	}
	if (keyDown(dirs.r.keyCode))
	{
		dir = dirs.r;
		socket.emit("newDir", socket.id, dirs.r); // Right.
	}
	if (keyDown(dirs.u.keyCode))
	{
		dir = dirs.u;
		socket.emit("newDir", socket.id, dirs.u); // Up.
	}
	if (keyDown(dirs.d.keyCode))
	{
		dir = dirs.d;
		socket.emit("newDir", socket.id, dirs.d); // Down.
	}
	if (keyDown(32)) socket.emit("newShoot", socket.id, dir); // Shooting.
}