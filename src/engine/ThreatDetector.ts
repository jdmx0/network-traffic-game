import { Packet, Threat, ThreatType } from '../types/game';

export class ThreatDetector {
  private ddosThreshold: number = 10; // packets per second
  private portScanThreshold: number = 5; // sequential ports
  private dataExfilThreshold: number = 15; // large data transfers
  private timeWindow: number = 5000; // 5 seconds

  detectThreats(packets: Packet[]): Threat[] {
    const threats: Threat[] = [];
    
    // Group packets by time window
    const timeGroups = this.groupPacketsByTime(packets);
    
    // Detect DDoS attacks
    const ddosThreats = this.detectDDoS(timeGroups);
    threats.push(...ddosThreats);
    
    // Detect port scanning
    const portScanThreats = this.detectPortScan(packets);
    threats.push(...portScanThreats);
    
    // Detect data exfiltration
    const dataExfilThreats = this.detectDataExfiltration(packets);
    threats.push(...dataExfilThreats);
    
    return threats;
  }

  private detectDDoS(timeGroups: Map<number, Packet[]>): Threat[] {
    const threats: Threat[] = [];
    
    timeGroups.forEach((packets, timestamp) => {
      const volume = packets.reduce((sum, packet) => sum + packet.volume, 0);
      const uniqueSources = new Set(packets.map(p => p.source)).size;
      
      if (volume > this.ddosThreshold * 1000 && uniqueSources > 5) {
        threats.push({
          id: `ddos_${timestamp}`,
          type: ThreatType.DDOS,
          packets: packets,
          severity: volume > this.ddosThreshold * 2000 ? 'critical' : 'high',
          description: `DDoS attack detected: ${volume} volume from ${uniqueSources} sources`,
          timestamp: timestamp
        });
      }
    });
    
    return threats;
  }

  private detectPortScan(packets: Packet[]): Threat[] {
    const threats: Threat[] = [];
    const sourceGroups = new Map<string, Packet[]>();
    
    // Group packets by source
    packets.forEach(packet => {
      if (!sourceGroups.has(packet.source)) {
        sourceGroups.set(packet.source, []);
      }
      sourceGroups.get(packet.source)!.push(packet);
    });
    
    // Check for sequential patterns
    sourceGroups.forEach((packets, source) => {
      const destinations = packets.map(p => p.destination);
      const uniqueDestinations = new Set(destinations);
      
      if (uniqueDestinations.size > this.portScanThreshold) {
        threats.push({
          id: `portscan_${source}`,
          type: ThreatType.PORT_SCAN,
          packets: packets,
          severity: uniqueDestinations.size > 20 ? 'high' : 'medium',
          description: `Port scan detected from ${source} to ${uniqueDestinations.size} destinations`,
          timestamp: Date.now()
        });
      }
    });
    
    return threats;
  }

  private detectDataExfiltration(packets: Packet[]): Threat[] {
    const threats: Threat[] = [];
    const sourceDestPairs = new Map<string, Packet[]>();
    
    // Group packets by source-destination pairs
    packets.forEach(packet => {
      const key = `${packet.source}-${packet.destination}`;
      if (!sourceDestPairs.has(key)) {
        sourceDestPairs.set(key, []);
      }
      sourceDestPairs.get(key)!.push(packet);
    });
    
    // Check for large data transfers
    sourceDestPairs.forEach((packets, pair) => {
      const totalVolume = packets.reduce((sum, packet) => sum + packet.volume, 0);
      const timeSpan = Math.max(...packets.map(p => p.timestamp)) - 
                      Math.min(...packets.map(p => p.timestamp));
      
      if (totalVolume > this.dataExfilThreshold && timeSpan < 10000) {
        const [source, destination] = pair.split('-');
        threats.push({
          id: `dataexfil_${source}`,
          type: ThreatType.DATA_EXFILTRATION,
          packets: packets,
          severity: totalVolume > this.dataExfilThreshold * 2 ? 'critical' : 'high',
          description: `Data exfiltration detected: ${totalVolume} volume from ${source} to ${destination}`,
          timestamp: Date.now()
        });
      }
    });
    
    return threats;
  }

  private groupPacketsByTime(packets: Packet[]): Map<number, Packet[]> {
    const groups = new Map<number, Packet[]>();
    
    packets.forEach(packet => {
      const timeSlot = Math.floor(packet.timestamp / this.timeWindow) * this.timeWindow;
      if (!groups.has(timeSlot)) {
        groups.set(timeSlot, []);
      }
      groups.get(timeSlot)!.push(packet);
    });
    
    return groups;
  }

  isPacketThreat(packet: Packet): boolean {
    return packet.isThreat || packet.type !== 'normal';
  }

  getThreatType(packet: Packet): ThreatType | null {
    if (!this.isPacketThreat(packet)) {
      return null;
    }
    
    return packet.threatType || null;
  }

  // Real-time threat detection for single packets
  detectRealTimeThreat(packet: Packet, recentPackets: Packet[]): Threat | null {
    // Check if this packet is part of a larger threat pattern
    const relatedPackets = recentPackets.filter(p => 
      p.source === packet.source || p.destination === packet.destination
    );
    
    if (relatedPackets.length > 0) {
      const allPackets = [...relatedPackets, packet];
      const threats = this.detectThreats(allPackets);
      
      if (threats.length > 0) {
        return threats[0]; // Return the first detected threat
      }
    }
    
    return null;
  }

  // Adjust detection sensitivity
  setSensitivity(ddosThreshold?: number, portScanThreshold?: number, dataExfilThreshold?: number): void {
    if (ddosThreshold !== undefined) this.ddosThreshold = ddosThreshold;
    if (portScanThreshold !== undefined) this.portScanThreshold = portScanThreshold;
    if (dataExfilThreshold !== undefined) this.dataExfilThreshold = dataExfilThreshold;
  }
} 