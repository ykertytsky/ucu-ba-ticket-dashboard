import { DOMParser } from "@xmldom/xmldom";

import type { ImportedTicket, ParsedBatchData } from "@/lib/types";

const SPREADSHEET_NS = "urn:schemas-microsoft-com:office:spreadsheet";

type XmlParent = {
  getElementsByTagNameNS(namespace: string, localName: string): ArrayLike<XmlElement>;
  getElementsByTagName(name: string): ArrayLike<XmlElement>;
};

interface XmlNode {
  nodeType: number;
  localName?: string;
  childNodes?: ArrayLike<XmlNode>;
}

interface XmlElement extends XmlNode {
  getAttribute(name: string): string | null;
  getAttributeNS(namespace: string, name: string): string | null;
  getElementsByTagNameNS(namespace: string, localName: string): ArrayLike<XmlElement>;
  getElementsByTagName(name: string): ArrayLike<XmlElement>;
  textContent?: string | null;
}

const columnMap: Array<keyof ImportedTicket | null> = [
  "ticketNumber",
  "trackingId",
  "createdAt",
  "updatedAt",
  null,
  "resolvedAt",
  "requesterName",
  "requesterEmail",
  null,
  "category",
  "priority",
  "status",
  "subject",
  "body",
  "assignee",
  "totalReplies",
  "staffReplies",
  "timeTrackedSeconds",
  "dueDate",
  "eventDate",
  "eventTime",
  "location",
  "room",
  "program",
  null,
  null,
  null,
  "requestType",
  null,
  null,
  null,
  "academy",
  null,
  null,
  null,
  null,
  null,
  "ticketUrl",
];

function getElementsByLocalName(parent: XmlParent, name: string) {
  const namespaced = parent.getElementsByTagNameNS(SPREADSHEET_NS, name);

  if (namespaced.length > 0) {
    return Array.from(namespaced);
  }

  return Array.from(parent.getElementsByTagName(name));
}

function readCellValue(cell: XmlElement) {
  const dataNode = getElementsByLocalName(cell, "Data")[0];

  if (!dataNode) {
    return "";
  }

  return ((dataNode.textContent as string | null) ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function normalizeText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTicketNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTimeTrackedSeconds(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const parts = trimmed.split(":").map((part) => Number.parseInt(part, 10));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function computeResolutionTimeHours(createdAt: string, resolvedAt: string | null) {
  if (!resolvedAt) {
    return null;
  }

  const start = new Date(createdAt).getTime();
  const end = new Date(resolvedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }

  return Number(((end - start) / 3_600_000).toFixed(2));
}

function createEmptyTicket(): ImportedTicket {
  return {
    trackingId: "",
    ticketNumber: null,
    createdAt: "",
    updatedAt: null,
    resolvedAt: null,
    requesterName: null,
    requesterEmail: null,
    category: null,
    priority: null,
    status: null,
    subject: null,
    body: null,
    assignee: null,
    totalReplies: 0,
    staffReplies: 0,
    timeTrackedSeconds: 0,
    dueDate: null,
    eventDate: null,
    eventTime: null,
    location: null,
    room: null,
    program: null,
    requestType: null,
    academy: null,
    ticketUrl: null,
    resolutionTimeHours: null,
  };
}

function readRowCells(row: XmlElement) {
  const cells = Array.from(row.childNodes ?? []).filter(
    (node): node is XmlElement => node.nodeType === 1 && node.localName === "Cell",
  );
  const values: string[] = [];

  for (const cell of cells) {
    const rawIndex =
      cell.getAttribute("ss:Index") ?? cell.getAttributeNS(SPREADSHEET_NS, "Index");
    const explicitIndex = rawIndex ? Number.parseInt(rawIndex, 10) - 1 : values.length;

    while (values.length < explicitIndex) {
      values.push("");
    }

    values.push(readCellValue(cell));
  }

  return values;
}

export function parseHeskXml(xml: string): ParsedBatchData {
  const document = new DOMParser().parseFromString(xml, "text/xml") as XmlParent & {
    getElementsByTagName(name: string): ArrayLike<XmlElement>;
  };
  const parseErrors = document.getElementsByTagName("parsererror");

  if (parseErrors.length > 0) {
    throw new Error("Не вдалося розпарсити XML-файл HESK.");
  }

  const rows = getElementsByLocalName(document, "Row");

  if (rows.length < 2) {
    throw new Error("HESK XML не містить рядків із даними.");
  }

  const dataRows = rows.slice(1);
  const tickets: ImportedTicket[] = [];
  let periodStart = "";
  let periodEnd = "";

  for (const row of dataRows) {
    const cells = readRowCells(row);
    const ticket = createEmptyTicket();

    for (let columnIndex = 0; columnIndex < columnMap.length; columnIndex += 1) {
      const field = columnMap[columnIndex];
      const value = cells[columnIndex] ?? "";

      if (!field) {
        continue;
      }

      switch (field) {
        case "ticketNumber":
          ticket.ticketNumber = parseTicketNumber(value);
          break;
        case "totalReplies":
        case "staffReplies":
          ticket[field] = parseInteger(value);
          break;
        case "timeTrackedSeconds":
          ticket.timeTrackedSeconds = parseTimeTrackedSeconds(value);
          break;
        case "createdAt":
          ticket.createdAt = value.trim();
          break;
        case "updatedAt":
        case "resolvedAt":
        case "dueDate":
        case "eventDate":
          ticket[field] = normalizeText(value);
          break;
        default:
          ticket[field] = normalizeText(value) as never;
      }
    }

    if (!ticket.trackingId || !ticket.createdAt) {
      continue;
    }

    ticket.resolutionTimeHours = computeResolutionTimeHours(
      ticket.createdAt,
      ticket.resolvedAt,
    );

    if (!periodStart || ticket.createdAt < periodStart) {
      periodStart = ticket.createdAt;
    }

    if (!periodEnd || ticket.createdAt > periodEnd) {
      periodEnd = ticket.createdAt;
    }

    tickets.push(ticket);
  }

  if (tickets.length === 0) {
    throw new Error("У файлі не знайдено жодного валідного тікета.");
  }

  return {
    ticketCount: tickets.length,
    periodStart,
    periodEnd,
    tickets,
  };
}
