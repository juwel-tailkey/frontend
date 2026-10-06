export type ProjectRecord = {
  id: number;
  name: string;
  gcpProjectId: string;
  datasetId: string;
  location: string;
  serviceAccountFilename: string;
  isConnected: boolean;
  selectedReport: string | null;
  connectedAt: string | null;
  goal: GoalEndpoint | null;
  goalType: string;
  isCurrent: boolean;
};

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
};

export type MetricValue = number | string;

export type SankeyNode = {
  id: string;
  label: string;
  group?: string;
  stage?: string;
  color?: string;
  metrics?: Record<string, MetricValue>;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
  ctr?: number;
};

export type SankeyResponse = {
  title: string;
  subtitle: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
};

export type PageviewPoint = {
  date: string;
  pageviews: number;
  uniquePageviews: number;
};

export type PageviewsResponse = {
  title: string;
  summary: {
    pageviews: number;
    uniquePageviews: number;
    averageTimeOnPage: string;
    pageValue: number;
  };
  series: PageviewPoint[];
};

export type CountrySession = {
  country: string;
  code: string;
  sessions: number;
  percentage: number;
};

export type CountrySessionsResponse = {
  title: string;
  totalSessions: number;
  countries: CountrySession[];
};

export type PagePathRow = {
  rank: number;
  path: string;
  pageviews: number;
  pageviewsShare: number;
  uniquePageviews: number;
  uniquePageviewsShare: number;
  averageTimeOnPage: string;
  entrances: number;
  entrancesShare: number;
  exitRate: number;
  pageValue: number;
  sparkline: number[];
};

export type PagePathsResponse = {
  title: string;
  rows: PagePathRow[];
};

export type DashboardData = {
  sankey: SankeyResponse;
  pageviews: PageviewsResponse;
  countries: CountrySessionsResponse;
  pagePaths: PagePathsResponse;
};

export type UserRole = "Super Admin" | "Admin" | "Analyst" | "Marketer" | "Viewer";
export type UserStatus = "Active" | "Disabled";

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  updatedAt: string;
};

export type ProjectDetails = {
  projectName: string;
  industry: string;
  organization: string;
  timezone: string;
  description: string;
  goalType: string;
};

export type GoalEndpoint = {
  id: string;
  path: string;
  type: "Page load" | "Event";
  occurrences: number;
};

export type ActiveProjectSummary = {
  id: number;
  name: string;
  isConnected: boolean;
  goal: GoalEndpoint | null;
  goalType: string;
};

export type ConnectionState = {
  directConnected: boolean;
  gcpProjectId?: string;
  datasetId?: string;
  location?: string;
  serviceAccountFile: string;
  selectedReport: string;
  rawFileName: string;
  rawFileSize: string;
  uploadStatus: "idle" | "uploading" | "uploaded";
};

export type SetupState = {
  currentStep: number;
  completed: boolean;
  basics: {
    organization: string;
    industry: string;
  };
  project: ProjectDetails;
  users: AdminUser[];
  connection: ConnectionState;
  goal: GoalEndpoint | null;
  availableGoals: GoalEndpoint[];
};

export type ProjectUpdate = Partial<ProjectDetails> & {
  basics?: Partial<SetupState["basics"]>;
  currentStep?: number;
};

export type NewAdminUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type EntryPointRankBy = "unique_views" | "sessions" | "cvr_to_goal";

export type EntryPointSource = {
  label: string;
  percentage: number;
};

export type EntryPointRow = {
  rank: number;
  pageName: string;
  uniqueViews: number;
  sessions: number;
  topSources: EntryPointSource[];
  trafficChangePercent: number | null;
  cvrToGoal: number;
};

export type EntryPointsReportResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  priorDateRange: {
    start: string;
    end: string;
  };
  rankBy: EntryPointRankBy;
  rows: EntryPointRow[];
};

export type ExitPointRankBy = "unique_views" | "sessions" | "exit_rate";

export type ExitPointRow = {
  rank: number;
  pageName: string;
  uniqueViews: number;
  sessions: number;
  topSources: EntryPointSource[];
  exitRateChangePercent: number | null;
};

export type ExitPointsReportResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  priorDateRange: {
    start: string;
    end: string;
  };
  rankBy: ExitPointRankBy;
  rows: ExitPointRow[];
};

export type SourceTrafficRankBy = "unique_views" | "sessions" | "bounce_rate" | "engagement_rate";

export type SourceTrafficChannel = {
  label: string;
  sessions: number;
  percentage: number;
};

export type SourceTrafficRow = {
  rank: number;
  source: string;
  medium: string;
  label: string;
  channel: string;
  uniqueViews: number;
  sessions: number;
  bounceRate: number;
  engagementRate: number;
};

export type SourceTrafficReportResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  rankBy: SourceTrafficRankBy;
  totalUsers: number;
  channels: SourceTrafficChannel[];
  rows: SourceTrafficRow[];
};

export type BlockFlowSourceOption = {
  value: string;
  label: string;
  sessions: number;
};

export type BlockFlowNode = {
  id: string;
  page: string;
  column: number;
  order: number;
  uniqueViews: number;
  ctr: number;
  impact: number;
  attributionValue: number;
};

export type BlockFlowEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  ctr: number;
  impact: number;
};

export type BlockFlowResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  sources: BlockFlowSourceOption[];
  nodes: BlockFlowNode[];
  edges: BlockFlowEdge[];
};

export type ConvertingPathNodeType = "entry" | "touchpoint" | "goal";

export type ConvertingPathNode = {
  label: string;
  type: ConvertingPathNodeType;
};

export type ConvertingPathRow = {
  rank: number;
  conversions: number;
  nodes: ConvertingPathNode[];
};

export type ConvertingPathsReportResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  rows: ConvertingPathRow[];
};

export type PageImpactLevel = "high" | "medium" | "low";

export type PageImpactRow = {
  rank: number;
  pageName: string;
  removalEffect: number;
  attributionValue: number;
  impact: PageImpactLevel;
  uniqueViews: number;
  impactChangePercent: number | null;
};

export type PageImpactReportResponse = {
  title: string;
  goal: {
    path: string;
    type: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  priorDateRange: {
    start: string;
    end: string;
  };
  rows: PageImpactRow[];
};

export type SegmentStatus = "active" | "draft";

export type SegmentConditionOperator = ">" | ">=" | "<" | "<=" | "=" | "!=";

export type SegmentConditionAttribute = "sessions" | "device_type" | "country" | "city";

export type SegmentCondition = {
  attribute: SegmentConditionAttribute;
  operator: SegmentConditionOperator;
  value: string | number;
};

export type SegmentRecord = {
  id: number;
  name: string;
  color: string;
  status: SegmentStatus;
  conditions: SegmentCondition[];
  createdAt: string | null;
};

export type SegmentInput = {
  name: string;
  color: string;
  status: SegmentStatus;
  conditions: SegmentCondition[];
};
