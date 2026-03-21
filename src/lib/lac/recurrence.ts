import { RecurrenceFrequency } from "@prisma/client";

/**
 * Given a recurrence frequency and a month/year, returns all matching Sunday dates.
 */
export function getSundaysForMonth(year: number, month: number): Date[] {
  const sundays: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 0) {
      sundays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

export function getMatchingSundays(
  frequency: RecurrenceFrequency,
  startDate: Date,
  endDate: Date | null,
  fromDate: Date,
  months: number = 3
): Date[] {
  const results: Date[] = [];
  const end = endDate || new Date(fromDate.getFullYear(), fromDate.getMonth() + months, 0);
  const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);

  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const sundays = getSundaysForMonth(year, month);

    if (sundays.length === 0) {
      current.setMonth(current.getMonth() + 1);
      continue;
    }

    let matched: Date | null = null;

    switch (frequency) {
      case "WEEKLY":
        sundays.forEach((s) => {
          if (s >= startDate && s >= fromDate && s <= end) results.push(s);
        });
        current.setMonth(current.getMonth() + 1);
        continue;
      case "BIWEEKLY":
        // Every other Sunday from startDate
        sundays.forEach((s) => {
          if (s >= startDate && s >= fromDate && s <= end) {
            const diffWeeks = Math.round(
              (s.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
            );
            if (diffWeeks % 2 === 0) results.push(s);
          }
        });
        current.setMonth(current.getMonth() + 1);
        continue;
      case "MONTHLY_FIRST":
        matched = sundays[0] || null;
        break;
      case "MONTHLY_SECOND":
        matched = sundays[1] || null;
        break;
      case "MONTHLY_THIRD":
        matched = sundays[2] || null;
        break;
      case "MONTHLY_FOURTH":
        matched = sundays[3] || null;
        break;
      case "MONTHLY_LAST":
        matched = sundays[sundays.length - 1] || null;
        break;
    }

    if (matched && matched >= startDate && matched >= fromDate && matched <= end) {
      results.push(matched);
    }

    current.setMonth(current.getMonth() + 1);
  }

  return results;
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

export function getNextSunday(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const daysUntilSunday = (7 - d.getDay()) % 7;
  if (daysUntilSunday === 0 && d.getDay() !== 0) {
    d.setDate(d.getDate() + 7);
  } else {
    d.setDate(d.getDate() + daysUntilSunday);
  }
  return d;
}

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Chaque dimanche",
  BIWEEKLY: "Un dimanche sur deux",
  MONTHLY_FIRST: "1er dimanche du mois",
  MONTHLY_SECOND: "2e dimanche du mois",
  MONTHLY_THIRD: "3e dimanche du mois",
  MONTHLY_FOURTH: "4e dimanche du mois",
  MONTHLY_LAST: "Dernier dimanche du mois",
};
