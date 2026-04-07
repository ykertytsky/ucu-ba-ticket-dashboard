import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const batches = sqliteTable("batches", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  ticketCount: integer("ticket_count").notNull(),
  duplicatesUpdated: integer("duplicates_updated").notNull().default(0),
});

export const tickets = sqliteTable("tickets", {
  trackingId: text("tracking_id").primaryKey(),
  ticketNumber: integer("ticket_number"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  resolvedAt: text("resolved_at"),
  requesterName: text("requester_name"),
  requesterEmail: text("requester_email"),
  category: text("category"),
  priority: text("priority"),
  status: text("status"),
  subject: text("subject"),
  body: text("body"),
  assignee: text("assignee"),
  totalReplies: integer("total_replies").notNull().default(0),
  staffReplies: integer("staff_replies").notNull().default(0),
  timeTrackedSeconds: integer("time_tracked_seconds").notNull().default(0),
  dueDate: text("due_date"),
  eventDate: text("event_date"),
  eventTime: text("event_time"),
  location: text("location"),
  room: text("room"),
  program: text("program"),
  requestType: text("request_type"),
  academy: text("academy"),
  ticketUrl: text("ticket_url"),
  resolutionTimeHours: real("resolution_time_hours"),
  batchId: text("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
});
