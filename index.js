var express = require("express");
var app = express();
var http = require("http").createServer(app).listen(300);
var io = require("socket.io").listen(http);

var GameObject = require("./GameObject");

app.use("/resources", express.static(__dirname + "/resources"));
app.get("/", function(req, res)
{
	// sendFile --> sendfile (in old versions)
	res.sendFile(__dirname + "/" + "index.html");
});
app.get("/:file", function(req, res)
{
	// sendFile --> sendfile (in old versions)
	res.sendFile(__dirname + "/" + req.param("file"));
});
app.get("/*", function(req, res)
{
	res.send("<h1>Error! Page not found!</h1>");
});

function clearMapForCamps(dX, dY, x, y)
{
	return (!(x==dX&&y==dY)&&!(x+1==dX&&y==dY)&&!(x==dX&&y+1==dY)&&!(x+1==dX&&y+1==dY)&&!(x+2==dX&&y==dY)&&!(x==dX&&y+2==dY)&&!(x+2==dX&&y+1==dY)&&!(x+1==dX&&y+2==dY)&&!(x+2==dX&&y+2==dY));
} // Utility for clear map 96x96px
function RectRectCollider(a, b)
{
	if(b.crashWith(a) && b.y == a.y - b.height) b.y--;
	if(b.crashWith(a) && b.x == a.x - b.width) b.x--;
	if(a.crashWith(b) && a.y == b.y - a.height) b.y++;
	if(a.crashWith(b) && a.x == b.x - a.width) b.x++;
} // Utility for creating colliders between rects.
function fRandomFT(x, y) {
    return (x + Math.floor((Math.random() * (y - x + 1))))
}

var map = []; // Map.
var mapHL = 12; // Map horizontal length.
var mapVL = 12; // Map vertical length.
var mapET = {"f": 0, "t": 10}; // Density of the map <!!!>min value of the property t is 2, value of the property f is static</!!!>.
var mapCS = 32; // Size of the map components.
var mapGDC = 0; // Default count of the golds.
var mapGC; // Current count of the golds.
var mapCTypes = ["gold", "upgrade_power", "obstacle_1"]; // Types of map components.
var mapC = []; // Map components.
var players; // Players in the map.
var outerWalls; // Outer walls.
var mapCamps; // Camps in the map.
var dirs; // Directions.
var playersData; // Players data.
var playersEnergy = [12.5, 100]; // Energy of players.
var playersEnergyI = 10; // Increment of players energies when have a collision between player and bonuse.

players =
{
	red: new GameObject(mapCS-2, mapCS-2, "resources/player_red_1.png", mapCS*2, mapCS*2),
	blue: new GameObject(mapCS-2, mapCS-2, "resources/player_blue_1.png", mapCS*(mapHL-3), mapCS*2),
	green: new GameObject(mapCS-2, mapCS-2, "resources/player_green_1.png", mapCS*2, mapCS*(mapVL-3)),
	yellow: new GameObject(mapCS-2, mapCS-2, "resources/player_yellow_1.png", mapCS*(mapHL-3), mapCS*(mapVL-3)),
};
playersData =
{
	types: ["red", "blue", "green", "yellow"],
	dirs: [1, 2, 3, 4],
	skinsFolder: "resources/",
	skin: ["player_", "_", ".png"],
	goldCargo: ["cargo_gold_", ".png"]
};
// "bullet": new GameObject(4, 4, "resources/shot.png", 0, 0)
for (p in players)
{
	playersData[p] = {};
	playersData[p].gS = new GameObject(mapCS-2, mapCS-2, "resources/cargo_gold_1.png", 0, 0);
	playersData[p].gB = false;
	playersData[p].gC = 0;
	playersData[p].e = playersEnergy[1];
	playersData[p].ei = false;
	playersData[p].ne = false;
	playersData[p].bS = new GameObject(4, 4, "resources/bullet.png", 99999, 99999);
	playersData[p].bB = false;
}
dirs =
{
	"u":{"dir": "u", "keyCode": 38, "skinIndex": 2},
	"d":{"dir": "d", "keyCode": 40, "skinIndex": 4},
	"l":{"dir": "l", "keyCode": 37, "skinIndex": 1},
	"r":{"dir": "r", "keyCode": 39, "skinIndex": 3}
};
mapCamps =
{
	red: new GameObject(mapCS*2, mapCS*2, "resources/camp_red.png", 0, 0),
	blue: new GameObject(mapCS*2, mapCS*2, "resources/camp_blue.png", mapCS*(mapHL-2), 0),
	green: new GameObject(mapCS*2, mapCS*2, "resources/camp_green.png", 0, mapCS*(mapVL-2)),
	yellow: new GameObject(mapCS*2, mapCS*2, "resources/camp_yellow.png", mapCS*(mapHL-2), mapCS*(mapVL-2))
}; // Camps in the map.
function shootBullet(_p, _d)
{
	this.p = _p;
	this.d = _d;
	
	if (!playersData[this.p].bB && playersData[this.p].e > playersEnergy[0])
	{
		playersData[this.p].e = playersEnergy[0];
		playersData[this.p].bB = true;
		
		if (this.d.dir == dirs.l.dir)
		{
			playersData[this.p].bS.x = players[this.p].x - playersData[this.p].bS.width;
			playersData[this.p].bS.y = players[this.p].y + players[this.p].height / 2 - playersData[this.p].bS.height / 2;
			playersData[this.p].bS.speedX = -5;
			playersData[this.p].bS.speedY = 0;
		}
		if (this.d.dir == dirs.r.dir)
		{
			playersData[this.p].bS.x = players[this.p].x + players[this.p].width;
			playersData[this.p].bS.y = players[this.p].y + players[this.p].height / 2 - playersData[this.p].bS.height / 2;
			playersData[this.p].bS.speedX = 5;
			playersData[this.p].bS.speedY = 0;
		}
		if (this.d.dir == dirs.u.dir)
		{
			playersData[this.p].bS.x = players[this.p].x + players[this.p].width / 2 - playersData[this.p].bS.width / 2;
			playersData[this.p].bS.y = players[this.p].y - playersData[this.p].bS.height;
			playersData[this.p].bS.speedX = 0;
			playersData[this.p].bS.speedY = -5;
		}
		if (this.d.dir == dirs.d.dir)
		{
			playersData[this.p].bS.x = players[this.p].x + players[this.p].width / 2 - playersData[this.p].bS.width / 2;
			playersData[this.p].bS.y = players[this.p].y + players[this.p].height;
			playersData[this.p].bS.speedX = 0;
			playersData[this.p].bS.speedY = 5;
		}
		
		io.sockets.emit("newShootS", {"player": this.p, "pos": {"x": playersData[this.p].bS.x, "y": playersData[this.p].bS.y}});
		
		var that = this;
		setTimeout(function()
		{
			playersData[that.p].bB = false;
			playersData[that.p].bS.x = 99999;
			playersData[that.p].bS.y = 99999;
		}, 1250);
	}
} // Shooting the bullet.
for (y = 0; y < mapVL; y++)
{
	var arr = [];
	for (x = 0; x < mapHL; x++)
		arr.push(fRandomFT(mapET.f, mapET.t));
	map.push(arr);
} // Create a random map.
for (y = 0; y < map.length; y++)
{
	for (x = 0; x < map[y].length; x++)
	{
		if (clearMapForCamps(x, y, 0, 0)&&clearMapForCamps(x, y, mapHL-3, mapVL-3)&&clearMapForCamps(x, y, 0, mapVL-3)&&clearMapForCamps(x, y, mapHL-3, 0))
		{
			if (map[y][x] == 0)
			{
				mapC.push([new GameObject(mapCS, mapCS, "resources/gold.png", mapCS * x, mapCS * y), mapCTypes[map[y][x]]]);
				mapGC = ++mapGDC;
			}
			if (map[y][x] == 1)
			{
				mapC.push([new GameObject(mapCS, mapCS, "resources/upgrade_power.png", mapCS * x, mapCS * y), mapCTypes[map[y][x]]]);
			}
			if (map[y][x] == 2)
			{
				mapC.push([new GameObject(mapCS, mapCS, "resources/obstacle_1.png", mapCS * x, mapCS * y), mapCTypes[map[y][x]]]);
			}
		}
	}
} // Read map to mapC.
outerWalls =
{
	uW: new GameObject(map[0].length*mapCS, 1, "", 0, -1),
	dW: new GameObject(map[0].length*mapCS, 1, "", 0, map.length*mapCS+1),
	lW: new GameObject(1, map.length*mapCS, "", -1, 0),
	rW: new GameObject(1, map.length*mapCS, "", map[0].length*mapCS+1, 0)
}
playerAccounts = {red:"", blue:"", green:"", yellow:""};

io.sockets.on("connection", function(socket)
{
	for (player in playerAccounts)
	{
		if (!playerAccounts[player])
		{
			playerID = socket.id;
			playerAccounts[player] = playerID;
			
			io.sockets.emit("START", {
				"map": map,
				"mapHL": mapHL,
				"mapVL": mapVL,
				"mapET": mapET,
				"mapCS": mapCS,
				"mapGDC": mapGDC,
				"mapC": mapC,
				"mapCamps": mapCamps,
				"player": player,
				"players": players,
				"outerWalls": outerWalls,
				"dirs": dirs,
				"playersData": playersData,
				"mapCTypes": mapCTypes,
				"playersEnergy": playersEnergy
			});
			
			socket.on("newDir", function(pid, d)
			{
				var playersNewData = {};
				var currentPlayerNewData = {};
				// getPlayerById(pid)
				// getPlayerNameById(pid)
				
				if (playersData[getPlayerNameById(pid)].e > playersEnergy[0])
				{
					if (d.dir == dirs.u.dir) getPlayerById(pid).y--;
					if (d.dir == dirs.d.dir) getPlayerById(pid).y++;
					if (d.dir == dirs.l.dir) getPlayerById(pid).x--;
					if (d.dir == dirs.r.dir) getPlayerById(pid).x++;
					
					playersData[getPlayerNameById(pid)].e -= 0.125;
				}
				else
				{
					playersData[getPlayerNameById(pid)].e = 0;
					io.sockets.emit("newEnergesS", {"playersData": playersData, "playersEnergy": playersEnergy});
				}
				for (i = 0; i < mapC.length; i++)
				{
					if (getPlayerById(pid).crashWith(mapC[i][0]))
					{
						if (mapC[i][1] == mapCTypes[0] && !playersData[getPlayerNameById(pid)].gB) //Gold.
						{
							playersData[getPlayerNameById(pid)].gB = true;
							mapC.splice(i, 1);
						}
						if (mapC[i][1] == mapCTypes[1]) //Gold.
						{
							playersData[getPlayerNameById(pid)].e += playersEnergyI;
							if (playersData[getPlayerNameById(pid)].e > playersEnergy[1])
								playersData[getPlayerNameById(pid)].e = playersEnergy[1];
							mapC.splice(i, 1);
						}
					}
					if (mapC[i]) RectRectCollider(mapC[i][0], getPlayerById(pid)); // Collider.
				} // Map components.
				if (getPlayerById(pid).crashWith(mapCamps[getPlayerNameById(pid)]) && playersData[getPlayerNameById(pid)].gB == true)
				{
					playersData[getPlayerNameById(pid)].gB = false;
					playersData[getPlayerNameById(pid)].gC++;
					mapGC--;
				}
				getPlayerById(pid).skin = playersData.skinsFolder + playersData.skin["0"] + getPlayerNameById(pid) + playersData.skin["1"] + d.skinIndex + playersData.skin["2"];
				
				for (p in players)
				{
					for (p1 in players)
						if (p != p1)
							RectRectCollider(players[p], players[p1]);
					
					for (i = 0; i < mapC.length; i++) RectRectCollider(mapC[i][0], players[p]);
					for (ov in outerWalls) RectRectCollider(outerWalls[ov], players[p]);
					for (camp in mapCamps) RectRectCollider(mapCamps[camp], players[p]);
				} // Colliders of players.
				
				playersData[getPlayerNameById(pid)].gS = new GameObject(mapCS-2, mapCS-2, playersData.skinsFolder + playersData.goldCargo[0] + d.skinIndex + playersData.goldCargo[1], 0, 0);
				
				io.sockets.emit("newDirS", {"mapC": mapC, "players": players, "playersData": playersData, "dir": d, "mapGC": mapGC});
			});
			
			break;
		}
	}
	
	setInterval(function() { io.sockets.emit("newEnergiesS", {"playersData": playersData, "playersEnergy": playersEnergy}); }, 20);
	
	socket.on("newMessage", function(p, d)
	{
		io.sockets.emit("newMessageS", {"player": getPlayerNameById(p), "message": d});
	});
	socket.on("newShoot", function(pid, d)
	{
		new shootBullet(getPlayerNameById(pid), d);
	});
});

setInterval(function()
{
	for (p in players)
	{
		if (playersData[p].e <= playersEnergy[0])
		{
			playersData[p].ei = true;
			playersData[p].ne = true;
		} else playersData[p].ne = false;
		if (playersData[p].e >= playersEnergy[1])
			playersData[p].ei = false;
		if (playersData[p].ei) 
			playersData[p].ne ? playersData[p].e += 0.125 : playersData[p].e += 0.25;
	}
}, 62.5);

	x = 0;
setInterval(function()
{
	for (p in players)
	{
		if (playersData[p].bB)
		{
			playersData[p].bS.x += playersData[p].bS.speedX;
			playersData[p].bS.y += playersData[p].bS.speedY;
			
			for (p1 in players)
				if (playersData[p].bS.crashWith(players[p1]))
					playersData[p1].e = 0;
			
			io.sockets.emit("newShootS", {"player": p, "pos": {"x": playersData[p].bS.x, "y": playersData[p].bS.y}});
		}
	}
}, 20);

function getPlayerById(id)
{
	for (accN in playerAccounts)
		if (playerAccounts[accN] == id)
			return players[accN];
}
function getPlayerNameById(id)
{
	for (accN in playerAccounts)
		if (playerAccounts[accN] == id)
			return accN;
}