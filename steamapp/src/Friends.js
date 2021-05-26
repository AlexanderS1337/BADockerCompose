import React, { Component } from "react";
import axios from "axios";

class Friends extends Component {
  state = {
    seenSteamIDs: [],
    friends: [],
    steamID: ''
  };

  componentDidMount() {
    this.fetchFriends();
    this.fetchIDs();
  }

  async fetchIDs(){
    const ids = await axios.get("/api/friends/"+this.state.steamID);
    this.setState({ friends: ids.data });
  }

  async fetchFriends(){
    const seenSteamIDs = await axios.get("/api/friends/current");
    this.setState({ seenSteamIDs: seenSteamIDs.data });
  }
  handleSubmit = async event => {
    event.preventDefault();
    var flag = 1;
    for(let key in this.state.seenSteamIDs){
      if(key == this.state.steamID){
        flag = 0;
        break;
      }
    }
    if(flag){
      alert("Requeste die steamid: "+this.state.steamID);
      await axios.post('/api/friends', { steamid: this.state.steamID });
      window.location.reload(false);
    } else {
      alert("Die ID: "+this.state.steamID+" ist schon vorhanden");
    }
    this.setState({ steamid: this.state.steamID });
    this.fetchIDs();
  };

  renderSeenSteamIDs() {
    return Object.keys(this.state.seenSteamIDs).toString();
  }

  renderFriends() {
    const entries = [];
    for (let key in this.state.friends) {
      entries.push(
        <div>
          <a href={`https://steamcommunity.com/profiles/${this.state.friends[key]["friendid"]}`}>{this.state.friends[key]["friendid"]}</a>
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your SteamID:</label>
          <input
          value={this.state.steamid}
          onChange={event => this.setState({ steamID: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenSteamIDs()}

        <h3>Friends for ID: {this.state.steamID}</h3>
        {this.renderFriends()}
      </div>
    );
  }
}

export default Friends;