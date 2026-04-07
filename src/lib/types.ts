export interface FilterParams {
  dateFrom: string;
  dateTo: string;
  category: string[];
  priority: string[];
  status: string[];
  assignee: string[];
  search: string;
  page: number;
  limit: number;
  openOnly: boolean;
}

export interface TicketRecord {
  trackingId: string;
  ticketNumber: number | null;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
  requesterName: string | null;
  requesterEmail: string | null;
  category: string | null;
  priority: string | null;
  status: string | null;
  subject: string | null;
  body: string | null;
  assignee: string | null;
  totalReplies: number;
  staffReplies: number;
  timeTrackedSeconds: number;
  dueDate: string | null;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  room: string | null;
  program: string | null;
  requestType: string | null;
  academy: string | null;
  ticketUrl: string | null;
  resolutionTimeHours: number | null;
  batchId: string;
}

export type ImportedTicket = Omit<TicketRecord, "batchId">;

export interface ParsedBatchData {
  ticketCount: number;
  periodStart: string;
  periodEnd: string;
  tickets: ImportedTicket[];
}

export interface BatchRecord {
  id: string;
  filename: string;
  uploadedAt: string;
  periodStart: string;
  periodEnd: string;
  ticketCount: number;
  duplicatesUpdated: number;
}

export interface TicketListResult {
  tickets: TicketRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface AgentMetric {
  assignee: string;
  count: number;
  resolved: number;
  open: number;
  avgResolutionHours: number | null;
  staffReplies: number;
  timeTrackedMinutes: number;
}

export interface DailyVolumeItem {
  date: string;
  count: number;
}

export type Severity = "low" | "medium" | "high";

export interface DataQualityRule {
  id: string;
  title: string;
  affectedCount: number;
  severity: Severity;
  scoreImpact: number;
  description: string;
}

export interface FieldCompletenessItem {
  field: string;
  fillRate: number;
  status: "good" | "fair" | "poor";
}

export interface MetricDeltaSet {
  totalTickets: number | null;
  resolutionRate: number | null;
  avgResolutionHours: number | null;
  openTickets: number | null;
  unassigned: number | null;
}

export interface MetricsPayload {
  totalTickets: number;
  resolutionRate: number;
  avgResolutionHours: number;
  openTickets: number;
  unassigned: number;
  byCategory: Array<{ category: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byAgent: AgentMetric[];
  dailyVolume: DailyVolumeItem[];
  dataQualityScore: number;
  dataQualityRules: DataQualityRule[];
  fieldCompleteness: FieldCompletenessItem[];
  narrative: string;
  deltas: MetricDeltaSet;
}

export interface FilterOptions {
  categories: string[];
  priorities: string[];
  statuses: string[];
  assignees: string[];
}

export interface UploadResult {
  batchId: string;
  ticketCount: number;
  periodStart: string;
  periodEnd: string;
  duplicatesUpdated: number;
}
