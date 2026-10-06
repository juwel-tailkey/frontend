import { useMemo, useState } from "react";

import type { BlockFlowEdge, BlockFlowResponse, SegmentRecord } from "../../types";
import { formatNumber, formatPercent } from "../../utils/format";

type BlockViewProps = {
  data: BlockFlowResponse;
  segments: SegmentRecord[];
  segmentId: string;
  onSegmentChange: (value: string) => void;
  sourceChannel: string;
  onSourceChannelChange: (value: string) => void;
};

const CARD_WIDTH = 210;
const COLUMN_GAP = 92;
const LABEL_HEIGHT = 20;
const SUMMARY_ROW_H = 46;
const METRICS_H = 184;
const V_GAP = 26;
const CANVAS_PADDING = 16;

type PositionedNode = {
  id: string;
  page: string;
  column: number;
  uniqueViews: number;
  ctr: number;
  impact: number;
  attributionValue: number;
  x: number;
  y: number;
  isOpen: boolean;
};

type Link = {
  id: string;
  path: string;
  color: string;
  width: number;
};

function interpolateBlue(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const from = { r: 0xcf, g: 0xe0, b: 0xfb };
  const to = { r: 0x0b, g: 0x3d, b: 0x91 };
  const r = Math.round(from.r + (to.r - from.r) * clamped);
  const g = Math.round(from.g + (to.g - from.g) * clamped);
  const b = Math.round(from.b + (to.b - from.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

function shortLabel(path: string): string {
  if (!path) {
    return "Not set";
  }
  const trimmed = path.replace(/\/$/, "");
  const segment = trimmed.split("/").filter(Boolean).pop();
  return segment ? segment : path;
}

export function BlockView({
  data,
  segments,
  segmentId,
  onSegmentChange,
  sourceChannel,
  onSourceChannelChange
}: BlockViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const layout = useMemo(() => {
    const columnRunningY = new Map<number, number>();
    const positioned = new Map<string, PositionedNode>();

    const sorted = [...data.nodes].sort((a, b) => a.column - b.column || a.order - b.order);

    let maxImpact = 0;
    for (const node of data.nodes) {
      maxImpact = Math.max(maxImpact, node.impact);
    }
    for (const edge of data.edges) {
      maxImpact = Math.max(maxImpact, edge.impact);
    }
    const impactDivisor = maxImpact > 0 ? maxImpact : 1;

    for (const node of sorted) {
      const isOpen = expanded.has(node.id);
      const cardHeight = SUMMARY_ROW_H + (isOpen ? METRICS_H : 0);
      const blockHeight = LABEL_HEIGHT + cardHeight;

      const runningY = columnRunningY.get(node.column) ?? CANVAS_PADDING;
      const x = CANVAS_PADDING + node.column * (CARD_WIDTH + COLUMN_GAP);

      positioned.set(node.id, {
        id: node.id,
        page: node.page,
        column: node.column,
        uniqueViews: Number.isFinite(node.uniqueViews) ? node.uniqueViews : 0,
        ctr: Number.isFinite(node.ctr) ? node.ctr : 0,
        impact: Number.isFinite(node.impact) ? node.impact : 0,
        attributionValue: Number.isFinite(node.attributionValue) ? node.attributionValue : 0,
        x,
        y: runningY,
        isOpen
      });

      columnRunningY.set(node.column, runningY + blockHeight + V_GAP);
    }

    const links: Link[] = [];
    for (const edge of data.edges) {
      const source = positioned.get(edge.fromNodeId);
      const target = positioned.get(edge.toNodeId);
      if (!source || !target) {
        continue;
      }

      const sx = source.x + CARD_WIDTH;
      const sy = source.y + LABEL_HEIGHT + SUMMARY_ROW_H / 2;
      const tx = target.x;
      const ty = target.y + LABEL_HEIGHT + SUMMARY_ROW_H / 2;
      const midX = sx + (tx - sx) / 2;

      links.push({
        id: edge.id,
        path: `M ${sx},${sy} C ${midX},${sy} ${midX},${ty} ${tx},${ty}`,
        color: interpolateBlue(edge.impact / impactDivisor),
        width: 2 + Math.min(6, edge.ctr * 6)
      });
    }

    let width = CANVAS_PADDING * 2;
    let height = CANVAS_PADDING * 2;
    for (const node of positioned.values()) {
      const cardHeight = SUMMARY_ROW_H + (node.isOpen ? METRICS_H : 0);
      width = Math.max(width, node.x + CARD_WIDTH + CANVAS_PADDING);
      height = Math.max(height, node.y + LABEL_HEIGHT + cardHeight + CANVAS_PADDING);
    }

    return { nodes: [...positioned.values()], links, width, height, impactDivisor };
  }, [data, expanded]);

  return (
    <section className="card block-view-card">
      <div className="block-view-filters">
        <label className="block-view-filter">
          <span>Goal Set</span>
          <span className="block-view-filter-value">{data.goal.path}</span>
        </label>
        <label className="block-view-filter">
          <span>Source Channel</span>
          <select value={sourceChannel} onChange={(event) => onSourceChannelChange(event.target.value)}>
            <option value="">All</option>
            {data.sources.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block-view-filter">
          <span>View</span>
          <span className="block-view-filter-value">Block View</span>
        </label>
        <label className="block-view-filter">
          <span>Segment</span>
          <select value={segmentId} onChange={(event) => onSegmentChange(event.target.value)}>
            <option value="">All</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block-view-filter">
          <span>Data Filter</span>
          <span className="block-view-filter-value">User Count</span>
        </label>
      </div>

      {layout.nodes.length === 0 ? (
        <p className="block-view-empty">No page flow data found for the selected date range.</p>
      ) : (
        <div className="block-view-body">
          <div className="block-view-scroll">
            <div className="block-view-canvas" style={{ width: layout.width, height: layout.height }}>
              <svg className="block-view-links" width={layout.width} height={layout.height}>
                {layout.links.map((link) => (
                  <path
                    key={link.id}
                    d={link.path}
                    stroke={link.color}
                    strokeWidth={link.width}
                    fill="none"
                    opacity={0.85}
                  />
                ))}
              </svg>

              {layout.nodes.map((node) => (
                <div
                  key={node.id}
                  className="block-node"
                  style={{ left: node.x, top: node.y, width: CARD_WIDTH }}
                >
                  <div className="block-node-title" title={node.page}>
                    {node.page}
                  </div>
                  <div className={`block-card${node.isOpen ? " is-open" : ""}`}>
                    <span
                      className="block-diamond"
                      style={{ background: interpolateBlue(node.impact / layout.impactDivisor) }}
                      title={`ATB-Impact ${node.impact.toFixed(2)}`}
                    />
                    <button
                      type="button"
                      className="block-card-summary"
                      onClick={() => toggle(node.id)}
                      aria-expanded={node.isOpen}
                    >
                      <span className="block-card-label" title={node.page}>
                        {shortLabel(node.page)}
                      </span>
                      <span className="block-card-ctr">
                        <em>CTR</em> {formatPercent(node.ctr * 100)}
                      </span>
                      <span className={`block-card-chevron${node.isOpen ? " is-open" : ""}`}>⌄</span>
                    </button>

                    {node.isOpen ? (
                      <div className="block-card-metrics">
                        <div className="block-card-metric">
                          <span className="block-card-metric-key">Users</span>
                          <span className="block-card-metric-value">{formatNumber(node.uniqueViews)}</span>
                        </div>
                        <div className="block-card-metric is-highlight">
                          <span className="block-card-metric-key">CTR</span>
                          <span className="block-card-metric-value">{formatPercent(node.ctr * 100)}</span>
                        </div>
                        <div className="block-card-metric">
                          <span className="block-card-metric-key">RMV-Val</span>
                          <span className="block-card-metric-value">{node.impact.toFixed(2)}</span>
                        </div>
                        <div className="block-card-metric">
                          <span className="block-card-metric-key">ATB-Val</span>
                          <span className="block-card-metric-value">{node.attributionValue.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="block-impact-legend">
            <span className="block-impact-legend-title">ATB-Impact Scale</span>
            <div className="block-impact-legend-body">
              <div className="block-impact-legend-bar" />
              <div className="block-impact-legend-ticks">
                <span>1.0</span>
                <span>0.8</span>
                <span>0.6</span>
                <span>0.4</span>
                <span>0.2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
