import { useState } from "react";

import type { AdminUser, NewAdminUser, SetupState, UserRole } from "../../types";

const roles: UserRole[] = ["Super Admin", "Admin", "Analyst", "Marketer", "Viewer"];

type InviteUsersStepProps = {
  setup: SetupState;
  onAddUser: (user: NewAdminUser) => Promise<void>;
};

const emptyUser: NewAdminUser = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Viewer"
};

export function InviteUsersStep({ setup, onAddUser }: InviteUsersStepProps) {
  const [user, setUser] = useState<NewAdminUser>(emptyUser);
  const [saving, setSaving] = useState(false);

  async function submitUser() {
    if (!user.firstName || !user.lastName || !user.email) {
      return;
    }

    setSaving(true);
    await onAddUser(user);
    setUser(emptyUser);
    setSaving(false);
  }

  return (
    <div className="setup-content">
      <section className="setup-intro">
        <h1>Dashboard Setup - New users</h1>
        <p>
          Create a new user and select permission to help your team get started on a new project. Once created a
          confirmation email will be sent directly to their inbox.
        </p>
      </section>

      <section className="invite-card">
        <div className="invite-grid">
          <input
            value={user.firstName}
            placeholder="First Name"
            onChange={(event) => setUser({ ...user, firstName: event.target.value })}
          />
          <input
            value={user.lastName}
            placeholder="Last Name"
            onChange={(event) => setUser({ ...user, lastName: event.target.value })}
          />
          <input
            className="span-2"
            value={user.email}
            placeholder="Email Address"
            onChange={(event) => setUser({ ...user, email: event.target.value })}
          />
          <select value={user.role} onChange={(event) => setUser({ ...user, role: event.target.value as UserRole })}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="button" onClick={submitUser} disabled={saving}>
            Create
          </button>
        </div>
      </section>

      <div className="users-toolbar">
        <button type="button">Filter</button>
        <label>
          <span>Search</span>
          <input placeholder="Search for a student by name or email" />
        </label>
      </div>

      <section className="users-table-card">
        <table>
          <thead>
            <tr>
              <th>Users ({setup.users.length})</th>
              <th>ID</th>
              <th>Role</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {setup.users.map((adminUser) => (
              <UserRow key={adminUser.id} user={adminUser} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <tr>
      <td>
        <span className="user-avatar">1</span>
        <span className="user-cell">
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <small>{user.email}</small>
        </span>
      </td>
      <td>{user.id}</td>
      <td>{user.role}</td>
      <td>
        <span className={user.status === "Active" ? "status active" : "status disabled"}>{user.status}</span>
      </td>
      <td>{user.updatedAt}</td>
      <td>
        <button type="button" className="text-button">
          Edit
        </button>
      </td>
    </tr>
  );
}
