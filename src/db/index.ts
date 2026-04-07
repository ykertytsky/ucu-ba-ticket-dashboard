import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";

export const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "helpdesk.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const sqlite = new Database(DB_PATH);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("synchronous = NORMAL");

export function ensureDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      ticket_count INTEGER NOT NULL,
      duplicates_updated INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tickets (
      tracking_id TEXT PRIMARY KEY,
      ticket_number INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      resolved_at TEXT,
      requester_name TEXT,
      requester_email TEXT,
      category TEXT,
      priority TEXT,
      status TEXT,
      subject TEXT,
      body TEXT,
      assignee TEXT,
      total_replies INTEGER NOT NULL DEFAULT 0,
      staff_replies INTEGER NOT NULL DEFAULT 0,
      time_tracked_seconds INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      event_date TEXT,
      event_time TEXT,
      location TEXT,
      room TEXT,
      program TEXT,
      request_type TEXT,
      academy TEXT,
      ticket_url TEXT,
      resolution_time_hours REAL,
      batch_id TEXT NOT NULL,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(created_at);
    CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
    CREATE INDEX IF NOT EXISTS tickets_category_idx ON tickets(category);
    CREATE INDEX IF NOT EXISTS tickets_priority_idx ON tickets(priority);
    CREATE INDEX IF NOT EXISTS tickets_assignee_idx ON tickets(assignee);
    CREATE INDEX IF NOT EXISTS tickets_batch_id_idx ON tickets(batch_id);
  `);
}

ensureDatabase();

export const db = drizzle(sqlite, { schema });
