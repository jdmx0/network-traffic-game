import React, { useState } from 'react';
import './App.css';
import Game from './components/Game';
import { GameMode, Difficulty, Score } from './types/game';

function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'results'>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.PRACTICE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [lastScore, setLastScore] = useState<Score | null>(null);

  const handleGameEnd = (score: Score) => {
    setLastScore(score);
    setCurrentView('results');
  };

  const startGame = () => {
    setCurrentView('game');
  };

  const backToMenu = () => {
    setCurrentView('menu');
  };

  const renderMenu = () => (
    <div className="menu-container">
      <div className="menu-content">
        <h1>Network Traffic Analyzer</h1>
        <p className="subtitle">Real-time threat detection and network monitoring</p>
        
        <div className="menu-section">
          <h2>Select Game Mode</h2>
          <div className="mode-buttons">
            <button 
              className={`mode-button ${selectedMode === GameMode.TUTORIAL ? 'selected' : ''}`}
              onClick={() => setSelectedMode(GameMode.TUTORIAL)}
            >
              Tutorial
              <span>Learn the basics</span>
            </button>
            <button 
              className={`mode-button ${selectedMode === GameMode.PRACTICE ? 'selected' : ''}`}
              onClick={() => setSelectedMode(GameMode.PRACTICE)}
            >
              Practice
              <span>Hone your skills</span>
            </button>
            <button 
              className={`mode-button ${selectedMode === GameMode.CHALLENGE ? 'selected' : ''}`}
              onClick={() => setSelectedMode(GameMode.CHALLENGE)}
            >
              Challenge
              <span>Test your abilities</span>
            </button>
            <button 
              className={`mode-button ${selectedMode === GameMode.CUSTOM ? 'selected' : ''}`}
              onClick={() => setSelectedMode(GameMode.CUSTOM)}
            >
              Custom
              <span>Create scenarios</span>
            </button>
          </div>
        </div>

        <div className="menu-section">
          <h2>Select Difficulty</h2>
          <div className="difficulty-buttons">
            <button 
              className={`difficulty-button ${selectedDifficulty === Difficulty.EASY ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(Difficulty.EASY)}
            >
              Easy
            </button>
            <button 
              className={`difficulty-button ${selectedDifficulty === Difficulty.MEDIUM ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(Difficulty.MEDIUM)}
            >
              Medium
            </button>
            <button 
              className={`difficulty-button ${selectedDifficulty === Difficulty.HARD ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(Difficulty.HARD)}
            >
              Hard
            </button>
            <button 
              className={`difficulty-button ${selectedDifficulty === Difficulty.EXPERT ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(Difficulty.EXPERT)}
            >
              Expert
            </button>
          </div>
        </div>

        <div className="menu-section">
          <h2>How to Play</h2>
          <div className="instructions">
            <div className="instruction-item">
              <span className="instruction-icon">Hunt</span>
              <div>
                <h4>Hunt Down Threats</h4>
                <p>Click on suspicious network packets to identify and neutralize security threats</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">Speed</span>
              <div>
                <h4>Lightning Reflexes</h4>
                <p>Quick detection earns bonus points - every second counts in cyber defense</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">Precision</span>
              <div>
                <h4>Surgical Precision</h4>
                <p>Avoid false positives and don't let any real threats slip through your defenses</p>
              </div>
            </div>
          </div>
        </div>

        <button className="start-game-button" onClick={startGame}>
          Start Analysis
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="results-container">
      <div className="results-content">
        <h1>Analysis Results</h1>
        
        {lastScore && (
          <div className="score-display">
            <div className="score-item">
              <span>Total Score:</span>
              <span className="total-score">{lastScore.total}</span>
            </div>
            <div className="score-item">
              <span>Accuracy Points:</span>
              <span>{lastScore.accuracy}</span>
            </div>
            <div className="score-item">
              <span>Speed Bonus:</span>
              <span>{lastScore.speed}</span>
            </div>
            <div className="score-item">
              <span>Threats Detected:</span>
              <span>{lastScore.threatsDetected}</span>
            </div>
            <div className="score-item">
              <span>False Positives:</span>
              <span className="penalty">{lastScore.falsePositives}</span>
            </div>
            <div className="score-item">
              <span>Missed Threats:</span>
              <span className="penalty">{lastScore.missedThreats}</span>
            </div>
          </div>
        )}

        <div className="results-actions">
          <button className="play-again-button" onClick={startGame}>
            Analyze Again
          </button>
          <button className="menu-button" onClick={backToMenu}>
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentView === 'menu' && renderMenu()}
      {currentView === 'game' && (
        <Game 
          gameMode={selectedMode}
          difficulty={selectedDifficulty}
          onGameEnd={handleGameEnd}
          onGoHome={backToMenu}
        />
      )}
      {currentView === 'results' && renderResults()}
    </div>
  );
}

export default App;
