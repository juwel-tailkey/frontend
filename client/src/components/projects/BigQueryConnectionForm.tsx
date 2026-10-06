import { FormEvent, useState } from "react";

export type BigQueryFormValues = {
  gcpProjectId: string;
  datasetId: string;
  location: string;
};

type BigQueryConnectionFormProps = {
  values: BigQueryFormValues;
  existingFilename?: string;
  isConnected?: boolean;
  selectedReport?: string | null;
  submitLabel: string;
  saving?: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function BigQueryConnectionForm({
  values,
  existingFilename,
  isConnected = false,
  selectedReport,
  submitLabel,
  saving = false,
  onSubmit
}: BigQueryConnectionFormProps) {
  const [gcpProjectId, setGcpProjectId] = useState(values.gcpProjectId);
  const [datasetId, setDatasetId] = useState(values.datasetId);
  const [location, setLocation] = useState(values.location || "US");
  const [serviceAccountFile, setServiceAccountFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!gcpProjectId.trim()) {
      setError("GCP Project ID is required.");
      return;
    }

    if (!isConnected && !existingFilename && !serviceAccountFile) {
      setError("Service account JSON file is required.");
      return;
    }

    const formData = new FormData();
    formData.append("gcp_project_id", gcpProjectId.trim());
    if (datasetId.trim()) {
      formData.append("dataset_id", datasetId.trim());
    }
    formData.append("location", location);
    if (serviceAccountFile) {
      formData.append("service_account", serviceAccountFile);
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save BigQuery connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Direct Connect</h2>

      <div className="setup-form-grid">
        <label>
          <span>GCP Project ID</span>
          <input
            value={gcpProjectId}
            placeholder="my-gcp-project-id"
            onChange={(event) => setGcpProjectId(event.target.value)}
            required
          />
        </label>

        <label>
          <span>Dataset ID (optional)</span>
          <input
            value={datasetId}
            placeholder="analytics_dataset"
            onChange={(event) => setDatasetId(event.target.value)}
          />
        </label>

        <label>
          <span>Location</span>
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="asia-southeast1">asia-southeast1</option>
          </select>
        </label>

        <label>
          <span>Service Account JSON Key</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => setServiceAccountFile(event.target.files?.[0] ?? null)}
          />
          {existingFilename && <small className="file-hint">Current file: {existingFilename}</small>}
        </label>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="connect-row">
        <button type="submit" className="primary-button" disabled={submitting || saving}>
          {submitting ? "Saving..." : submitLabel}
        </button>
        {isConnected && <span className="connected-check">Connected</span>}
      </div>

      {isConnected && selectedReport && <p className="connection-meta">Report: {selectedReport}</p>}
    </form>
  );
}
