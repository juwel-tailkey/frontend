import type { SetupState } from "../../types";

type ProjectBasicsStepProps = {
  setup: SetupState;
  onChange: (setup: SetupState) => void;
};

export function ProjectBasicsStep({ setup, onChange }: ProjectBasicsStepProps) {
  return (
    <div className="setup-content first-step">
      <section className="setup-intro">
        <h1>Organisation details</h1>
        <p>Tell us about your organisation. You can add more projects under this organisation later.</p>
      </section>

      <section className="setup-panel">
        <div className="setup-form-row inline">
          <label>
            <span>Organisation Name</span>
            <input
              value={setup.basics.organization}
              placeholder="Select organisation"
              onChange={(event) =>
                onChange({
                  ...setup,
                  basics: { ...setup.basics, organization: event.target.value }
                })
              }
            />
          </label>
          <label>
            <span>Industry</span>
            <select
              value={setup.basics.industry}
              onChange={(event) =>
                onChange({
                  ...setup,
                  basics: { ...setup.basics, industry: event.target.value }
                })
              }
            >
              <option value="">Select Industry</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="Retail">Retail</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Travel & Tourism">Travel & Tourism</option>
              <option value="Transportation">Transportation</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Media & Entertainment">Media & Entertainment</option>
              <option value="Gaming">Gaming</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="Automotive">Automotive</option>
              <option value="Insurance">Insurance</option>
              <option value="Government">Government</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Marketing Agency">Marketing Agency</option>
              <option value="Advertising">Advertising</option>
              <option value="Technology">Technology</option>
              <option value="Marketplace">Marketplace</option>
              <option value="Subscription Business">Subscription Business</option>
              <option value="Digital Products">Digital Products</option>
              <option value="Mobile App">Mobile App</option>
              <option value="B2B Services">B2B Services</option>
              <option value="B2C Services">B2C Services</option>
              <option value="Events & Ticketing">Events & Ticketing</option>
              <option value="News & Publishing">News & Publishing</option>
              <option value="Streaming">Streaming</option>
              <option value="Cryptocurrency">Cryptocurrency</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}
