import { getScoreTone } from "@/lib/utils";
import type { DataQualityRule, MetricDeltaSet, MetricsPayload } from "@/lib/types";

export const RESOLVED_STATUS = "Вирішене";

interface DataQualityStats {
  totalTickets: number;
  unassigned: number;
  resolvedWithoutResolvedAt: number;
  timeTrackingFilled: number;
  duplicatesUpdated: number;
}

function createRule(
  id: string,
  title: string,
  affectedCount: number,
  severity: DataQualityRule["severity"],
  scoreImpact: number,
  description: string,
): DataQualityRule {
  return {
    id,
    title,
    affectedCount,
    severity,
    scoreImpact,
    description,
  };
}

export function buildDataQuality(stats: DataQualityStats) {
  const timeTrackingFillRate =
    stats.totalTickets > 0 ? (stats.timeTrackingFilled / stats.totalTickets) * 100 : 0;
  const rules: DataQualityRule[] = [];
  let score = 100;

  const unassignedPenalty = Math.min(10, Number((stats.unassigned * 0.1).toFixed(2)));
  if (unassignedPenalty > 0) {
    rules.push(
      createRule(
        "unassigned",
        "Тікети без виконавця",
        stats.unassigned,
        "medium",
        -unassignedPenalty,
        "Частина тікетів не має виконавця, тому навантаження команди може бути спотвореним.",
      ),
    );
    score -= unassignedPenalty;
  }

  const resolvedPenalty = Math.min(
    20,
    Number((stats.resolvedWithoutResolvedAt * 2).toFixed(2)),
  );
  if (resolvedPenalty > 0) {
    rules.push(
      createRule(
        "resolved-without-date",
        "Вирішені тікети без дати вирішення",
        stats.resolvedWithoutResolvedAt,
        "high",
        -resolvedPenalty,
        "Такі тікети погіршують точність метрик часу вирішення.",
      ),
    );
    score -= resolvedPenalty;
  }

  let timeTrackingPenalty = 0;
  if (timeTrackingFillRate > 0 && timeTrackingFillRate < 40) {
    timeTrackingPenalty = 10;
  } else if (timeTrackingFillRate >= 40 && timeTrackingFillRate < 70) {
    timeTrackingPenalty = 5;
  }

  if (timeTrackingPenalty > 0) {
    rules.push(
      createRule(
        "time-tracking-fill",
        "Низьке покриття відстеження часу",
        stats.timeTrackingFilled,
        "medium",
        -timeTrackingPenalty,
        "Часові метрики потрібно трактувати обережно, адже трекінг часу заповнений не для всіх тікетів.",
      ),
    );
    score -= timeTrackingPenalty;
  }

  if (stats.duplicatesUpdated > 0) {
    rules.push(
      createRule(
        "duplicates",
        "Повторно імпортовані тікети",
        stats.duplicatesUpdated,
        "low",
        -5,
        "Частина записів була оновлена повторним імпортом за тим самим trackingId.",
      ),
    );
    score -= 5;
  }

  rules.push(
    createRule(
      "first-response-broken",
      "Поле першої відповіді зламане в HESK",
      stats.totalTickets,
      "high",
      -10,
      "Поле `Перша відповідь о` завжди містить час експорту, тому SLA за першою відповіддю не показуються.",
    ),
  );
  score -= 10;

  return {
    score: Math.max(0, Number(score.toFixed(1))),
    rules,
    tone: getScoreTone(Math.max(0, score)),
    timeTrackingFillRate,
  };
}

export function buildNarrative(metrics: Pick<
  MetricsPayload,
  | "totalTickets"
  | "resolutionRate"
  | "avgResolutionHours"
  | "unassigned"
  | "byCategory"
>) {
  const topCategory = metrics.byCategory[0];

  if (metrics.totalTickets === 0) {
    return "Дані ще не завантажені. Імпортуйте XML-експорт HESK, щоб побачити показники служби підтримки.";
  }

  const categoryPart = topCategory
    ? `Топ категорія: ${topCategory.category} (${topCategory.count} тікетів).`
    : "Категорії поки що не визначені.";

  return `За цей період: ${metrics.totalTickets} тікетів, ${metrics.resolutionRate.toFixed(1)}% вирішено. Середній час вирішення — ${metrics.avgResolutionHours.toFixed(1)} год. ${metrics.unassigned} тікетів без виконавця. ${categoryPart}`;
}

export function calculateDelta(current: number, previous: number) {
  if (previous === 0) {
    return null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function emptyDeltas(): MetricDeltaSet {
  return {
    totalTickets: null,
    resolutionRate: null,
    avgResolutionHours: null,
    openTickets: null,
    unassigned: null,
  };
}
