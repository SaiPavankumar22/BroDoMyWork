import React from 'react';
import { Upload, Layout, Type, User, Brain, Eye } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface StepNavigationProps {
  currentStep: string;
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
  isDark: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  isDark
}) => {
  const steps: Omit<Step, 'completed' | 'active'>[] = [
    { id: 'upload', title: 'Upload', icon: <Upload className="w-5 h-5" /> },
    { id: 'template', title: 'Template', icon: <Layout className="w-5 h-5" /> },
    { id: 'font', title: 'Font', icon: <Type className="w-5 h-5" /> },
    { id: 'info', title: 'Info', icon: <User className="w-5 h-5" /> },
    { id: 'generate', title: 'Generate', icon: <Brain className="w-5 h-5" /> },
    { id: 'preview', title: 'Preview', icon: <Eye className="w-5 h-5" /> }
  ];

  const stepsWithStatus: Step[] = steps.map(step => ({
    ...step,
    completed: completedSteps.includes(step.id),
    active: currentStep === step.id
  }));

  return (
    <div className={`${
      isDark ? 'bg-gray-800/50' : 'bg-white/80'
    } backdrop-blur-md rounded-2xl p-6 border ${
      isDark ? 'border-yellow-400/20' : 'border-yellow-400/30'
    } shadow-xl`}>
      <h3 className={`text-lg font-bold mb-6 ${
        isDark ? 'text-yellow-400' : 'text-black'
      }`}>
        Progress
      </h3>
      
      <div className="space-y-4">
        {stepsWithStatus.map((step, index) => (
          <div key={step.id} className="relative">
            <button
              onClick={() => onStepClick(step.id)}
              disabled={!step.completed && !step.active}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                step.active
                  ? isDark
                    ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400'
                    : 'bg-black/10 border-2 border-black text-black'
                  : step.completed
                  ? isDark
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                    : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                  : isDark
                  ? 'bg-gray-700/30 border border-gray-600 text-gray-500'
                  : 'bg-gray-100 border border-gray-200 text-gray-400'
              } ${
                (step.completed || step.active) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.active
                  ? isDark ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'
                  : step.completed
                  ? 'bg-green-500 text-white'
                  : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
              }`}>
                {step.icon}
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-semibold">{step.title}</div>
                <div className={`text-sm ${
                  step.active
                    ? isDark ? 'text-yellow-300' : 'text-gray-700'
                    : step.completed
                    ? 'text-green-600'
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {step.completed ? 'Completed' : step.active ? 'In Progress' : 'Pending'}
                </div>
              </div>
              
              {step.completed && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            
            {index < stepsWithStatus.length - 1 && (
              <div className={`absolute left-9 top-16 w-0.5 h-4 ${
                step.completed ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};