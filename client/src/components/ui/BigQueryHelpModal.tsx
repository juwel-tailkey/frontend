type BigQueryHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function BigQueryHelpModal({ isOpen, onClose }: BigQueryHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to Connect Google BigQuery</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body help-modal-body">
          <p className="help-intro">
            To connect Google Cloud Platform BigQuery with Tailkey Analytics, you usually need these 4 things:
          </p>

          <div className="help-items-list">
            <div className="help-item">
              <strong>Project ID</strong>
            </div>
            <div className="help-item">
              <strong>Dataset ID</strong>
            </div>
            <div className="help-item">
              <strong>Location</strong>
            </div>
            <div className="help-item">
              <strong>Service Account JSON key file</strong>
            </div>
          </div>

          <p className="help-section-intro">Here's how to find each one.</p>

          {/* Section 1 */}
          <div className="help-section">
            <h3>1. Find GCP Project ID</h3>

            <p>Go to: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="help-link">Google Cloud Console</a></p>

            <p>At the top navbar, you'll see the current project selector.</p>

            <div className="help-example">
              <strong>Example:</strong>
              <div className="help-example-content">
                <div>Project Name: <code>ecommerce-analytics</code></div>
                <div>Project ID: <code>ecommerce-analytics-445566</code></div>
              </div>
              <div className="help-example-result">
                You need: <code>ecommerce-analytics-445566</code>
              </div>
              <p>That is the Project ID.</p>
            </div>

            <p>You can also find it here:</p>
            <div className="help-path">
              Dashboard → IAM & Admin → Project Settings
            </div>
          </div>

          {/* Section 2 */}
          <div className="help-section">
            <h3>2. Find BigQuery Dataset ID</h3>

            <p>Open: <a href="https://console.cloud.google.com/bigquery" target="_blank" rel="noopener noreferrer" className="help-link">BigQuery Console</a></p>

            <p>In the left sidebar:</p>

            <div className="help-tree">
              <div>Project</div>
              <div className="help-tree-indent">└── Dataset</div>
              <div className="help-tree-indent-double">└── Tables</div>
            </div>

            <div className="help-example">
              <strong>Example:</strong>
              <div className="help-example-content">
                <div><code>ecommerce-analytics-445566</code></div>
                <div className="help-tree-indent">└── <code>sales_reporting</code></div>
                <div className="help-tree-indent-double">└── <code>bookings</code></div>
              </div>
              <div className="help-example-result">
                <div>Project ID = <code>ecommerce-analytics-445566</code></div>
                <div>Dataset ID = <code>sales_reporting</code></div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="help-section">
            <h3>3. Find BigQuery Location</h3>

            <p>Click the dataset name.</p>

            <p>You'll see details like:</p>

            <div className="help-example">
              <div className="help-example-content">
                <div>Data location: <code>US</code></div>
              </div>
              <div className="help-example-content">
                <div>or</div>
                <div><code>asia-southeast1</code></div>
              </div>
            </div>

            <p><strong>Common locations:</strong></p>
            <div className="help-list">
              <div>• <code>US</code></div>
              <div>• <code>EU</code></div>
              <div>• <code>asia-southeast1</code></div>
              <div>• <code>asia-south1</code></div>
            </div>

            <p className="help-note">You must use the same location in queries/jobs.</p>
          </div>

          {/* Section 4 */}
          <div className="help-section">
            <h3>4. Create & Download JSON Key File</h3>

            <p>You need a Service Account.</p>

            <p>Go to: <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="help-link">Google Cloud IAM Service Accounts</a></p>

            <div className="help-steps">
              <h4>Steps</h4>

              <div className="help-step">
                <div className="help-step-number">1</div>
                <div className="help-step-content">
                  <strong>Create service account</strong>
                  <p>Click: <span className="help-action">Create Service Account</span></p>
                  <p>Example name: <code>tailkey-analytics-bigquery</code></p>
                </div>
              </div>

              <div className="help-step">
                <div className="help-step-number">2</div>
                <div className="help-step-content">
                  <strong>Give permissions</strong>
                  <p>Add role:</p>
                  <div className="help-list">
                    <div>• <code>BigQuery Admin</code></div>
                    <div>or safer production roles:</div>
                    <div>• <code>BigQuery Data Viewer</code></div>
                    <div>• <code>BigQuery Job User</code></div>
                  </div>
                </div>
              </div>

              <div className="help-step">
                <div className="help-step-number">3</div>
                <div className="help-step-content">
                  <strong>Create JSON key</strong>
                  <p>After service account creation:</p>
                  <div className="help-path">
                    Service Account → Keys → Add Key → Create New Key → JSON
                  </div>
                  <p>It downloads a JSON file like:</p>
                  <div className="help-example-result">
                    <code>tailkey-analytics-bigquery-98ab12.json</code>
                  </div>
                  <p className="help-warning">Store it safely.</p>
                  {/* <p>Example Tailkey Analytics path:</p>
                  <div className="help-example-result">
                    <code>storage/app/google/bigquery.json</code>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-button" onClick={onClose}>
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
