const steps = [
  { number: 1, label: "Organisation" },
  { number: 2, label: "Project" },
  { number: 3, label: "Team", disabled: true },
  { number: 4, label: "BigQuery" }
];

type SetupStepperProps = {
  currentStep: number;
  saving: boolean;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
};

export function SetupStepper({ currentStep, saving, onStepChange, onNext, onBack }: SetupStepperProps) {
  return (
    <div className="setup-stepper">
      <div>
        <span>Setup Steps</span>
        <div className="step-dots">
          {steps.map((step) => (
            <button
              key={step.number}
              type="button"
              className={[
                step.number === currentStep ? "active" : undefined,
                step.disabled ? "disabled" : undefined
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => !step.disabled && onStepChange(step.number)}
              disabled={step.disabled || saving}
              aria-label={
                step.disabled ? `Step ${step.number}: ${step.label} (coming soon)` : `Go to step ${step.number}: ${step.label}`
              }
              title={step.disabled ? "Coming soon" : step.label}
            >
              {step.number}
            </button>
          ))}
        </div>
      </div>
      <div className="step-actions">
        <button type="button" className="secondary-button" onClick={onBack} disabled={currentStep === 1 || saving}>
          Back
        </button>
        <button type="button" className="primary-button" onClick={onNext} disabled={saving}>
          {currentStep === 4 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
