import { HighScore, GameMode, Difficulty } from '../types/game';

export class HighScoreManager {
  private static readonly STORAGE_KEY = 'network_traffic_game_highscores';
  private static readonly MAX_SCORES = 10;

  static getHighScores(): HighScore[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading high scores:', error);
      return [];
    }
  }

  static addHighScore(
    playerName: string,
    score: number,
    gameMode: GameMode,
    difficulty: Difficulty,
    threatsDetected: number,
    accuracy: number
  ): boolean {
    try {
      const highScores = this.getHighScores();
      const newScore: HighScore = {
        id: Date.now().toString(),
        playerName,
        score,
        gameMode,
        difficulty,
        date: new Date().toISOString(),
        threatsDetected,
        accuracy
      };

      highScores.push(newScore);
      highScores.sort((a, b) => b.score - a.score);
      
      // Keep only top scores
      const topScores = highScores.slice(0, this.MAX_SCORES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
      return true;
    } catch (error) {
      console.error('Error saving high score:', error);
      return false;
    }
  }

  static getTopScores(count: number = 5): HighScore[] {
    const scores = this.getHighScores();
    return scores.slice(0, count);
  }

  static getScoresByMode(gameMode: GameMode): HighScore[] {
    const scores = this.getHighScores();
    return scores.filter(score => score.gameMode === gameMode);
  }

  static getScoresByDifficulty(difficulty: Difficulty): HighScore[] {
    const scores = this.getHighScores();
    return scores.filter(score => score.difficulty === difficulty);
  }

  static clearHighScores(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isNewHighScore(score: number): boolean {
    const scores = this.getHighScores();
    return scores.length < this.MAX_SCORES || score > scores[scores.length - 1]?.score;
  }
} 