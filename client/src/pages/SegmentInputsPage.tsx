import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createSegment, deleteSegment, fetchSegments, updateSegment } from "../api/segments";
import { useActiveProject } from "../context/ActiveProjectContext";
import {
  OPERATOR_LABELS,
  SEGMENT_ATTRIBUTES,
  SEGMENT_COLORS,
  getAttributeDef
} from "../constants/segmentAttributes";
import type {
  SegmentCondition,
  SegmentConditionAttribute,
  SegmentConditionOperator,
  SegmentRecord,
  SegmentStatus
} from "../types";

type DraftCondition = {
  attribute: SegmentConditionAttribute;
  operator: SegmentConditionOperator;
  value: string;
};

function newCondition(attribute: SegmentConditionAttribute = "sessions"): DraftCondition {
  const def = getAttributeDef(attribute);
  return {
    attribute,
    operator: def.operators[0],
    value: def.valueType === "select" ? def.options?.[0]?.value ?? "" : ""
  };
}

function conditionsFromRecord(record: SegmentRecord): DraftCondition[] {
  if (!record.conditions.length) {
    return [newCondition()];
  }
  return record.conditions.map((condition) => ({
    attribute: condition.attribute,
    operator: condition.operator,
    value: String(condition.value)
  }));
}

function summarizeConditions(conditions: SegmentCondition[]): string {
  if (!conditions.length) {
    return "No conditions";
  }
  return conditions
    .map((condition) => {
      const def = getAttributeDef(condition.attribute);
      const valueLabel =
        def.valueType === "select"
          ? def.options?.find((option) => option.value === String(condition.value))?.label ?? condition.value
          : condition.value;
      return `${def.label} ${condition.operator} ${valueLabel}`;
    })
    .join(" AND ");
}

export function SegmentInputsPage() {
  const { activeProject, loading: activeProjectLoading } = useActiveProject();

  const [segments, setSegments] = useState<SegmentRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SEGMENT_COLORS[0]);
  const [conditions, setConditions] = useState<DraftCondition[]>([newCondition()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canLoad = !activeProjectLoading && Boolean(activeProject);

  useEffect(() => {
    if (!canLoad) {
      setSegments([]);
      setListLoading(false);
      return;
    }

    let isMounted = true;
    setListLoading(true);
    setListError(null);

    fetchSegments()
      .then((data) => {
        if (isMounted) {
          setSegments(data);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setListError(error instanceof Error ? error.message : "Unable to load segments.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setListLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [canLoad, activeProject?.id]);

  const isEditing = editingId !== null;
  const editorTitle = useMemo(() => (isEditing ? "Edit Segment" : "Segment Name"), [isEditing]);

  function resetEditor() {
    setEditingId(null);
    setName("");
    setColor(SEGMENT_COLORS[0]);
    setConditions([newCondition()]);
    setFormError(null);
  }

  function loadIntoEditor(record: SegmentRecord) {
    setEditingId(record.id);
    setName(record.name);
    setColor(record.color || SEGMENT_COLORS[0]);
    setConditions(conditionsFromRecord(record));
    setFormError(null);
  }

  function updateCondition(index: number, patch: Partial<DraftCondition>) {
    setConditions((prev) =>
      prev.map((condition, position) => {
        if (position !== index) {
          return condition;
        }
        const next = { ...condition, ...patch };
        if (patch.attribute && patch.attribute !== condition.attribute) {
          const def = getAttributeDef(patch.attribute);
          next.operator = def.operators[0];
          next.value = def.valueType === "select" ? def.options?.[0]?.value ?? "" : "";
        }
        return next;
      })
    );
  }

  function addCondition() {
    setConditions((prev) => [...prev, newCondition()]);
  }

  function removeCondition(index: number) {
    setConditions((prev) => (prev.length <= 1 ? prev : prev.filter((_, position) => position !== index)));
  }

  function buildPayloadConditions(): SegmentCondition[] {
    return conditions.map((condition) => {
      const def = getAttributeDef(condition.attribute);
      return {
        attribute: condition.attribute,
        operator: condition.operator,
        value: def.valueType === "number" ? Number(condition.value) : condition.value.trim()
      };
    });
  }

  function validateForm(): string | null {
    if (!name.trim()) {
      return "Enter a segment name.";
    }
    for (const condition of conditions) {
      const def = getAttributeDef(condition.attribute);
      if (def.valueType === "number") {
        if (condition.value.trim() === "" || Number.isNaN(Number(condition.value))) {
          return `${def.label} requires a numeric value.`;
        }
      } else if (condition.value.trim() === "") {
        return `${def.label} requires a value.`;
      }
    }
    return null;
  }

  async function save(status: SegmentStatus) {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      name: name.trim(),
      color,
      status,
      conditions: buildPayloadConditions()
    };

    setSaving(true);
    setFormError(null);

    try {
      if (isEditing && editingId !== null) {
        await updateSegment(editingId, payload);
      } else {
        await createSegment(payload);
      }
      const refreshed = await fetchSegments();
      setSegments(refreshed);
      resetEditor();
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : "Unable to save segment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate(record: SegmentRecord) {
    setSaving(true);
    setListError(null);
    try {
      await createSegment({
        name: `${record.name} (copy)`,
        color: record.color || SEGMENT_COLORS[0],
        status: "draft",
        conditions: record.conditions
      });
      const refreshed = await fetchSegments();
      setSegments(refreshed);
    } catch (error: unknown) {
      setListError(error instanceof Error ? error.message : "Unable to duplicate segment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record: SegmentRecord) {
    if (!window.confirm(`Delete segment "${record.name}"?`)) {
      return;
    }
    setListError(null);
    try {
      await deleteSegment(record.id);
      setSegments((prev) => prev.filter((segment) => segment.id !== record.id));
      if (editingId === record.id) {
        resetEditor();
      }
    } catch (error: unknown) {
      setListError(error instanceof Error ? error.message : "Unable to delete segment.");
    }
  }

  if (activeProjectLoading) {
    return (
      <section className="state-card dashboard-state">
        <h1>Loading segments</h1>
        <p>Fetching data for the current project…</p>
      </section>
    );
  }

  if (!activeProject) {
    return (
      <section className="state-card dashboard-state">
        <h1>No project selected</h1>
        <p>Create or select a project to define audience segments.</p>
        <Link className="primary-button" to="/dashboard/projects">
          Go to projects
        </Link>
      </section>
    );
  }

  return (
    <main className="dashboard-page segment-page">
      <header className="dashboard-page-header">
        <div>
          <h1>Segment Inputs</h1>
          <p className="attribution-report-description">
            Define audience segments to compare how the attribution model performs across different user groups.
            Segments apply across all attribution views and reports.
          </p>
        </div>
      </header>

      <section className="card segment-editor">
        <div className="segment-editor-head">
          <span className="segment-color-dot" style={{ background: color }} />
          <input
            className="segment-name-input"
            value={name}
            placeholder={editorTitle}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="segment-color-picker" role="group" aria-label="Segment color">
            {SEGMENT_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                className={option === color ? "segment-color-swatch active" : "segment-color-swatch"}
                style={{ background: option }}
                aria-label={`Use color ${option}`}
                onClick={() => setColor(option)}
              />
            ))}
          </div>
        </div>

        <p className="segment-conditions-label">Conditions: Select audience attributes.</p>

        <div className="segment-conditions">
          {conditions.map((condition, index) => {
            const def = getAttributeDef(condition.attribute);
            return (
              <div className="segment-condition-row" key={index}>
                <select
                  value={condition.attribute}
                  onChange={(event) =>
                    updateCondition(index, { attribute: event.target.value as SegmentConditionAttribute })
                  }
                >
                  {SEGMENT_ATTRIBUTES.map((attribute) => (
                    <option key={attribute.value} value={attribute.value}>
                      {attribute.label}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(event) =>
                    updateCondition(index, { operator: event.target.value as SegmentConditionOperator })
                  }
                >
                  {def.operators.map((operator) => (
                    <option key={operator} value={operator}>
                      {operator} ({OPERATOR_LABELS[operator]})
                    </option>
                  ))}
                </select>

                {def.valueType === "select" ? (
                  <select
                    value={condition.value}
                    onChange={(event) => updateCondition(index, { value: event.target.value })}
                  >
                    {def.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={def.valueType === "number" ? "number" : "text"}
                    value={condition.value}
                    placeholder={def.placeholder}
                    onChange={(event) => updateCondition(index, { value: event.target.value })}
                  />
                )}

                <button
                  type="button"
                  className="segment-condition-remove"
                  aria-label="Remove condition"
                  disabled={conditions.length <= 1}
                  onClick={() => removeCondition(index)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <button type="button" className="segment-add-condition" onClick={addCondition}>
          + Add Condition
        </button>

        <p className="segment-estimate-placeholder">Estimated audience size available soon.</p>

        {formError && <p className="setup-error">{formError}</p>}

        <div className="segment-editor-actions">
          <button type="button" className="primary-button" disabled={saving} onClick={() => save("active")}>
            Activate Segment
          </button>
          <button type="button" className="secondary-button" disabled={saving} onClick={() => save("draft")}>
            Save Draft
          </button>
          <button type="button" className="link-button" disabled={saving} onClick={resetEditor}>
            Cancel
          </button>
        </div>
      </section>

      {listError && <p className="setup-error">{listError}</p>}

      {listLoading ? (
        <p>Loading segments…</p>
      ) : (
        <section className="segment-list">
          {segments.map((record) => (
            <article className="card segment-list-row" key={record.id}>
              <button type="button" className="segment-list-main" onClick={() => loadIntoEditor(record)}>
                <span className="segment-color-dot" style={{ background: record.color }} />
                <span className="segment-list-text">
                  <strong>{record.name}</strong>
                  <span className="segment-list-summary">{summarizeConditions(record.conditions)}</span>
                </span>
              </button>
              <span className={`segment-status-badge ${record.status}`}>
                {record.status === "active" ? "Active" : "Draft"}
              </span>
              <div className="segment-list-actions">
                <button
                  type="button"
                  aria-label="Duplicate segment"
                  disabled={saving}
                  onClick={() => handleDuplicate(record)}
                >
                  ⧉
                </button>
                <button type="button" aria-label="Delete segment" onClick={() => handleDelete(record)}>
                  🗑
                </button>
              </div>
            </article>
          ))}

          <button type="button" className="segment-add-new" onClick={resetEditor}>
            + Add New Segment
          </button>
        </section>
      )}
    </main>
  );
}
