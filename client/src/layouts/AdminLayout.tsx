import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { ProjectSwitcher } from "../components/ProjectSwitcher";
import { useActiveProject } from "../context/ActiveProjectContext";
import { useAuth } from "../context/AuthContext";
import tailkeyLogo from "../assets/tailkey.jpg";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: "grid" },
  // { label: "Audience Flow Report", to: "/dashboard/audience-flow-report", icon: "bars" },
  // { label: "Page level attribution", to: "/dashboard/page-level-attribution", icon: "bars" },
  { label: "Performance data", to: "/dashboard/performance", icon: "bars" }
];

const dataNavigation = [{ label: "Segment inputs", to: "/dashboard/segment-inputs", icon: "bars" }];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { activeProject, loading: activeProjectLoading } = useActiveProject();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <div className="brand-mark" aria-label="Tailkey">
          <img src={tailkeyLogo} alt="Tailkey Logo" className="brand-logo" />
          <span className="brand-name">Tailkey</span>
        </div>

        <ProjectSwitcher />

        <label className="search-box">
          <span>Search</span>
          <input aria-label="Search" />
        </label>

        <SidebarSection items={navigation} />
        <SidebarSection title="Data" items={dataNavigation} />

        <div className="premium-card">
          <strong>Get more with Premium</strong>
          <p>There are 6 days left in your trial. Upgrade for unlimited access.</p>
          <button type="button">Upgrade</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <p className="topbar-current-project">
            {activeProjectLoading ? (
              "Loading current project…"
            ) : activeProject ? (
              <>
                Current project: <strong>{activeProject.name}</strong>
              </>
            ) : (
              <>
                No project selected. <a href="/dashboard/projects">Create one</a>
              </>
            )}
          </p>
          <nav aria-label="Top navigation">
            <a href="/dashboard">Home</a>
            {/* <a href="/dashboard/users">Admin</a> */}
            <a href="/dashboard/support">Support</a>
            {user && <span className="topbar-user">{user.name}</span>}
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  items
}: {
  title?: string;
  items: Array<{ label: string; to: string; icon?: string; badge?: string }>;
}) {
  return (
    <section className="sidebar-section">
      {title && <h2>{title}</h2>}
      {items.map((item) => (
        <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
          <span className={item.icon === "grid" ? "nav-icon grid" : "nav-icon bars"} />
          <span>{item.label}</span>
          {item.badge && <em>{item.badge}</em>}
        </NavLink>
      ))}
    </section>
  );
}
