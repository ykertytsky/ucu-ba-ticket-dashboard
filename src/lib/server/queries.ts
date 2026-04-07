import { randomUUID } from "node:crypto";

import type { Database as BetterSqliteDatabase } from "better-sqlite3";

import { sqlite } from "@/db";
import {
  buildDataQuality,
  buildNarrative,
  calculateDelta,
  emptyDeltas,
  RESOLVED_STATUS,
} from "@/lib/analytics/metrics";
import type {
  AgentMetric,
  BatchRecord,
  FieldCompletenessItem,
  FilterOptions,
  FilterParams,
  ImportedTicket,
  MetricsPayload,
  TicketListResult,
  TicketRecord,
  UploadResult,
} from "@/lib/types";

type SqlParams = Array<string | number>;

const ticketSelect = `
  tracking_id AS trackingId,
  ticket_number AS ticketNumber,
  created_at AS createdAt,
  updated_at AS updatedAt,
  resolved_at AS resolvedAt,
  requester_name AS requesterName,
  requester_email AS requesterEmail,
  category,
  priority,
  status,
  subject,
  body,
  assignee,
  total_replies AS totalReplies,
  staff_replies AS staffReplies,
  time_tracked_seconds AS timeTrackedSeconds,
  due_date AS dueDate,
  event_date AS eventDate,
  event_time AS eventTime,
  location,
  room,
  program,
  request_type AS requestType,
  academy,
  ticket_url AS ticketUrl,
  resolution_time_hours AS resolutionTimeHours,
  batch_id AS batchId
`;

function escapeLike(value: string) {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function buildWhereClause(filters: FilterParams, tableAlias = "tickets") {
  const conditions: string[] = [];
  const params: SqlParams = [];

  if (filters.dateFrom) {
    conditions.push(`${tableAlias}.created_at >= ?`);
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    conditions.push(`${tableAlias}.created_at <= ?`);
    params.push(`${filters.dateTo}T23:59:59.999`);
  }

  const multiValueFilters = [
    ["category", filters.category],
    ["priority", filters.priority],
    ["status", filters.status],
    ["assignee", filters.assignee],
  ] as const;

  for (const [column, values] of multiValueFilters) {
    if (values.length === 0) {
      continue;
    }

    const placeholders = values.map(() => "?").join(", ");
    conditions.push(`${tableAlias}.${column} IN (${placeholders})`);
    params.push(...values);
  }

  if (filters.openOnly) {
    conditions.push(`(${tableAlias}.status IS NULL OR ${tableAlias}.status != ?)`);
    params.push(RESOLVED_STATUS);
  }

  if (filters.search) {
    const searchTerm = `%${escapeLike(filters.search)}%`;
    conditions.push(
      `(
        ${tableAlias}.tracking_id LIKE ? ESCAPE '\\' COLLATE NOCASE OR
        ${tableAlias}.subject LIKE ? ESCAPE '\\' COLLATE NOCASE OR
        ${tableAlias}.body LIKE ? ESCAPE '\\' COLLATE NOCASE
      )`,
    );
    params.push(searchTerm, searchTerm, searchTerm);
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

function queryAll<T>(database: BetterSqliteDatabase, statement: string, params: SqlParams = []) {
  return database.prepare(statement).all(...params) as T[];
}

function queryGet<T>(database: BetterSqliteDatabase, statement: string, params: SqlParams = []) {
  return database.prepare(statement).get(...params) as T | undefined;
}

function toFieldStatus(fillRate: number): FieldCompletenessItem["status"] {
  if (fillRate >= 0.85) {
    return "good";
  }

  if (fillRate >= 0.5) {
    return "fair";
  }

  return "poor";
}

function getMetricSnapshot(filters: FilterParams) {
  const { clause, params } = buildWhereClause(filters);
  const totalTickets =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}`,
      params,
    )?.count ?? 0;

  const resolvedCount =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} resolved_at IS NOT NULL`,
      params,
    )?.count ?? 0;

  const avgResolutionHours =
    queryGet<{ value: number | null }>(
      sqlite,
      `
        SELECT AVG(resolution_time_hours) AS value
        FROM tickets
        ${clause}${clause ? " AND" : " WHERE"}
          resolution_time_hours IS NOT NULL
          AND resolution_time_hours >= 0
          AND resolution_time_hours <= 720
      `,
      params,
    )?.value ?? 0;

  const openTickets =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} (status IS NULL OR status != ?)`,
      [...params, RESOLVED_STATUS],
    )?.count ?? 0;

  const unassigned =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} (assignee IS NULL OR TRIM(assignee) = '')`,
      params,
    )?.count ?? 0;

  const byCategory = queryAll<{ category: string | null; count: number }>(
    sqlite,
    `
      SELECT COALESCE(category, 'Без категорії') AS category, COUNT(*) AS count
      FROM tickets
      ${clause}
      GROUP BY COALESCE(category, 'Без категорії')
      ORDER BY count DESC, category ASC
    `,
    params,
  ).map((item) => ({ category: item.category ?? "Без категорії", count: item.count }));

  const byStatus = queryAll<{ status: string | null; count: number }>(
    sqlite,
    `
      SELECT COALESCE(status, 'Без статусу') AS status, COUNT(*) AS count
      FROM tickets
      ${clause}
      GROUP BY COALESCE(status, 'Без статусу')
      ORDER BY count DESC, status ASC
    `,
    params,
  ).map((item) => ({ status: item.status ?? "Без статусу", count: item.count }));

  const byPriority = queryAll<{ priority: string | null; count: number }>(
    sqlite,
    `
      SELECT COALESCE(priority, 'Без пріоритету') AS priority, COUNT(*) AS count
      FROM tickets
      ${clause}
      GROUP BY COALESCE(priority, 'Без пріоритету')
      ORDER BY count DESC, priority ASC
    `,
    params,
  ).map((item) => ({ priority: item.priority ?? "Без пріоритету", count: item.count }));

  const byAgent = queryAll<AgentMetric>(
    sqlite,
    `
      SELECT
        COALESCE(NULLIF(TRIM(assignee), ''), 'Без виконавця') AS assignee,
        COUNT(*) AS count,
        SUM(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status IS NULL OR status != ? THEN 1 ELSE 0 END) AS open,
        AVG(CASE WHEN resolution_time_hours >= 0 AND resolution_time_hours <= 720 THEN resolution_time_hours END) AS avgResolutionHours,
        SUM(staff_replies) AS staffReplies,
        SUM(CASE WHEN time_tracked_seconds > 0 THEN time_tracked_seconds ELSE 0 END) / 60.0 AS timeTrackedMinutes
      FROM tickets
      ${clause}
      GROUP BY COALESCE(NULLIF(TRIM(assignee), ''), 'Без виконавця')
      ORDER BY count DESC, assignee ASC
    `,
    [RESOLVED_STATUS, ...params],
  ).map((row) => ({
    ...row,
    avgResolutionHours:
      row.avgResolutionHours === null ? null : Number(row.avgResolutionHours.toFixed(1)),
    timeTrackedMinutes: Number((row.timeTrackedMinutes ?? 0).toFixed(1)),
  }));

  const dailyVolume = queryAll<{ date: string; count: number }>(
    sqlite,
    `
      SELECT SUBSTR(created_at, 1, 10) AS date, COUNT(*) AS count
      FROM tickets
      ${clause}
      GROUP BY SUBSTR(created_at, 1, 10)
      ORDER BY date ASC
    `,
    params,
  );

  return {
    totalTickets,
    resolutionRate: totalTickets > 0 ? Number(((resolvedCount / totalTickets) * 100).toFixed(1)) : 0,
    avgResolutionHours: Number((avgResolutionHours ?? 0).toFixed(1)),
    openTickets,
    unassigned,
    byCategory,
    byStatus,
    byPriority,
    byAgent,
    dailyVolume,
  };
}

function getFieldCompleteness(filters: FilterParams) {
  const { clause, params } = buildWhereClause(filters);
  const total =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}`,
      params,
    )?.count ?? 0;

  if (total === 0) {
    return [];
  }

  const fields: Array<{ label: string; condition: string }> = [
    { label: "Категорія", condition: "category IS NOT NULL AND TRIM(category) != ''" },
    { label: "Пріоритет", condition: "priority IS NOT NULL AND TRIM(priority) != ''" },
    { label: "Статус", condition: "status IS NOT NULL AND TRIM(status) != ''" },
    { label: "Виконавець", condition: "assignee IS NOT NULL AND TRIM(assignee) != ''" },
    { label: "Email", condition: "requester_email IS NOT NULL AND TRIM(requester_email) != ''" },
    { label: "Програма/система", condition: "program IS NOT NULL AND TRIM(program) != ''" },
    { label: "Тип звернення", condition: "request_type IS NOT NULL AND TRIM(request_type) != ''" },
    { label: "Академія", condition: "academy IS NOT NULL AND TRIM(academy) != ''" },
    { label: "Термін виконання", condition: "due_date IS NOT NULL AND TRIM(due_date) != ''" },
    { label: "Дата події", condition: "event_date IS NOT NULL AND TRIM(event_date) != ''" },
    { label: "Локація", condition: "location IS NOT NULL AND TRIM(location) != ''" },
    { label: "Кімната", condition: "room IS NOT NULL AND TRIM(room) != ''" },
    { label: "Відстеження часу", condition: "time_tracked_seconds > 0" },
  ];

  return fields.map((field) => {
    const row = queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} ${field.condition}`,
      params,
    );
    const fillRate = Number(((row?.count ?? 0) / total).toFixed(2));

    return {
      field: field.label,
      fillRate,
      status: toFieldStatus(fillRate),
    } satisfies FieldCompletenessItem;
  });
}

export function getMetrics(filters: FilterParams): MetricsPayload {
  const current = getMetricSnapshot(filters);
  const { clause, params } = buildWhereClause(filters);

  const resolvedWithoutResolvedAt =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} status = ? AND (resolved_at IS NULL OR TRIM(resolved_at) = '')`,
      [...params, RESOLVED_STATUS],
    )?.count ?? 0;

  const timeTrackingFilled =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}${clause ? " AND" : " WHERE"} time_tracked_seconds > 0`,
      params,
    )?.count ?? 0;

  const duplicatesUpdated =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COALESCE(SUM(duplicates_updated), 0) AS count FROM batches`,
    )?.count ?? 0;

  const dataQuality = buildDataQuality({
    totalTickets: current.totalTickets,
    unassigned: current.unassigned,
    resolvedWithoutResolvedAt,
    timeTrackingFilled,
    duplicatesUpdated,
  });

  let deltas = emptyDeltas();
  if (filters.dateFrom && filters.dateTo) {
    const start = new Date(filters.dateFrom);
    const end = new Date(`${filters.dateTo}T23:59:59.999`);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
      const rangeMs = end.getTime() - start.getTime();
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - rangeMs);

      const previous = getMetricSnapshot({
        ...filters,
        dateFrom: previousStart.toISOString().slice(0, 10),
        dateTo: previousEnd.toISOString().slice(0, 10),
      });

      deltas = {
        totalTickets: calculateDelta(current.totalTickets, previous.totalTickets),
        resolutionRate: calculateDelta(current.resolutionRate, previous.resolutionRate),
        avgResolutionHours: calculateDelta(
          current.avgResolutionHours,
          previous.avgResolutionHours,
        ),
        openTickets: calculateDelta(current.openTickets, previous.openTickets),
        unassigned: calculateDelta(current.unassigned, previous.unassigned),
      };
    }
  }

  return {
    ...current,
    dataQualityScore: dataQuality.score,
    dataQualityRules: dataQuality.rules,
    fieldCompleteness: getFieldCompleteness(filters),
    narrative: buildNarrative(current),
    deltas,
  };
}

export function listTickets(filters: FilterParams): TicketListResult {
  const { clause, params } = buildWhereClause(filters);
  const offset = (filters.page - 1) * filters.limit;
  const total =
    queryGet<{ count: number }>(
      sqlite,
      `SELECT COUNT(*) AS count FROM tickets ${clause}`,
      params,
    )?.count ?? 0;

  const tickets = queryAll<TicketRecord>(
    sqlite,
    `
      SELECT ${ticketSelect}
      FROM tickets
      ${clause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, offset],
  );

  return {
    tickets,
    total,
    page: filters.page,
    limit: filters.limit,
  };
}

export function listBatches() {
  return queryAll<BatchRecord>(
    sqlite,
    `
      SELECT
        id,
        filename,
        uploaded_at AS uploadedAt,
        period_start AS periodStart,
        period_end AS periodEnd,
        ticket_count AS ticketCount,
        duplicates_updated AS duplicatesUpdated
      FROM batches
      ORDER BY uploaded_at DESC
    `,
  );
}

export function deleteBatch(id: string) {
  const result = sqlite.prepare(`DELETE FROM batches WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function getFilterOptions(): FilterOptions {
  const loadDistinct = (column: string) =>
    queryAll<{ value: string }>(
      sqlite,
      `
        SELECT DISTINCT ${column} AS value
        FROM tickets
        WHERE ${column} IS NOT NULL AND TRIM(${column}) != ''
        ORDER BY value ASC
      `,
    ).map((row) => row.value);

  return {
    categories: loadDistinct("category"),
    priorities: loadDistinct("priority"),
    statuses: loadDistinct("status"),
    assignees: loadDistinct("assignee"),
  };
}

export function importBatch(filename: string, parsed: { tickets: ImportedTicket[]; periodStart: string; periodEnd: string; ticketCount: number; }): UploadResult {
  const batchId = randomUUID();
  const uploadedAt = new Date().toISOString();
  const trackingIds = parsed.tickets.map((ticket) => ticket.trackingId);
  const duplicateRows =
    trackingIds.length > 0
      ? queryAll<{ trackingId: string }>(
          sqlite,
          `SELECT tracking_id AS trackingId FROM tickets WHERE tracking_id IN (${trackingIds.map(() => "?").join(", ")})`,
          trackingIds,
        )
      : [];
  const duplicatesUpdated = duplicateRows.length;

  const insertBatch = sqlite.prepare(`
    INSERT INTO batches (
      id,
      filename,
      uploaded_at,
      period_start,
      period_end,
      ticket_count,
      duplicates_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertTicket = sqlite.prepare(`
    INSERT INTO tickets (
      tracking_id,
      ticket_number,
      created_at,
      updated_at,
      resolved_at,
      requester_name,
      requester_email,
      category,
      priority,
      status,
      subject,
      body,
      assignee,
      total_replies,
      staff_replies,
      time_tracked_seconds,
      due_date,
      event_date,
      event_time,
      location,
      room,
      program,
      request_type,
      academy,
      ticket_url,
      resolution_time_hours,
      batch_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(tracking_id) DO UPDATE SET
      ticket_number = excluded.ticket_number,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      resolved_at = excluded.resolved_at,
      requester_name = excluded.requester_name,
      requester_email = excluded.requester_email,
      category = excluded.category,
      priority = excluded.priority,
      status = excluded.status,
      subject = excluded.subject,
      body = excluded.body,
      assignee = excluded.assignee,
      total_replies = excluded.total_replies,
      staff_replies = excluded.staff_replies,
      time_tracked_seconds = excluded.time_tracked_seconds,
      due_date = excluded.due_date,
      event_date = excluded.event_date,
      event_time = excluded.event_time,
      location = excluded.location,
      room = excluded.room,
      program = excluded.program,
      request_type = excluded.request_type,
      academy = excluded.academy,
      ticket_url = excluded.ticket_url,
      resolution_time_hours = excluded.resolution_time_hours,
      batch_id = excluded.batch_id
  `);

  const transaction = sqlite.transaction(() => {
    insertBatch.run(
      batchId,
      filename,
      uploadedAt,
      parsed.periodStart,
      parsed.periodEnd,
      parsed.ticketCount,
      duplicatesUpdated,
    );

    for (const ticket of parsed.tickets) {
      upsertTicket.run(
        ticket.trackingId,
        ticket.ticketNumber,
        ticket.createdAt,
        ticket.updatedAt,
        ticket.resolvedAt,
        ticket.requesterName,
        ticket.requesterEmail,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.subject,
        ticket.body,
        ticket.assignee,
        ticket.totalReplies,
        ticket.staffReplies,
        ticket.timeTrackedSeconds,
        ticket.dueDate,
        ticket.eventDate,
        ticket.eventTime,
        ticket.location,
        ticket.room,
        ticket.program,
        ticket.requestType,
        ticket.academy,
        ticket.ticketUrl,
        ticket.resolutionTimeHours,
        batchId,
      );
    }
  });

  transaction();

  return {
    batchId,
    ticketCount: parsed.ticketCount,
    periodStart: parsed.periodStart,
    periodEnd: parsed.periodEnd,
    duplicatesUpdated,
  };
}
