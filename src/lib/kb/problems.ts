// The problems inside one merged ticket, counted the desk's way. causes.ts files every report under
// a cause by its tenant (groupByCause); the desk's own reading (desk-notes.json) marks some of them as
// a one-day move. That is a problem of its own, but the desk keeps those reports counted where they
// are filed, so the one-day shift is a ticket whose reports also sit in another cause's count.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'unplaced' | 'shift';

export const PROBLEM_LABEL: Record<Problem, string> = {
  parser: 'month-first parser',
  hint: 'booking-v3 date hint',
  shift: 'one-day shift',
  unplaced: 'not placed',
};

export type ProblemRow = { problem: Problem; reports: number; tenants: number; firstSeen: string; lastSeen: string; alsoIn: Problem[] };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    alsoIn: [],
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'shift',
      reports: moved.length,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      alsoIn: groups.filter((g) => readAs(g, oneDayMove) > 0).map((g) => g.cause),
    });
  }
  return { merged: merged.length, rows };
}
