import React, { useState } from "react";
import "./App.css";
import AlphabetsGame from "./components/AlphabetsGame";
import NumbersGame from "./components/NumbersGame";
import PhonicsGame from "./components/PhonicsGame";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">🌈 Kids Learning App 🌈</h1>
        <nav className="App-nav">
          <button
            className={`nav-button ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            🏠 Home
          </button>
          <button
            className={`nav-button ${activeTab === "alphabets" ? "active" : ""}`}
            onClick={() => setActiveTab("alphabets")}
          >
            🔤 Alphabets
          </button>
          <button
            className={`nav-button ${activeTab === "numbers" ? "active" : ""}`}
            onClick={() => setActiveTab("numbers")}
          >
            🔢 Numbers
          </button>
          <button
            className={`nav-button ${activeTab === "phonics" ? "active" : ""}`}
            onClick={() => setActiveTab("phonics")}
          >
            🎵 Phonics
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === "home" && (
          <div className="home-screen">
            <h2>Welcome! 🎉</h2>
            <p>Click on a tab above to start learning!</p>
            <div className="feature-cards">
              <div
                className="feature-card"
                onClick={() => setActiveTab("alphabets")}
              >
                <div className="feature-icon">🔤</div>
                <h3>Learn Alphabets</h3>
                <p>From A to Z!</p>
              </div>
              <div
                className="feature-card"
                onClick={() => setActiveTab("numbers")}
              >
                <div className="feature-icon">🔢</div>
                <h3>Learn Numbers</h3>
                <p>From 0 to 20!</p>
              </div>
              <div
                className="feature-card"
                onClick={() => setActiveTab("phonics")}
              >
                <div className="feature-icon">🎵</div>
                <h3>Learn Phonics</h3>
                <p>Letter Sounds!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "alphabets" && (
          <AlphabetsGame onExit={() => setActiveTab("home")} />
        )}

        {activeTab === "numbers" && (
          <NumbersGame onExit={() => setActiveTab("home")} />
        )}

        {activeTab === "phonics" && (
          <PhonicsGame onExit={() => setActiveTab("home")} />
        )}
      </main>
    </div>
  );
}

export default App;
