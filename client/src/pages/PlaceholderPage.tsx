import { useLocation } from "react-router-dom";

export function PlaceholderPage() {
  const location = useLocation();
  const title = location.pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ");

  return (
    <main className="placeholder-page">
      <section className="card placeholder-card">
        <p className="eyebrow">Coming Soon</p>
        <h1>{title || "Page"}</h1>
        <p></p>
      </section>
    </main>
  );
}
