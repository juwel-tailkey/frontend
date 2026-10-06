import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { CardLoader } from "../ui/CardLoader";
import type { GoalEndpoint } from "../../types";
import { formatNumber } from "../../utils/format";

export function reconcileGoalSelection(
  saved: GoalEndpoint | null,
  goals: GoalEndpoint[]
): GoalEndpoint | null {
  if (!saved) {
    return null;
  }

  return (
    goals.find((goal) => goal.id === saved.id) ??
    goals.find((goal) => goal.path === saved.path && goal.type === saved.type) ??
    saved
  );
}

function isSameGoal(a: GoalEndpoint | null, b: GoalEndpoint): boolean {
  if (!a) {
    return false;
  }

  return a.id === b.id || (a.path === b.path && a.type === b.type);
}

type GoalEndpointModalProps = {
  goals: GoalEndpoint[];
  selectedGoal: GoalEndpoint | null;
  onClose: () => void;
  onSelect: (goal: GoalEndpoint) => void;
  onConfirm?: (goal: GoalEndpoint) => void | Promise<void>;
  confirmLabel?: string;
  saving?: boolean;
  loading?: boolean;
  error?: string | null;
};

export function GoalEndpointModal({
  goals,
  selectedGoal,
  onClose,
  onSelect,
  onConfirm,
  confirmLabel = "Confirm Goal",
  saving = false,
  loading = false,
  error = null
}: GoalEndpointModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return goals;
    }

    return goals.filter(
      (goal) =>
        goal.path.toLowerCase().includes(query) ||
        goal.type.toLowerCase().includes(query)
    );
  }, [goals, search]);

  async function handleConfirm() {
    if (!selectedGoal) {
      return;
    }

    if (onConfirm) {
      await onConfirm(selectedGoal);
      onClose();
    } else {
      onClose();
    }
  }

  const modal = (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="goal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close goal selection">
          x
        </button>
        <h1 id="goal-modal-title">Select a goal end point</h1>
        <p>
          Choose the page or event that defines a conversion for this project. Tailkey will use this as the end point
          when building your attribution model. <a href="/dashboard/support">Learn more.</a>
        </p>

        {error && <p className="goal-modal-error">{error}</p>}

        <div className="modal-toolbar">
          <label>
            <span>Search</span>
            <input
              placeholder="Search by Page or Event"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="goal-modal-table-wrap">
          <table>
            <thead>
              <tr>
                <th />
                <th>Pages & Events</th>
                <th>Type</th>
                <th>Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <CardLoader
                      message="Loading goals"
                      subtitle="Fetching from BigQuery…"
                    />
                  </td>
                </tr>
              ) : filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {goals.length === 0
                      ? "No goals found for this project."
                      : "No goals match your search."}
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => (
                  <tr key={goal.id} className={isSameGoal(selectedGoal, goal) ? "selected" : undefined}>
                    <td>
                      <button
                        type="button"
                        className={isSameGoal(selectedGoal, goal) ? "radio selected" : "radio"}
                        onClick={() => onSelect(goal)}
                        aria-label={`Select ${goal.path}`}
                      />
                    </td>
                    <td>{goal.path}</td>
                    <td>
                      <span className={goal.type === "Event" ? "type-pill event" : "type-pill"}>{goal.type}</span>
                    </td>
                    <td>{formatNumber(goal.occurrences)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="modal-footer">
          <span>
            Goal: <strong>{selectedGoal ? selectedGoal.path : "None selected"}</strong>
          </span>
          <span>
            Goal Set: <strong>Conversion events</strong>
          </span>
          <button type="button" onClick={() => void handleConfirm()} disabled={!selectedGoal || saving || loading}>
            {saving ? "Saving…" : confirmLabel}
          </button>
          <small>
            {loading
              ? "Loading…"
              : `Showing ${filteredGoals.length} of ${goals.length} goal${goals.length === 1 ? "" : "s"}`}
          </small>
        </footer>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
