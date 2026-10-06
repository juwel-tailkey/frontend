import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  completeSetup,
  connectBigQuery,
  fetchSetupGoals,
  fetchSetupState,
  updateGoal,
  updateProjectSetup
} from "../api";
import { ConnectBigQueryStep } from "../components/setup/ConnectBigQueryStep";
import { CreateProjectStep } from "../components/setup/CreateProjectStep";
import { GoalEndpointModal } from "../components/setup/GoalEndpointModal";
import { ProjectBasicsStep } from "../components/setup/ProjectBasicsStep";
import { SetupStepper } from "../components/setup/SetupStepper";
import { useDateRange } from "../context/DateRangeContext";
import type { GoalEndpoint, SetupState } from "../types";

const minStep = 1;
const maxStep = 4;
const skippedStep = 3;

export function SetupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [availableGoals, setAvailableGoals] = useState<GoalEndpoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const { dateRange } = useDateRange();
  const navigate = useNavigate();

  const requestedStep = useMemo(() => {
    const step = Number(searchParams.get("step") || 1);
    return clampStep(step);
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(requestedStep);

  useEffect(() => {
    setCurrentStep(requestedStep);
  }, [requestedStep]);

  useEffect(() => {
    let isMounted = true;

    fetchSetupState()
      .then((state) => {
        if (isMounted) {
          setSetup(state);
          setAvailableGoals([]);
          setCurrentStep(clampStep(requestedStep || state.currentStep));
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load setup state.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestedStep]);

  async function goToStep(step: number) {
    const nextStep = clampStep(step);
    setCurrentStep(nextStep);
    setSearchParams(nextStep === 1 ? {} : { step: String(nextStep) });
  }

  async function handleNext() {
    if (!setup) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (currentStep === 1) {
        const nextState = await updateProjectSetup({
          basics: setup.basics,
          organization: setup.basics.organization,
          industry: setup.basics.industry,
          currentStep: 2
        });
        setSetup(nextState);
        await goToStep(2);
      } else if (currentStep === 2) {
        const nextState = await updateProjectSetup({
          ...setup.project,
          currentStep: 4
        });
        setSetup(nextState);
        await goToStep(4);
      } else if (currentStep === 4) {
        if (!setup.connection.directConnected) {
          setError("Connect to BigQuery before finishing setup.");
          return;
        }
        if (!setup.goal) {
          setError("Select a conversion goal before finishing setup.");
          setIsGoalModalOpen(true);
          return;
        }
        const nextState = await completeSetup();
        setSetup(nextState);
        navigate("/dashboard");
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Unable to save setup.");
    } finally {
      setSaving(false);
    }
  }

  async function loadGoals() {
    setGoalsLoading(true);
    setAvailableGoals([]);

    try {
      const goals = await fetchSetupGoals(dateRange);
      setAvailableGoals(goals);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load goals.");
      setAvailableGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }

  async function handleConnect(formData: FormData) {
    const nextState = await connectBigQuery(formData);
    setSetup(nextState);
    setIsGoalModalOpen(true);
    await loadGoals();
  }

  async function handleOpenGoalModal() {
    setIsGoalModalOpen(true);
    await loadGoals();
  }

  async function handleGoalSelect(goal: GoalEndpoint) {
    const nextState = await updateGoal(goal);
    setSetup(nextState);
  }

  if (error && !setup) {
    return (
      <main className="setup-page">
        <section className="state-card">
          <h1>Setup failed to load</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!setup) {
    return (
      <main className="setup-page">
        <section className="state-card">
          <h1>Loading setup</h1>
          <p>Fetching your project setup...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="setup-page">
      <SetupStepper
        currentStep={currentStep}
        saving={saving}
        onStepChange={goToStep}
        onNext={handleNext}
        onBack={() => goToStep(currentStep === 4 ? 2 : currentStep - 1)}
      />

      {error && <p className="setup-error">{error}</p>}

      {currentStep === 1 && <ProjectBasicsStep setup={setup} onChange={setSetup} />}
      {currentStep === 2 && <CreateProjectStep setup={setup} onChange={setSetup} />}
      {/* Step 3 (invite users) skipped for MVP */}
      {currentStep === 4 && (
        <ConnectBigQueryStep
          setup={setup}
          saving={saving}
          onConnect={handleConnect}
          onOpenGoalModal={() => void handleOpenGoalModal()}
        />
      )}

      {isGoalModalOpen && (
        <GoalEndpointModal
          goals={availableGoals}
          selectedGoal={setup.goal}
          onSelect={handleGoalSelect}
          onClose={() => setIsGoalModalOpen(false)}
          loading={goalsLoading}
        />
      )}
    </main>
  );
}

function clampStep(step: number): number {
  if (!Number.isFinite(step)) {
    return minStep;
  }

  if (step === skippedStep) {
    return 4;
  }

  return Math.min(maxStep, Math.max(minStep, step));
}
