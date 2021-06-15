import React, { useState, useEffect } from "react";
import axios from "axios";

const Friends = () => {
  const [ seenSteamIDs, setSeenSteamIDs] = useState([])
  const [ friends, setFriends] = useState([])
  const [ steamID, setSteamID] = useState('')
  
  const fetchIDs = async () => {
    let ids = await axios.get("/api/friends/"+steamID);
    /*while(ids.data.length == 0){
      ids = await axios.get("/api/friends/"+steamID);
    }*/
    setFriends(ids.data)
    fetchFriends()
  }

  const fetchFriends = async () => {
    const seenSteamIDs = await axios.get("/api/friends/current");
    setSeenSteamIDs(seenSteamIDs.data)
  }
  
  useEffect(() => {
    fetchFriends()
  }, [])
  
  const handleSubmit = async event => {
    event.preventDefault();
    var flag = 1;
    for(let key in seenSteamIDs){
      if(key == steamID){
        flag = 0;
        break;
      }
    }
    if(flag){
      await axios.post('/api/friends', { steamID });
    }
    fetchIDs()
  };
  
  const renderSeenSteamIDs = () => {
    return Object.keys(seenSteamIDs).toString();
  }

  const renderFriends = () => {
    const entries = [];
    for (let key in friends) {
      entries.push(
        <div>
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
        onChange={event => setSteamID( event.target.value)}
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