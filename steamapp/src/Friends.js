import React, { useState, useEffect } from "react";
import axios from "axios";

const Friends = () => {
  const [ seenSteamIDs, setSeenSteamIDs] = useState([]);
  const [ friends, setFriends] = useState([]);
  const [ steamID, setSteamID] = useState('');
  
  const fetchIDs = async () => {
    var check = await axios.get("/api/friends/current");
    check = check.data;
    console.log(check[steamID]);
    while((check[steamID] != 'done') && (check[steamID] != 'private')){
      check = await axios.get("/api/friends/current");
      check = check.data;
    }
    console.log(check[steamID]);
    let ids = await axios.get("/api/friends/"+steamID);
    setFriends(ids.data);
    fetchFriends();
  }

  const fetchFriends = async () => {
    const seenSteamIDs = await axios.get("/api/friends/current");
    setSeenSteamIDs(seenSteamIDs.data);
  }
  
  useEffect(() => {
    fetchFriends();
  }, [])
  
  const handleSubmit = async event => {
    event.preventDefault();
    if(!Number(steamID)){
      var reqid = await axios.post('/api/getrealid', { steamID });
      reqid = reqid.data;
      setSteamID(reqid);
    } else {
      var reqid = steamID;
    }
    var flag = 1;
    for(let key in seenSteamIDs){
      if(key == reqid){
        flag = 0;
        console.log("ID ist schon vorhanden");
        break;
      }
    }
    if(flag){
      await axios.post('/api/friends', { reqid });
    }
    fetchIDs();
  };
  
  const renderSeenSteamIDs = () => {
    return Object.keys(seenSteamIDs).toString();
  }

  const renderFriends = () => {
    const entries = [];
    for (let key in friends) {
      entries.push(
        <div key={`${friends[key]["friendid"]}`}>
          <a href={`https://steamcommunity.com/profiles/${friends[key]["friendid"]}`}>{friends[key]["friendid"]}</a>
        </div>
      );
    }

    return entries;
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your SteamID:</label>
        <input
        value={steamID}
        onChange={event => setSteamID(event.target.value)}
        />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {renderSeenSteamIDs()}

      <h3>Friends for ID: {steamID}</h3>
      {renderFriends()}
    </div>
  );
}

export default Friends;