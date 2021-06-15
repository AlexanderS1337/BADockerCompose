//conf
const conf = require('./conf');
const redis = require("redis");
const unirest = require("unirest");

const rClient = redis.createClient({
  host: conf.redisHost,
  port: conf.redisPort,
  retry_strategy: () => 1000
});

const sub = rClient.duplicate();

const { Pool } = require('pg');
const pgClient = new Pool({
  user: conf.pgUser,
  host: conf.pgHost,
  database: conf.pgDB,
  password: conf.pgPW,
  port: conf.pgPort
});

pgClient.on("error", () => console.log("Postgres ist down!"));

function getSteamFriends(steamid) {
  var request = unirest.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/");
  request.query({ 
    "key": conf.steamKey,
    "steamid": steamid,
    "relationship": "friend"	  
  });
  request.end(function (response) {
    if (typeof response.body["friendslist"] !== 'undefined') {
      insertSteamFriends(steamid, response.body["friendslist"]["friends"]);
      rClient.hset("ids", steamid, "done");
    } else {
      rClient.hset("ids", steamid, "private");
    }
  });
}

function insertSteamFriends(steamid, friends){
  for (var i = 0; i < friends.length-1; i++) {
    friendid = friends[i]["steamid"];
    friendsince = friends[i]["friend_since"];
    pgClient.query("INSERT INTO "+conf.pgTable+" (steamid, friendid, friends_since) VALUES ("+steamid+", "+friendid+", "+parseInt(friendsince)+")").catch(err => console.log(err));
  }
}

sub.on("message", (channel, message) => {
  console.log("Hole freunde für "+message);
  getSteamFriends(message);
});
sub.subscribe("insert");