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

app.post("/api/friends", async (req, res) => {
  const steamid = req.body.steamid;
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
  pgClient.query("SELECT * FROM "+conf.pgTable+" WHERE steamid="+req.params.steamid, (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows)
  })
});

app.get('/api/friends/', (req, res) => {
  res.send("Versuchen Sie eine SteamID zu übergeben");
});

app.listen(port, () => {
  console.log(`Lauscht auf http://localhost:${port}`);
});