import React from 'react';
import { Packet, ThreatType } from '../types/game';

interface EventLogProps {
  events: LogEvent[];
}

export interface LogEvent {
  id: string;
  timestamp: Date;
  type: 'threat_detected' | 'packet_isolated' | 'false_positive' | 'system_info';
  message: string;
  packet?: Packet;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const getEventIcon = (type: LogEvent['type']) => {
    switch (type) {
      case 'threat_detected':
        return '🎯';
      case 'packet_isolated':
        return '🛡️';
      case 'false_positive':
        return '⚠️';
      case 'system_info':
        return 'ℹ️';
      default:
        return '📡';
    }
  };

  const getEventColor = (type: LogEvent['type']) => {
    switch (type) {
      case 'threat_detected':
        return '#ff6b6b';
      case 'packet_isolated':
        return '#ff9800';
      case 'false_positive':
        return '#ffc107';
      case 'system_info':
        return '#2196f3';
      default:
        return '#8a8a8a';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="event-log">
      <div className="event-log-header">
        <h3>Event Log</h3>
        <span className="event-count">{events.length} events</span>
      </div>
      
      <div className="event-log-content">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events yet. Start monitoring to see activity.</p>
          </div>
        ) : (
          events.slice(-10).reverse().map((event) => (
            <div key={event.id} className="event-item" style={{ borderLeftColor: getEventColor(event.type) }}>
              <div className="event-header">
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <span className="event-time">{formatTime(event.timestamp)}</span>
                <span className="event-type">{event.type.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="event-message">{event.message}</div>
              {event.packet && (
                <div className="event-details">
                  <span>Source: {event.packet.source}</span>
                  <span>Destination: {event.packet.destination}</span>
                  {event.packet.threatType && (
                    <span>Threat: {event.packet.threatType}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog; 