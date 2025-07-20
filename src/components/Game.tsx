import React, { useState, useEffect, useCallback } from 'react';
import { Packet, Threat, GameState, GameMode, Difficulty, Score } from '../types/game';
import { TrafficGenerator } from '../engine/TrafficGenerator';
import { ThreatDetector } from '../engine/ThreatDetector';
import { ScoringEngine } from '../engine/ScoringEngine';
import PacketVisualizer from './PacketVisualizer';
import TutorialDialog from './TutorialDialog';
import EventLog, { LogEvent } from './EventLog';

interface GameProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  onGameEnd: (score: Score) => void;
  onGoHome: () => void;
}

const Game: React.FC<GameProps> = ({ gameMode, difficulty, onGameEnd, onGoHome }) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    level: 1,
    threatsDetected: 0,
    falsePositives: 0,
    missedThreats: 0,
    isolatedThreats: 0,
    gameMode,
    difficulty
  });

  const [packets, setPackets] = useState<Packet[]>([]);
  const [detectedThreats, setDetectedThreats] = useState<Threat[]>([]);
  const [actualThreats, setActualThreats] = useState<Threat[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(gameMode === GameMode.TUTORIAL);
  const [eventLog, setEventLog] = useState<LogEvent[]>([]);

  const trafficGenerator = new TrafficGenerator(800, 600);
  const threatDetector = new ThreatDetector();
  const scoringEngine = new ScoringEngine();

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setGameStartTime(Date.now());
    setPackets([]);
    setDetectedThreats([]);
    setActualThreats([]);
    setSelectedPacket(null);

    // Start generating traffic
    const gameInterval = setInterval(() => {
      if (gameState.isPlaying) {
        // Generate normal flow traffic
        const flowPackets = trafficGenerator.generateFlowTraffic(
          15 + Math.floor(Math.random() * 20)
        );

        // Occasionally add threat traffic
        let threatPackets: Packet[] = [];
        if (Math.random() < 0.3) {
          threatPackets = trafficGenerator.generateMixedTraffic(
            5 + Math.floor(Math.random() * 8),
            getRandomThreatType()
          );
        }

        const newPackets = [...flowPackets, ...threatPackets];

        setPackets(prev => {
          const updated = [...prev, ...newPackets];
          // Keep more packets for continuous flow
          return updated.slice(-200);
        });

        // Detect threats in new packets
        const threats = threatDetector.detectThreats(newPackets);
        if (threats.length > 0) {
          setActualThreats(prev => [...prev, ...threats]);
        }
      } else {
        clearInterval(gameInterval);
      }
    }, 400);

    // Auto-end game after 60 seconds
    setTimeout(() => {
      endGame();
    }, 60000);

    return () => clearInterval(gameInterval);
  }, [gameState.isPlaying]);

  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    const responseTime = Date.now() - gameStartTime;
    const score = scoringEngine.calculateScore(
      detectedThreats,
      actualThreats,
      responseTime,
      gameState.falsePositives,
      gameState.missedThreats
    );

    onGameEnd(score);
  }, [detectedThreats, actualThreats, gameStartTime, gameState.falsePositives, gameState.missedThreats, onGameEnd]);

  const addEvent = useCallback((event: Omit<LogEvent, 'id' | 'timestamp'>) => {
    const newEvent: LogEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setEventLog(prev => [...prev, newEvent]);
  }, []);

  const handlePacketClick = useCallback((packet: Packet) => {
    setSelectedPacket(packet);

    if (packet.isThreat) {
      // Correct threat detection
      const threat: Threat = {
        id: `detected_${packet.id}`,
        type: packet.threatType!,
        packets: [packet],
        severity: 'medium',
        description: `Detected ${packet.threatType} threat`,
        timestamp: Date.now()
      };

      setDetectedThreats(prev => [...prev, threat]);
      setGameState(prev => ({
        ...prev,
        threatsDetected: prev.threatsDetected + 1,
        score: prev.score + 100
      }));

      addEvent({
        type: 'threat_detected',
        message: `Threat detected: ${packet.threatType} from ${packet.source}`,
        packet,
        severity: 'success'
      });
    } else {
      // False positive
      setGameState(prev => ({
        ...prev,
        falsePositives: prev.falsePositives + 1,
        score: Math.max(0, prev.score - 25)
      }));

      addEvent({
        type: 'false_positive',
        message: `False positive: Normal traffic from ${packet.source}`,
        packet,
        severity: 'warning'
      });
    }
  }, [addEvent]);

  const handlePacketIsolate = useCallback((packet: Packet) => {
    if (packet.isThreat) {
      // Remove packet from display and add to isolated count
      setPackets(prev => prev.filter(p => p.id !== packet.id));
      setGameState(prev => ({
        ...prev,
        isolatedThreats: prev.isolatedThreats + 1,
        score: prev.score + 50
      }));

      addEvent({
        type: 'packet_isolated',
        message: `Threat isolated: ${packet.threatType} from ${packet.source}`,
        packet,
        severity: 'success'
      });
    }
  }, [addEvent]);

  const getRandomThreatType = (): any => {
    const types = ['ddos', 'port_scan', 'data_exfiltration'];
    return types[Math.floor(Math.random() * types.length)];
  };

  useEffect(() => {
    if (gameState.isPlaying) {
      startGame();
    }
  }, [gameState.isPlaying, startGame]);

  const handleTutorialStart = () => {
    setShowTutorial(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  return (
    <div className="game-container">
      <TutorialDialog 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStart={handleTutorialStart}
      />
      <div className="game-header">
        <h2 onClick={onGoHome} style={{ cursor: 'pointer' }}>Network Traffic Analyzer</h2>
        <div className="game-stats">
          <div className="stat">
            <span>Score:</span>
            <span className="score">{gameState.score}</span>
          </div>
          <div className="stat">
            <span>Threats Detected:</span>
            <span className="threats">{gameState.threatsDetected}</span>
          </div>
          <div className="stat">
            <span>Isolated:</span>
            <span className="isolated">{gameState.isolatedThreats}</span>
          </div>
          <div className="stat">
            <span>False Positives:</span>
            <span className="false-positives">{gameState.falsePositives}</span>
          </div>
          <div className="stat">
            <span>Level:</span>
            <span className="level">{gameState.level}</span>
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="game-main">
          <div className="nta-container">
            <PacketVisualizer
              packets={packets}
              width={800}
              height={600}
              onPacketClick={handlePacketClick}
              onPacketIsolate={handlePacketIsolate}
              isPlaying={gameState.isPlaying}
              gameMode={gameMode}
            />
          </div>
          
          <div className="game-info">
            <div className="instructions">
              <h3>Network Monitor</h3>
              <p>Monitor traffic and identify security threats.</p>
              <div className="packet-types">
                <div className="packet-type">
                  <div className="type-indicator normal"></div>
                  <span>Normal Traffic</span>
                </div>
                <div className="packet-type">
                  <div className="type-indicator suspicious"></div>
                  <span>Suspicious</span>
                </div>
                <div className="packet-type">
                  <div className="type-indicator malicious"></div>
                  <span>Malicious</span>
                </div>
                <div className="packet-type">
                  <div className="type-indicator critical"></div>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            {selectedPacket && (
              <div className="packet-details">
                <h3>Packet Analysis</h3>
                <div className="detail-item">
                  <span>Type:</span>
                  <span className={selectedPacket.isThreat ? 'threat' : 'normal'}>
                    {selectedPacket.type}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Source:</span>
                  <span>{selectedPacket.source}</span>
                </div>
                <div className="detail-item">
                  <span>Destination:</span>
                  <span>{selectedPacket.destination}</span>
                </div>
                <div className="detail-item">
                  <span>Volume:</span>
                  <span>{selectedPacket.volume}</span>
                </div>
                {selectedPacket.threatType && (
                  <div className="detail-item">
                    <span>Threat Type:</span>
                    <span className="threat-type">{selectedPacket.threatType}</span>
                  </div>
                )}
              </div>
            )}

            <div className="game-controls">
              {!gameState.isPlaying ? (
                <button 
                  className="start-button"
                  onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))}
                >
                  Start Monitoring
                </button>
              ) : (
                <button 
                  className="stop-button"
                  onClick={endGame}
                >
                  Stop Monitoring
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="game-sidebar">
          <EventLog events={eventLog} />
        </div>
      </div>
    </div>
  );
};

export default Game; 