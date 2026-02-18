interface StepperProps {
  steps: Array<{ key: string; label: string }>;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div class="stepper">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isClickable = isCompleted || isActive;

        const circleClass = [
          "step-circle",
          isActive ? "active" : "",
          isCompleted ? "completed" : "",
          !isActive && !isCompleted ? "upcoming" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const connectorClass = [
          "step-connector",
          i <= currentStep ? "completed" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <>
            {i > 0 && <div class={connectorClass} />}
            <div
              class="step"
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onClick={() => isClickable && onStepClick(i)}
            >
              <div class={circleClass}>
                {isCompleted ? "\u2713" : i + 1}
              </div>
              <span class="step-label">{step.label}</span>
            </div>
          </>
        );
      })}
    </div>
  );
}
