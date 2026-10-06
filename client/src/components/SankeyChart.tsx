import { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyGraph,
  type SankeyLink as D3SankeyLink,
  type SankeyNode as D3SankeyNode
} from "d3-sankey";

import type {
  SankeyLink as AppSankeyLink,
  SankeyNode as AppSankeyNode,
  SankeyResponse
} from "../types";
import { formatCompact, formatNumber } from "../utils/format";

type LayoutNode = D3SankeyNode<AppSankeyNode, AppSankeyLink>;
type LayoutLink = D3SankeyLink<AppSankeyNode, AppSankeyLink>;

const width = 1220;
const height = 560;
const cardWidth = 132;
const cardHeight = 64;

type SankeyChartProps = {
  data: SankeyResponse;
};

export function SankeyChart({ data }: SankeyChartProps) {
  const [activeLink, setActiveLink] = useState<LayoutLink | null>(null);
  const path = sankeyLinkHorizontal<AppSankeyNode, AppSankeyLink>();

  const graph = useMemo<SankeyGraph<AppSankeyNode, AppSankeyLink>>(() => {
    const layout = sankey<AppSankeyNode, AppSankeyLink>()
      .nodeId((node) => node.id)
      .nodeWidth(18)
      .nodePadding(22)
      .extent([
        [76, 34],
        [width - 76, height - 46]
      ]);

    return layout({
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link }))
    });
  }, [data]);

  const stages = useMemo(() => {
    const stageMap = new Map<string, number>();

    for (const node of graph.nodes) {
      if (node.stage && node.x0 !== undefined && !stageMap.has(node.stage)) {
        stageMap.set(node.stage, node.x0);
      }
    }

    return Array.from(stageMap.entries()).sort((a, b) => a[1] - b[1]);
  }, [graph.nodes]);

  return (
    <div className="sankey-wrap">
      <svg className="sankey-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={data.title}>
        <defs>
          <linearGradient id="sankeyLinkGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#9bdce6" />
            <stop offset="50%" stopColor="#c8d4e3" />
            <stop offset="100%" stopColor="#9fcaf1" />
          </linearGradient>
        </defs>

        {stages.map(([stage, x]) => (
          <text key={stage} className="sankey-stage" x={x + 9} y={18} textAnchor="middle">
            {stage}
          </text>
        ))}

        <g className="sankey-links">
          {graph.links.map((link, index) => {
            const linkPath = path(link);
            const isActive = activeLink === link;

            if (!linkPath) {
              return null;
            }

            return (
              <path
                key={`${getNodeId(link.source)}-${getNodeId(link.target)}-${index}`}
                className={isActive ? "sankey-link sankey-link-active" : "sankey-link"}
                d={linkPath}
                strokeWidth={Math.max(1, link.width ?? 1)}
                onMouseEnter={() => setActiveLink(link)}
                onMouseLeave={() => setActiveLink(null)}
              >
                <title>{`${getNodeLabel(link.source)} to ${getNodeLabel(link.target)}: ${formatNumber(
                  link.value
                )} users${link.ctr ? `, ${link.ctr}% CTR` : ""}`}</title>
              </path>
            );
          })}
        </g>

        <g className="sankey-nodes">
          {graph.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function NodeCard({ node }: { node: LayoutNode }) {
  const x = (node.x0 ?? 0) + ((node.x1 ?? 0) - (node.x0 ?? 0)) / 2 - cardWidth / 2;
  const y = (node.y0 ?? 0) + ((node.y1 ?? 0) - (node.y0 ?? 0)) / 2 - cardHeight / 2;
  const color = node.color || "#d5dae2";
  const users = typeof node.metrics?.users === "number" ? node.metrics.users : (node.value ?? 0);
  const ctr = node.metrics?.ctr;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect className="sankey-node-card" width={cardWidth} height={cardHeight} rx={10} />
      <rect className="sankey-node-strip" width={5} height={cardHeight - 18} x={9} y={9} rx={3} fill={color} />
      <text className="sankey-node-label" x={22} y={22}>
        {node.label}
      </text>
      <text className="sankey-node-metric" x={22} y={42}>
        {formatCompact(users)} users
      </text>
      <text className="sankey-node-ctr" x={cardWidth - 14} y={42} textAnchor="end">
        {ctr || "n/a"}
      </text>
    </g>
  );
}

function getNodeId(node: unknown): string {
  return isLayoutNode(node) ? node.id : String(node);
}

function getNodeLabel(node: unknown): string {
  return isLayoutNode(node) ? node.label : String(node);
}

function isLayoutNode(node: unknown): node is LayoutNode {
  return typeof node === "object" && node !== null && "id" in node;
}
