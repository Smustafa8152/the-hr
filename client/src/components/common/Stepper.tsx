import { Check } from 'lucide-react';
import { cn } from './UIComponents';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-primary border-primary',
                    isCurrent && 'border-primary bg-primary/10',
                    !isCompleted && !isCurrent && 'border-muted bg-muted/20'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isCurrent && 'text-primary',
                        !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isCurrent || isCompleted) && 'text-foreground',
                      !isCurrent && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-all',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
