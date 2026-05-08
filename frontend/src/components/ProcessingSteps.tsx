import React from 'react';
import { FileText, Brain, PenTool, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface ProcessingStepsProps {
  currentStep: string;
  error?: string;
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ currentStep, error }) => {
  const steps: Step[] = [
    {
      id: 'extract',
      title: 'Extract Text',
      description: 'Using OCR to read your assignment',
      icon: <FileText className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'analyze',
      title: 'Analyze Questions',
      description: 'Identifying individual questions',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'generate',
      title: 'Generate Answers',
      description: 'Creating human-like responses',
      icon: <PenTool className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'render',
      title: 'Create Handwriting',
      description: 'Rendering in handwritten style',
      icon: <Download className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  // Update step statuses based on current step
  const updatedSteps = steps.map((step) => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    const currentIndex = steps.findIndex(s => s.id === step.id);
    
    if (error && currentIndex === stepIndex) {
      return { ...step, status: 'error' as const };
    } else if (currentIndex < stepIndex) {
      return { ...step, status: 'completed' as const };
    } else if (currentIndex === stepIndex) {
      return { ...step, status: 'processing' as const };
    } else {
      return { ...step, status: 'pending' as const };
    }
  });

  const getStatusColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Processing Progress</h3>
      
      <div className="space-y-4">
        {updatedSteps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex-shrink-0 relative">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(step.status)}`}>
                {step.status === 'processing' ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              
              {index < updatedSteps.length - 1 && (
                <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`p-4 rounded-lg border ${getStatusColor(step.status)}`}>
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm opacity-75 mt-1">{step.description}</p>
                
                {step.status === 'processing' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
                
                {step.status === 'error' && error && (
                  <p className="text-sm mt-2 text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
