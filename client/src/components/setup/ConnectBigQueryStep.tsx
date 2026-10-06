import { useState } from "react";
import { BigQueryConnectionForm } from "../projects/BigQueryConnectionForm";
import { BigQueryHelpModal } from "../ui/BigQueryHelpModal";
import type { SetupState } from "../../types";

type ConnectBigQueryStepProps = {
  setup: SetupState;
  saving: boolean;
  onConnect: (formData: FormData) => Promise<void>;
  onOpenGoalModal: () => void;
};

export function ConnectBigQueryStep({ setup, saving, onConnect, onOpenGoalModal }: ConnectBigQueryStepProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <div className="setup-content connect-step">
      <section className="setup-intro">
        <div className="setup-intro-header">
          <h1>Connect your project to Google BigQuery</h1>
          <button
            type="button"
            className="help-button"
            onClick={() => setShowHelpModal(true)}
            aria-label="Show connection help"
          >
            <span className="help-icon">?</span>
            <span>How to connect</span>
          </button>
        </div>
        <p>
          Connect your project directly to Google BigQuery. After connecting, you will choose a conversion goal from
          your imported data.
        </p>
      </section>

      <section className="setup-panel">
        <BigQueryConnectionForm
          values={{
            gcpProjectId: setup.connection.gcpProjectId || "",
            datasetId: setup.connection.datasetId || "",
            location: setup.connection.location || "US"
          }}
          existingFilename={setup.connection.serviceAccountFile}
          isConnected={setup.connection.directConnected}
          selectedReport={setup.connection.selectedReport}
          submitLabel={setup.connection.directConnected ? "Reconnect" : "Connect"}
          saving={saving}
          onSubmit={onConnect}
        />

        {setup.connection.directConnected && (
          <button type="button" className="goal-modal-trigger" onClick={onOpenGoalModal}>
            {setup.goal ? `Goal: ${setup.goal.path}` : "Select a goal end point"}
          </button>
        )}
      </section>

      <BigQueryHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
