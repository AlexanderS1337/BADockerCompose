//conf
const conf = require('./conf');
const port = 3001;

//app
const express = require("express");
const redis = require("redis");
const unirest = require("unirest");
const bodyParser = require("body-parser");

const app = express();

const { Pool } = require('pg');
const pgClient = new Pool({
  user: conf.pgUser,
  host: conf.pgHost,
  database: conf.pgDB,
  password: conf.pgPW,
  port: conf.pgPort
});

pgClient.on("error", () => console.log("Postgres ist down!"));

pgClient.query("CREATE TABLE IF NOT EXISTS "+conf.pgTable+" (steamid BIGINT, friendid BIGINT, friends_since BIGINT)").catch(err => console.log(err));

const rClient = redis.createClient({
  host: conf.redisHost,
  port: conf.redisPort,
  retry_strategy: () => 1000
});
const rWatchdog = rClient.duplicate();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("Willkommen zu SteamFriendsApp!");
});

app.post("/api/getrealid", async (req, res) => {
  var request = unirest.get("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/");
  request.query({ 
    "key": conf.steamKey,
    "vanityurl": req.body.steamID
  });
  request.end(function (response) {
    if (typeof response.body['response']['steamid'] !== 'undefined') {
      console.log('getid sagt: '+response.body['response']['steamid']);
      res.send(response.body['response']['steamid']);
    } else {
      console.log("Konnte ID nicht bestimmen");
      res.status(400).send("Geben Sie eine gültige SteamID ein!");
    }
  });
});

app.post("/api/friends", async (req, res) => {
  var steamid = req.body.reqid;
  if (!Number(steamid)) {
    return res.status(400).send("Geben Sie eine gültige SteamID ein!");
  } else if((steamid / 1000000000000000) < 1){
    return res.status(400).send("Geben Sie eine gültige SteamID ein!");
  }
  
  console.log(steamid);
  rClient.hset("ids", steamid, "noch nichts!");
  rWatchdog.publish("insert", steamid);
  res.send({ working: true });
});

app.get("/api/friends/current", (req, res) => {
  rClient.hgetall("ids", (err, values) => {
    res.send(values || {});
  });
});

app.get('/api/friends/:steamid', (req, res) => {
  if(!Number(req.params.steamid)){
    res.status(200).json({});
  } else {
    pgClient.query("SELECT * FROM "+conf.pgTable+" WHERE steamid="+req.params.steamid, (error, results) => {
      if (error) {
        res.status(200).json({});
      } else {
        res.status(200).json(results.rows);
      }
    })
  }
});

app.get('/api/friends/', (req, res) => {
  res.send("Versuchen Sie eine SteamID zu übergeben");
});

app.listen(port, () => {
  console.log(`Lauscht auf http://localhost:${port}`);
});