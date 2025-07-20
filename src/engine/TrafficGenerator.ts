import { Packet, PacketType, ThreatType } from '../types/game';

export class TrafficGenerator {
  private normalBaseline: number = 100; // packets per second
  private currentScenario: any;
  private packetIdCounter: number = 0;
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;

  constructor(canvasWidth: number = 800, canvasHeight: number = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  generateNormalTraffic(count: number = 5): Packet[] {
    const packets: Packet[] = [];
    
    for (let i = 0; i < count; i++) {
      packets.push({
        id: `packet_${this.packetIdCounter++}`,
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        width: 4 + Math.random() * 8,
        height: 4 + Math.random() * 8,
        type: PacketType.NORMAL,
        source: this.generateRandomIP(),
        destination: this.generateRandomIP(),
        volume: 1 + Math.random() * 5,
        timestamp: Date.now(),
        isThreat: false
      });
    }
    
    return packets;
  }

  generateFlowTraffic(count: number = 8): Packet[] {
    const packets: Packet[] = [];
    const flowPatterns = [
      { source: 'Internet', dest: 'Datacenter', volume: 3 },
      { source: 'Datacenter', dest: 'Customers', volume: 2 },
      { source: 'Customers', dest: 'Site', volume: 4 },
      { source: 'Site', dest: 'Internet', volume: 1 },
      { source: 'Datacenter', dest: 'Site', volume: 2 },
      { source: 'Internet', dest: 'Customers', volume: 3 }
    ];
    
    for (let i = 0; i < count; i++) {
      const pattern = flowPatterns[Math.floor(Math.random() * flowPatterns.length)];
      packets.push({
        id: `packet_${this.packetIdCounter++}`,
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        width: 4 + Math.random() * 8,
        height: 4 + Math.random() * 8,
        type: PacketType.NORMAL,
        source: pattern.source,
        destination: pattern.dest,
        volume: pattern.volume + Math.random() * 3,
        timestamp: Date.now(),
        isThreat: false
      });
    }
    
    return packets;
  }

  generateDDoSTraffic(count: number = 15): Packet[] {
    const packets: Packet[] = [];
    const baseX = Math.random() * this.canvasWidth;
    const baseY = Math.random() * this.canvasHeight;
    
    for (let i = 0; i < count; i++) {
      packets.push({
        id: `packet_${this.packetIdCounter++}`,
        x: baseX + (Math.random() - 0.5) * 100,
        y: baseY + (Math.random() - 0.5) * 100,
        width: 8 + Math.random() * 12,
        height: 8 + Math.random() * 12,
        type: PacketType.MALICIOUS,
        source: this.generateRandomIP(),
        destination: this.generateRandomIP(),
        volume: 10 + Math.random() * 20,
        timestamp: Date.now(),
        isThreat: true,
        threatType: ThreatType.DDOS
      });
    }
    
    return packets;
  }

  generatePortScanTraffic(count: number = 10): Packet[] {
    const packets: Packet[] = [];
    const targetIP = this.generateRandomIP();
    
    for (let i = 0; i < count; i++) {
      packets.push({
        id: `packet_${this.packetIdCounter++}`,
        x: 50 + (i * 70),
        y: 100 + Math.random() * 50,
        width: 6 + Math.random() * 6,
        height: 6 + Math.random() * 6,
        type: PacketType.SUSPICIOUS,
        source: this.generateRandomIP(),
        destination: targetIP,
        volume: 3 + Math.random() * 7,
        timestamp: Date.now() + i * 100,
        isThreat: true,
        threatType: ThreatType.PORT_SCAN
      });
    }
    
    return packets;
  }

  generateDataExfiltrationTraffic(count: number = 8): Packet[] {
    const packets: Packet[] = [];
    const sourceIP = this.generateRandomIP();
    const destIP = this.generateRandomIP();
    
    for (let i = 0; i < count; i++) {
      packets.push({
        id: `packet_${this.packetIdCounter++}`,
        x: 200 + Math.random() * 400,
        y: 300 + Math.random() * 200,
        width: 10 + Math.random() * 15,
        height: 10 + Math.random() * 15,
        type: PacketType.CRITICAL,
        source: sourceIP,
        destination: destIP,
        volume: 15 + Math.random() * 25,
        timestamp: Date.now() + i * 200,
        isThreat: true,
        threatType: ThreatType.DATA_EXFILTRATION
      });
    }
    
    return packets;
  }

  generateMixedTraffic(normalCount: number = 8, threatType?: ThreatType): Packet[] {
    const packets: Packet[] = [];
    
    // Add normal traffic
    packets.push(...this.generateNormalTraffic(normalCount));
    
    // Add threat traffic based on type
    if (threatType) {
      switch (threatType) {
        case ThreatType.DDOS:
          packets.push(...this.generateDDoSTraffic());
          break;
        case ThreatType.PORT_SCAN:
          packets.push(...this.generatePortScanTraffic());
          break;
        case ThreatType.DATA_EXFILTRATION:
          packets.push(...this.generateDataExfiltrationTraffic());
          break;
      }
    }
    
    return packets;
  }

  generateTrafficStream(duration: number = 30000, threatFrequency: number = 0.3): Packet[] {
    const packets: Packet[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      // Generate normal traffic
      packets.push(...this.generateNormalTraffic(3));
      
      // Randomly add threats
      if (Math.random() < threatFrequency) {
        const threatTypes = [ThreatType.DDOS, ThreatType.PORT_SCAN, ThreatType.DATA_EXFILTRATION];
        const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        packets.push(...this.generateMixedTraffic(2, randomThreat));
      }
      
      // Small delay to simulate real-time
      const delay = 100 + Math.random() * 200;
      const waitUntil = Date.now() + delay;
      while (Date.now() < waitUntil) {
        // Busy wait
      }
    }
    
    return packets;
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  setCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
} 