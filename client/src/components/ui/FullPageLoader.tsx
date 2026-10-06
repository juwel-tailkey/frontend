import tailkeyLogo from "../../assets/tailkey.jpg";

export function FullPageLoader() {
  return (
    <main className="auth-page">
      <section className="auth-card auth-loading-card">
        <div className="auth-loader-container">
          <div className="auth-brand">
            <img src={tailkeyLogo} alt="Tailkey Logo" className="auth-brand-logo" />
            <span className="auth-brand-name">Tailkey</span>
          </div>

          <div className="auth-spinner-wrapper">
            <div className="auth-spinner"></div>
            <p className="auth-loading-text">Loading your workspace...</p>
            <p className="auth-loading-subtitle">Please wait while we secure your session</p>
          </div>
        </div>
      </section>
    </main>
  );
}
