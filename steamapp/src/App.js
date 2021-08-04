import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Friends from './Friends';

function App() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to SteamFriendsApp BA Abgabe!</h1>
            <Link to="/">Home</Link>
          </header>
          <div>
            <Route exact path="/" component={Friends} />
          </div>
        </div>
      </Router>
    );
}

export default App;
