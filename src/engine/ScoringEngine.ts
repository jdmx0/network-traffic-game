import { Threat, ThreatType, Score } from '../types/game';

export class ScoringEngine {
  private basePoints = {
    [ThreatType.DDOS]: 100,
    [ThreatType.PORT_SCAN]: 75,
    [ThreatType.DATA_EXFILTRATION]: 150,
    [ThreatType.MALWARE_COMMUNICATION]: 125,
    [ThreatType.INSIDER_THREAT]: 200
  };

  private severityMultipliers = {
    'low': 0.5,
    'medium': 1.0,
    'high': 1.5,
    'critical': 2.0
  };

  private speedBonusThreshold = 5000; // 5 seconds for max bonus
  private maxSpeedBonus = 50; // Maximum bonus points for speed

  calculateScore(
    detectedThreats: Threat[],
    actualThreats: Threat[],
    responseTime: number,
    falsePositives: number = 0,
    missedThreats: number = 0
  ): Score {
    const accuracy = this.calculateAccuracy(detectedThreats, actualThreats);
    const speed = this.calculateSpeedBonus(responseTime);
    const penalty = this.calculatePenalty(falsePositives, missedThreats);
    
    const total = Math.max(0, accuracy + speed - penalty);
    
    return {
      accuracy,
      speed,
      total,
      threatsDetected: detectedThreats.length,
      falsePositives,
      missedThreats
    };
  }

  private calculateAccuracy(detectedThreats: Threat[], actualThreats: Threat[]): number {
    let totalPoints = 0;
    
    detectedThreats.forEach(detected => {
      // Check if this detected threat matches an actual threat
      const matchingThreat = actualThreats.find(actual => 
        actual.type === detected.type && 
        this.isThreatMatch(detected, actual)
      );
      
      if (matchingThreat) {
        const basePoints = this.basePoints[detected.type] || 50;
        const severityMultiplier = this.severityMultipliers[detected.severity] || 1.0;
        totalPoints += basePoints * severityMultiplier;
      }
    });
    
    return totalPoints;
  }

  private calculateSpeedBonus(responseTime: number): number {
    if (responseTime <= this.speedBonusThreshold) {
      const speedRatio = 1 - (responseTime / this.speedBonusThreshold);
      return Math.round(this.maxSpeedBonus * speedRatio);
    }
    return 0;
  }

  private calculatePenalty(falsePositives: number, missedThreats: number): number {
    const falsePositivePenalty = falsePositives * 25;
    const missedThreatPenalty = missedThreats * 50;
    return falsePositivePenalty + missedThreatPenalty;
  }

  private isThreatMatch(detected: Threat, actual: Threat): boolean {
    // Check if the detected threat matches the actual threat
    // This is a simplified matching algorithm
    const timeDiff = Math.abs(detected.timestamp - actual.timestamp);
    const maxTimeDiff = 10000; // 10 seconds
    
    return detected.type === actual.type && timeDiff <= maxTimeDiff;
  }

  calculateAccuracyRate(detectedThreats: Threat[], actualThreats: Threat[]): number {
    if (actualThreats.length === 0) return 0;
    
    const correctDetections = detectedThreats.filter(detected => 
      actualThreats.some(actual => 
        actual.type === detected.type && 
        this.isThreatMatch(detected, actual)
      )
    ).length;
    
    return (correctDetections / actualThreats.length) * 100;
  }

  calculatePrecision(detectedThreats: Threat[], actualThreats: Threat[]): number {
    if (detectedThreats.length === 0) return 0;
    
    const correctDetections = detectedThreats.filter(detected => 
      actualThreats.some(actual => 
        actual.type === detected.type && 
        this.isThreatMatch(detected, actual)
      )
    ).length;
    
    return (correctDetections / detectedThreats.length) * 100;
  }

  calculateRecall(detectedThreats: Threat[], actualThreats: Threat[]): number {
    return this.calculateAccuracyRate(detectedThreats, actualThreats);
  }

  calculateF1Score(detectedThreats: Threat[], actualThreats: Threat[]): number {
    const precision = this.calculatePrecision(detectedThreats, actualThreats);
    const recall = this.calculateRecall(detectedThreats, actualThreats);
    
    if (precision + recall === 0) return 0;
    
    return (2 * precision * recall) / (precision + recall);
  }

  getGrade(score: Score): string {
    const total = score.total;
    
    if (total >= 1000) return 'S';
    if (total >= 800) return 'A';
    if (total >= 600) return 'B';
    if (total >= 400) return 'C';
    if (total >= 200) return 'D';
    return 'F';
  }

  getPerformanceFeedback(score: Score): string[] {
    const feedback: string[] = [];
    
    if (score.accuracy > 500) {
      feedback.push("Excellent threat detection accuracy!");
    } else if (score.accuracy > 200) {
      feedback.push("Good threat detection skills.");
    } else {
      feedback.push("Need to improve threat detection accuracy.");
    }
    
    if (score.speed > 30) {
      feedback.push("Very fast response time!");
    } else if (score.speed > 10) {
      feedback.push("Good response speed.");
    } else {
      feedback.push("Try to respond faster to threats.");
    }
    
    if (score.falsePositives > 0) {
      feedback.push(`Reduce false positives (${score.falsePositives} detected).`);
    }
    
    if (score.missedThreats > 0) {
      feedback.push(`Don't miss threats (${score.missedThreats} missed).`);
    }
    
    return feedback;
  }

  // Calculate level progression based on total score
  calculateLevel(totalScore: number): number {
    return Math.floor(totalScore / 1000) + 1;
  }

  // Calculate experience points for leveling
  calculateXP(score: Score): number {
    return Math.floor(score.total * 0.1);
  }
} 