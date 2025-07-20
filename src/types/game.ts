// Core game types and interfaces

export interface Packet {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PacketType;
  source: string;
  destination: string;
  volume: number;
  timestamp: number;
  isThreat: boolean;
  threatType?: ThreatType;
}

export enum PacketType {
  NORMAL = 'normal',
  SUSPICIOUS = 'suspicious',
  MALICIOUS = 'malicious',
  CRITICAL = 'critical'
}

export enum ThreatType {
  DDOS = 'ddos',
  PORT_SCAN = 'port_scan',
  DATA_EXFILTRATION = 'data_exfiltration',
  MALWARE_COMMUNICATION = 'malware_communication',
  INSIDER_THREAT = 'insider_threat'
}

export interface Threat {
  id: string;
  type: ThreatType;
  packets: Packet[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  level: number;
  threatsDetected: number;
  falsePositives: number;
  missedThreats: number;
  isolatedThreats: number;
  gameMode: GameMode;
  difficulty: Difficulty;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  date: string;
  threatsDetected: number;
  accuracy: number;
}

export enum GameMode {
  TUTORIAL = 'tutorial',
  PRACTICE = 'practice',
  CHALLENGE = 'challenge',
  CUSTOM = 'custom'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface Score {
  accuracy: number;
  speed: number;
  total: number;
  threatsDetected: number;
  falsePositives: number;
  missedThreats: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  threatTypes: ThreatType[];
  duration: number; // milliseconds
  normalTrafficRate: number; // packets per second
  threatFrequency: number; // threats per minute
}

export interface PlayerStats {
  totalGames: number;
  accuracyRate: number;
  avgResponseTime: number;
  threatsDetected: number;
  bestScore: number;
  favoriteMode: GameMode;
} 