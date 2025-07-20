import React, { useState } from 'react';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const TutorialDialog: React.FC<TutorialDialogProps> = ({ isOpen, onClose, onStart }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to CyberGuard Command Center",
      content: "Agent, you've been selected for a critical mission. You'll be monitoring network traffic in real-time to identify and neutralize cyber threats. Your training begins now.",
      image: null
    },
    {
      title: "Understanding Threat Indicators",
      content: "Network packets are color-coded by threat level: Green (Safe), Yellow (Suspicious), Red (Malicious), and Purple (Critical). Each color represents a different level of danger.",
      image: null
    },
    {
      title: "Threat Detection Protocol",
      content: "Click on suspicious or malicious packets to neutralize threats. Correct identifications earn you points, but false alarms (clicking safe traffic) will cost you points. Stay sharp!",
      image: null
    },
    {
      title: "Advanced Threat Isolation",
      content: "Double-click on confirmed threats to isolate them completely. This removes them from the network and adds to your containment score. This is your primary defense mechanism.",
      image: null
    },
    {
      title: "Navigation and Reconnaissance",
      content: "Use your mouse wheel to zoom in/out for detailed analysis, and drag to pan around the network battlefield. Get close to examine traffic patterns and identify hidden threats.",
      image: null
    },
    {
      title: "Mission Ready",
      content: "You're now ready for your first deployment. Remember: speed and accuracy are your weapons. Every second counts in cyber defense. Good luck, agent!",
      image: null
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStart();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-dialog">
        <div className="tutorial-header">
          <h2>{tutorialSteps[currentStep].title}</h2>
          <button className="tutorial-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tutorial-content">
          <p>{tutorialSteps[currentStep].content}</p>
          
          {tutorialSteps[currentStep].image && (
            <div className="tutorial-image">
              {/* Add tutorial images here if needed */}
            </div>
          )}
        </div>
        
        <div className="tutorial-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {currentStep + 1} of {tutorialSteps.length}
          </span>
        </div>
        
        <div className="tutorial-actions">
          <button 
            className="tutorial-button secondary" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button 
            className="tutorial-button primary" 
            onClick={nextStep}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Start Game' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialDialog; 