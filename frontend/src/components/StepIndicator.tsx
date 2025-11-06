
import React from 'react';
import { AppStep } from '../types';

interface Step {
    step: AppStep;
    label: string;
}

interface StepIndicatorProps {
  currentStep: AppStep;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  const currentStepIndex = steps.findIndex(s => s.step === currentStep);
  if (currentStepIndex === -1) return null; // Don't render if the current step is not in the list

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.label} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStepIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-red-800" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-red-800 rounded-full">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </>
            ) : stepIdx === currentStepIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-red-800 rounded-full">
                  <span className="h-2.5 w-2.5 bg-red-800 rounded-full" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-gray-300 rounded-full" />
              </>
            )}
             <span className="absolute -bottom-6 text-xs text-center w-20 -left-6 sm:left-auto sm:w-auto font-medium text-gray-700">{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;