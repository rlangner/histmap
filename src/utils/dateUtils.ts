import { HistoricalDate, HistoricalEvent, DatePrecision } from '../types/historical';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Converts a HistoricalDate object into a continuous floating point decimal year.
 * Allows seamless mathematical sorting, slider scrubbing, and timeline rendering.
 */
export function dateToDecimalYear(date: HistoricalDate, alignToEnd: boolean = false): number {
  const year = date.year;
  const month = date.month !== undefined ? date.month : (alignToEnd ? 12 : 1);
  const day = date.day !== undefined ? date.day : (alignToEnd ? 30 : 1);
  const hour = date.hour !== undefined ? date.hour : (alignToEnd ? 23 : 0);
  const minute = date.minute !== undefined ? date.minute : (alignToEnd ? 59 : 0);

  const monthFraction = (month - 1) / 12;
  const dayFraction = (day - 1) / (12 * 30.4375);
  const hourFraction = hour / (12 * 30.4375 * 24);
  const minuteFraction = minute / (12 * 30.4375 * 24 * 60);

  return year + monthFraction + dayFraction + hourFraction + minuteFraction;
}

/**
 * Converts a continuous decimal year back into a structured HistoricalDate.
 */
export function decimalYearToDate(decimal: number, precision: DatePrecision = 'day'): HistoricalDate {
  const isBCE = decimal < 0;
  const year = Math.floor(decimal);
  const fraction = decimal - year;

  const totalMinutesInYear = 12 * 30.4375 * 24 * 60;
  const minuteOfYear = Math.round(fraction * totalMinutesInYear);

  const month = Math.min(12, Math.max(1, Math.floor(fraction * 12) + 1));
  const day = Math.min(31, Math.max(1, Math.floor((fraction * 12 - (month - 1)) * 30.4375) + 1));
  const hour = Math.min(23, Math.max(0, Math.floor((fraction * 12 * 30.4375 * 24) % 24)));
  const minute = Math.min(59, Math.max(0, Math.floor((fraction * totalMinutesInYear) % 60)));

  return {
    year,
    month: precision !== 'century' && precision !== 'millennium' && precision !== 'year' ? month : undefined,
    day: precision === 'day' || precision === 'hour' ? day : undefined,
    hour: precision === 'hour' ? hour : undefined,
    minute: precision === 'hour' ? minute : undefined,
    precision,
  };
}

/**
 * Formats a HistoricalDate into an elegant human-readable string.
 * Supports BCE/CE, Circa notation, months, days, and hours.
 */
export function formatHistoricalDate(date?: HistoricalDate, showTime: boolean = true): string {
  if (!date) return 'Unknown Date';

  if (date.label) {
    return date.label;
  }

  const prefix = date.isCirca ? 'c. ' : '';
  const isBCE = date.year <= 0;
  const displayYear = date.year === 0 ? '1 BCE' : (isBCE ? `${Math.abs(date.year)} BCE` : `${date.year} CE`);

  if (date.precision === 'millennium' || date.precision === 'century' || date.precision === 'year' || !date.month) {
    return `${prefix}${displayYear}`;
  }

  const monthName = MONTH_SHORT[date.month - 1] || '';

  if (date.precision === 'month' || !date.day) {
    return `${prefix}${monthName} ${displayYear}`;
  }

  const dayStr = `${date.day}`;

  if (date.precision === 'day' || !showTime || date.hour === undefined) {
    return `${prefix}${monthName} ${dayStr}, ${displayYear}`;
  }

  const hourStr = String(date.hour).padStart(2, '0');
  const minStr = String(date.minute || 0).padStart(2, '0');

  return `${prefix}${monthName} ${dayStr}, ${displayYear} ${hourStr}:${minStr}`;
}

/**
 * Formats a full event date description: Point, Range, Ongoing, or Unbounded start.
 */
export function formatEventDateRange(event: HistoricalEvent): string {
  if (event.hasNoStartDate && event.endDate) {
    return `Origin unknown – ${formatHistoricalDate(event.endDate)}`;
  }
  if (event.startDate && event.isOngoing) {
    return `${formatHistoricalDate(event.startDate)} – Present (Ongoing)`;
  }
  if (event.startDate && event.endDate) {
    // If same year and month
    const startStr = formatHistoricalDate(event.startDate);
    const endStr = formatHistoricalDate(event.endDate);
    if (startStr === endStr) return startStr;
    return `${startStr} – ${endStr}`;
  }
  if (event.startDate) {
    return formatHistoricalDate(event.startDate);
  }
  if (event.endDate) {
    return `Ended ${formatHistoricalDate(event.endDate)}`;
  }
  return 'Date unspecified';
}

/**
 * Determines whether a historical event is active at a given decimal year.
 */
export function isEventActiveAt(
  event: HistoricalEvent,
  currentDecimalYear: number,
  mode: 'active_only' | 'show_all' | 'window' = 'active_only',
  windowYears: number = 5
): boolean {
  if (mode === 'show_all') return true;

  const startTime = event.hasNoStartDate
    ? -Infinity
    : event.startDate
    ? dateToDecimalYear(event.startDate, false)
    : -Infinity;

  const endTime = event.isOngoing
    ? Infinity
    : event.endDate
    ? dateToDecimalYear(event.endDate, true)
    : (event.startDate ? dateToDecimalYear(event.startDate, true) : Infinity);

  if (mode === 'window') {
    const windowStart = currentDecimalYear - windowYears;
    const windowEnd = currentDecimalYear + windowYears;
    return startTime <= windowEnd && endTime >= windowStart;
  }

  // mode === 'active_only'
  const duration = endTime - startTime;
  if (duration < 0.25) {
    // For single-moment, single-day, or single-hour events, allow a small ~3 month (0.25y)
    // temporal window around the event so the scrubber lands on it smoothly
    const midPoint = (startTime + endTime) / 2;
    return Math.abs(currentDecimalYear - midPoint) <= 0.25;
  }

  return currentDecimalYear >= startTime && currentDecimalYear <= endTime;
}
