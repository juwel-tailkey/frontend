import type { SetupState } from "../../types";

type CreateProjectStepProps = {
  setup: SetupState;
  onChange: (setup: SetupState) => void;
};

export function CreateProjectStep({ setup, onChange }: CreateProjectStepProps) {
  const updateProject = (key: keyof SetupState["project"], value: string) => {
    onChange({
      ...setup,
      project: {
        ...setup.project,
        [key]: value
      }
    });
  };

  return (
    <div className="setup-content">
      <section className="setup-intro">
        <h1>Create your first project</h1>
        <p>
          Set up your project workspace under {setup.basics.organization || "your organisation"}. You can add more
          projects later.
        </p>
      </section>

      <section className="setup-panel">
        <h2>Project Details</h2>
        <div className="setup-form-grid">
          <label>
            <span>Project name</span>
            <input
              value={setup.project.projectName}
              placeholder="e.g. Account_Creation_CVR"
              onChange={(event) => updateProject("projectName", event.target.value)}
            />
          </label>
          <label>
            <span>Industry</span>
            <select value={setup.project.industry} onChange={(event) => updateProject("industry", event.target.value)}>
              <option value="">Select Industry</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="Retail">Retail</option>
              <option value="Finance">Finance</option>
            </select>
          </label>
          <label>
            <span>Timezone</span>
            <select value={setup.project.timezone} onChange={(event) => updateProject("timezone", event.target.value)}>
              <option value="UTC -4:00 - Tokyo">UTC -4:00 - Tokyo</option>
              <option value="UTC +6:00 - Dhaka">UTC +6:00 - Dhaka</option>
              <option value="UTC +0:00 - London">UTC +0:00 - London</option>
              <option value="UTC -5:00 - New York">UTC -5:00 - New York</option>
            </select>
          </label>
        </div>
        <label className="full-width">
          <span>Description (optional)</span>
          <textarea
            value={setup.project.description}
            placeholder="What will this project track?"
            onChange={(event) => updateProject("description", event.target.value)}
          />
        </label>
      </section>
    </div>
  );
}
