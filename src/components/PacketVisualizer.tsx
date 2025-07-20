import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Packet, PacketType, ThreatType } from '../types/game';

interface PacketVisualizerProps {
  packets: Packet[];
  width: number;
  height: number;
  onPacketClick?: (packet: Packet) => void;
  onPacketIsolate?: (packet: Packet) => void;
  isPlaying: boolean;
  gameMode: string;
}

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'internet' | 'datacenter' | 'customers' | 'site' | 'dmz' | 'internal';
  traffic: number;
  threats: number;
  color: string;
}

interface NetworkFlow {
  id: string;
  sourceId: string;
  destId: string;
  protocol: 'http' | 'https' | 'ssh' | 'ftp' | 'dns' | 'smtp';
  volume: number;
  packets: number;
  isThreat: boolean;
  threatType?: ThreatType;
  startTime: number;
  duration: number;
  color: string;
  lineWidth: number;
}

interface FlowPacket {
  id: string;
  flowId: string;
  x: number;
  y: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
  isThreat: boolean;
}

const PacketVisualizer: React.FC<PacketVisualizerProps> = ({
  packets,
  width,
  height,
  onPacketClick,
  onPacketIsolate,
  isPlaying,
  gameMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [flowPackets, setFlowPackets] = useState<FlowPacket[]>([]);

  // Initialize network nodes
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const newNodes: NetworkNode[] = [
      { 
        id: 'internet', 
        x: centerX - 50, 
        y: centerY - radius, 
        name: 'Internet', 
        type: 'internet',
        traffic: 0,
        threats: 0,
        color: '#2196F3'
      },
      { 
        id: 'datacenter', 
        x: centerX - radius, 
        y: centerY - 30, 
        name: 'Datacenter', 
        type: 'datacenter',
        traffic: 0,
        threats: 0,
        color: '#9C27B0'
      },
      { 
        id: 'customers', 
        x: centerX + radius, 
        y: centerY + 30, 
        name: 'Customers', 
        type: 'customers',
        traffic: 0,
        threats: 0,
        color: '#4CAF50'
      },
      { 
        id: 'site', 
        x: centerX + 30, 
        y: centerY + radius, 
        name: 'Site', 
        type: 'site',
        traffic: 0,
        threats: 0,
        color: '#FF9800'
      },
      { 
        id: 'dmz', 
        x: centerX, 
        y: centerY - 100, 
        name: 'DMZ', 
        type: 'dmz',
        traffic: 0,
        threats: 0,
        color: '#F44336'
      },
      { 
        id: 'internal', 
        x: centerX, 
        y: centerY + 100, 
        name: 'Internal', 
        type: 'internal',
        traffic: 0,
        threats: 0,
        color: '#607D8B'
      }
    ];
    
    setNodes(newNodes);
  }, [width, height]);

  const getProtocolColor = useCallback((protocol: string) => {
    switch (protocol) {
      case 'http': return '#4CAF50';
      case 'https': return '#2196F3';
      case 'ssh': return '#FF9800';
      case 'ftp': return '#9C27B0';
      case 'dns': return '#607D8B';
      case 'smtp': return '#E91E63';
      default: return '#757575';
    }
  }, []);

  // Convert packets to network flows
  useEffect(() => {
    if (packets.length === 0 || nodes.length === 0) return;

    const newFlows: NetworkFlow[] = packets.map(packet => {
      const sourceNode = nodes.find(n => n.name === packet.source) || 
                        nodes[Math.floor(Math.random() * nodes.length)];
      const destNode = nodes.find(n => n.name === packet.destination) || 
                      nodes[Math.floor(Math.random() * nodes.length)];
      
      const protocols: Array<'http' | 'https' | 'ssh' | 'ftp' | 'dns' | 'smtp'> = 
        ['http', 'https', 'ssh', 'ftp', 'dns', 'smtp'];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      
      return {
        id: `flow_${packet.id}`,
        sourceId: sourceNode.id,
        destId: destNode.id,
        protocol,
        volume: packet.volume,
        packets: 1,
        isThreat: packet.isThreat,
        threatType: packet.threatType,
        startTime: Date.now(),
        duration: 10000 + Math.random() * 20000, // 10-30 seconds
        color: getProtocolColor(protocol),
        lineWidth: 1 + packet.volume * 0.5
      };
    });

    setFlows(prev => {
      const combined = [...prev, ...newFlows];
      return combined.slice(-100); // Keep last 100 flows
    });
  }, [packets, nodes, getProtocolColor]);

  // Generate flow packets
  useEffect(() => {
    if (flows.length === 0) return;

    const newPackets: FlowPacket[] = flows.flatMap(flow => {
      const sourceNode = nodes.find(n => n.id === flow.sourceId);
      const destNode = nodes.find(n => n.id === flow.destId);
      
      if (!sourceNode || !destNode) return [];

      // Generate multiple packets per flow
      const packetCount = Math.min(flow.packets, 5);
      const packets: FlowPacket[] = [];
      
      for (let i = 0; i < packetCount; i++) {
        packets.push({
          id: `packet_${flow.id}_${i}`,
          flowId: flow.id,
          x: sourceNode.x,
          y: sourceNode.y,
          progress: (i / packetCount) * 0.8, // Stagger packets
          speed: 0.003 + Math.random() * 0.005,
          size: 3 + flow.volume * 0.5,
          color: flow.isThreat ? '#FF4444' : flow.color,
          isThreat: flow.isThreat
        });
      }
      
      return packets;
    });

    setFlowPackets(prev => {
      const combined = [...prev, ...newPackets];
      return combined.slice(-300); // Keep last 300 packets
    });
  }, [flows, nodes]);

  // Update flow packet positions
  const updateFlowPackets = useCallback(() => {
    setFlowPackets(prev => 
      prev.map(packet => {
        const flow = flows.find(f => f.id === packet.flowId);
        const sourceNode = nodes.find(n => n.id === flow?.sourceId);
        const destNode = nodes.find(n => n.id === flow?.destId);
        
        if (!flow || !sourceNode || !destNode) return packet;

        const newProgress = packet.progress + packet.speed;
        
        if (newProgress >= 1) {
          return null; // Remove completed packets
        }
        
        // Linear interpolation between source and destination
        const x = sourceNode.x + (destNode.x - sourceNode.x) * newProgress;
        const y = sourceNode.y + (destNode.y - sourceNode.y) * newProgress;
        
        return {
          ...packet,
          x,
          y,
          progress: newProgress
        };
      }).filter(Boolean) as FlowPacket[]
    );
  }, [flows, nodes]);

  const drawNodes = useCallback((ctx: CanvasRenderingContext2D) => {
    nodes.forEach(node => {
      const transformedX = (node.x + pan.x) * zoom;
      const transformedY = (node.y + pan.y) * zoom;
      
      ctx.save();
      
      // Draw node circle
      const radius = 20 * zoom;
      ctx.fillStyle = node.color + '20';
      ctx.beginPath();
      ctx.arc(transformedX, transformedY, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(transformedX, transformedY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw traffic counter
      if (node.traffic > 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = `${12 * zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(node.traffic.toString(), transformedX, transformedY - radius - 5 * zoom);
      }
      
      // Draw node label
      ctx.fillStyle = '#333333';
      ctx.font = `${14 * zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name, transformedX, transformedY + radius + 20 * zoom);
      
      ctx.restore();
    });
  }, [nodes, zoom, pan]);

  const drawFlows = useCallback((ctx: CanvasRenderingContext2D) => {
    flows.forEach(flow => {
      const sourceNode = nodes.find(n => n.id === flow.sourceId);
      const destNode = nodes.find(n => n.id === flow.destId);
      
      if (!sourceNode || !destNode) return;
      
      const startX = (sourceNode.x + pan.x) * zoom;
      const startY = (sourceNode.y + pan.y) * zoom;
      const endX = (destNode.x + pan.x) * zoom;
      const endY = (destNode.y + pan.y) * zoom;
      
      ctx.save();
      
      // Draw flow line
      ctx.strokeStyle = flow.isThreat ? '#FF4444' : flow.color;
      ctx.lineWidth = flow.lineWidth * zoom;
      ctx.globalAlpha = flow.isThreat ? 0.8 : 0.4;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.restore();
    });
  }, [flows, nodes, zoom, pan]);

  const drawFlowPackets = useCallback((ctx: CanvasRenderingContext2D) => {
    flowPackets.forEach(packet => {
      const transformedX = (packet.x + pan.x) * zoom;
      const transformedY = (packet.y + pan.y) * zoom;
      const transformedSize = packet.size * zoom;
      
      ctx.save();
      
      // Draw packet
      ctx.fillStyle = packet.color;
      ctx.globalAlpha = packet.isThreat ? 0.9 : 0.7;
      ctx.beginPath();
      ctx.arc(transformedX, transformedY, transformedSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow for threats
      if (packet.isThreat) {
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.arc(transformedX, transformedY, transformedSize + 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }, [flowPackets, zoom, pan]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Update and draw
    updateFlowPackets();
    drawFlows(ctx);
    drawNodes(ctx);
    drawFlowPackets(ctx);

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [width, height, updateFlowPackets, drawFlows, drawNodes, drawFlowPackets, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isPlaying]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPacketClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    // Check for clicked packets
    const clickedPacket = flowPackets.find(packet => {
      const distance = Math.sqrt(
        Math.pow(x - packet.x, 2) + Math.pow(y - packet.y, 2)
      );
      return distance <= packet.size + 8;
    });

    if (clickedPacket) {
      // Find corresponding packet
      const flow = flows.find(f => f.id === clickedPacket.flowId);
      if (flow) {
        const mockPacket: Packet = {
          id: clickedPacket.id,
          x: clickedPacket.x,
          y: clickedPacket.y,
          width: clickedPacket.size * 2,
          height: clickedPacket.size * 2,
          type: PacketType.NORMAL,
          source: nodes.find(n => n.id === flow.sourceId)?.name || '',
          destination: nodes.find(n => n.id === flow.destId)?.name || '',
          volume: flow.volume,
          timestamp: Date.now(),
          isThreat: flow.isThreat,
          threatType: flow.threatType
        };
        onPacketClick(mockPacket);
      }
    }
  }, [flowPackets, flows, nodes, onPacketClick, zoom, pan]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (event.clientX - rect.left - pan.x) / zoom;
        const y = (event.clientY - rect.top - pan.y) / zoom;
        const clickedPacket = flowPackets.find(packet => {
          const distance = Math.sqrt(
            Math.pow(x - packet.x, 2) + Math.pow(y - packet.y, 2)
          );
          return distance <= packet.size + 8;
        });
        
        if (clickedPacket) {
          return;
        }
      }
      
      setIsDragging(true);
      setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
    }
  }, [pan, zoom, flowPackets]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onPacketIsolate) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - pan.x) / zoom;
      const y = (event.clientY - rect.top - pan.y) / zoom;

      const clickedPacket = flowPackets.find(packet => {
        const distance = Math.sqrt(
          Math.pow(x - packet.x, 2) + Math.pow(y - packet.y, 2)
        );
        return distance <= packet.size + 8;
      });

      if (clickedPacket && clickedPacket.isThreat) {
        const flow = flows.find(f => f.id === clickedPacket.flowId);
        if (flow) {
          const mockPacket: Packet = {
            id: clickedPacket.id,
            x: clickedPacket.x,
            y: clickedPacket.y,
            width: clickedPacket.size * 2,
            height: clickedPacket.size * 2,
            type: PacketType.NORMAL,
            source: nodes.find(n => n.id === flow.sourceId)?.name || '',
            destination: nodes.find(n => n.id === flow.destId)?.name || '',
            volume: flow.volume,
            timestamp: Date.now(),
            isThreat: flow.isThreat,
            threatType: flow.threatType
          };
          onPacketIsolate(mockPacket);
        }
      }
    }
  }, [flowPackets, flows, nodes, onPacketIsolate, zoom, pan]);

  return (
    <div className="packet-visualizer">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          cursor: isDragging ? 'grabbing' : 'crosshair',
          backgroundColor: '#ffffff'
        }}
      />
      <div className="packet-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>HTTP</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
          <span>HTTPS</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
          <span>SSH</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF4444' }}></div>
          <span>Threats</span>
        </div>
      </div>
    </div>
  );
};

export default PacketVisualizer; 