// App.jsx
import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import './index.css';
import ouLogo from './assets/oulogo.png';
import ouLib from './assets/oulib.jpg';

function App() {
  return (
    <div className="app" style={{ backgroundImage: `url(${ouLib})` }}>
      <header className="header">
        <img src={ouLogo} alt="OU Logo" className="logo" />
        <h1>Ask OU Chat</h1>
        <p className="subtitle">Your virtual assistant for everything at the University of Oklahoma</p>
      </header>
      <ChatBot />
    </div>
  );
}

export default App;
