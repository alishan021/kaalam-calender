import * as Astronomy from 'astronomy-engine';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KollavarshamModule = await import('kollavarsham') as any;
const KollavarshamClass = KollavarshamModule.Kollavarsham || KollavarshamModule.default?.Kollavarsham || KollavarshamModule.default;

const kollavarsham = new KollavarshamClass({
  system: 'SuryaSiddhanta',
  latitude: 10,
  longitude: 76.2,
});

export const MALAYALAM_MONTHS = [
  'Chingam','Kanni','Thulam','Vrischikam','Dhanu','Makaram',
  'Kumbham','Meenam','Medam','Edavam','Midhunam','Karkidakam',
];

export const ISLAMIC_MONTHS = [
  'Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",
  "Jumada al-Awwal","Jumada al-Thani",'Rajab',"Sha'ban",
  'Ramadan','Shawwal',"Dhu al-Qi'dah","Dhu al-Hijjah",
];

export const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha',
  'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
  'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

export const NAKSHATRA_LORDS = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu',
  'Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu',
  'Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'
];

// ─── Internal helpers ────────────────────────────────────────────────────────

function shiftDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Gregorian → Hijri ───────────────────────────────────────────────────────

export function toHijri(date: Date): string {
  return new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
}

export function toHijriArabic(date: Date): string {
  return new Intl.DateTimeFormat('ar-u-ca-islamic-civil', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
}

export function toHijriParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).formatToParts(date);
  const out: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') out[p.type] = p.value;
  return out;
}

/** Returns 1-based Hijri month index (1 = Muharram) */
export function getHijriMonthIndex(date: Date): number {
  return parseInt(
    new Intl.DateTimeFormat('en-u-ca-islamic-civil', { month: 'numeric' }).format(date)
  );
}

export function getHijriYear(date: Date): number {
  return parseInt(
    new Intl.DateTimeFormat('en-u-ca-islamic-civil', { year: 'numeric' }).format(date)
  );
}

/** Find the Gregorian date of day-1 of the Hijri month that contains viewDate */
export function findHijriMonthStart(viewDate: Date): Date {
  const info = toHijriParts(viewDate);
  const targetMonth = info.month;
  const targetYear = info.year;
  let d = new Date(viewDate);
  for (let i = 0; i < 31; i++) {
    const p = toHijriParts(d);
    if (p.day === '1' && p.month === targetMonth && p.year === targetYear) return d;
    if (p.month !== targetMonth || p.year !== targetYear) break;
    d = shiftDate(d, -1);
  }
  return d;
}

/** Find the Gregorian date of the last day of the Hijri month starting at monthStart */
export function findHijriMonthEnd(monthStart: Date): Date {
  const startInfo = toHijriParts(monthStart);
  let d = shiftDate(monthStart, 28);
  for (let i = 0; i < 4; i++) {
    const next = shiftDate(d, 1);
    const p = toHijriParts(next);
    if (p.month !== startInfo.month || p.year !== startInfo.year) return d;
    d = next;
  }
  return d;
}

/**
 * Navigate to a specific Hijri month+year.
 * Uses current viewDate as a reference to estimate the Gregorian date, then searches.
 */
export function navigateToHijri(targetMonthIdx: number, targetYear: number, currentViewDate: Date): Date {
  const currentMonthIdx = getHijriMonthIndex(currentViewDate);
  const currentYear = getHijriYear(currentViewDate);
  const monthDiff = (targetYear - currentYear) * 12 + (targetMonthIdx - currentMonthIdx);
  const approx = shiftDate(currentViewDate, Math.round(monthDiff * 29.53));
  return findHijriMonthStart(approx);
}

// ─── Gregorian → Malayalam ───────────────────────────────────────────────────

export function toMalayalam(date: Date) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = kollavarsham.fromGregorianDate(date) as any;
    return {
      day: result.date ?? result.day ?? 0,
      month: MALAYALAM_MONTHS[(result.month ?? 1) - 1] || 'Unknown',
      monthIndex: (result.month ?? 1) as number,
      year: result.year ?? 0,
      nakshatraEn: result._naksatra?.enMalayalam ?? '',
      nakshatraMl: result._naksatra?.mlMalayalam ?? ''
    };
  } catch {
    return { day: 0, month: 'Unknown', monthIndex: 1, year: 0, nakshatraEn: '', nakshatraMl: '' };
  }
}

/** Find the Gregorian date of day-1 of the Malayalam month that contains viewDate */
export function findMalayalamMonthStart(viewDate: Date): Date {
  const mal = toMalayalam(viewDate);
  const targetMonth = mal.month;
  const targetYear = mal.year;
  let d = new Date(viewDate);
  for (let i = 0; i < 35; i++) {
    const m = toMalayalam(d);
    if (m.day === 1 && m.month === targetMonth && m.year === targetYear) return d;
    if (m.month !== targetMonth || m.year !== targetYear) break;
    d = shiftDate(d, -1);
  }
  return d;
}

/** Find the Gregorian date of the last day of the Malayalam month starting at monthStart */
export function findMalayalamMonthEnd(monthStart: Date): Date {
  const startMal = toMalayalam(monthStart);
  let d = shiftDate(monthStart, 28);
  for (let i = 0; i < 10; i++) {
    const next = shiftDate(d, 1);
    const m = toMalayalam(next);
    if (m.month !== startMal.month || m.year !== startMal.year) return d;
    d = next;
  }
  return d;
}

/**
 * Navigate to a specific Malayalam month+year.
 */
export function navigateToMalayalam(targetMonthIdx: number, targetYear: number, currentViewDate: Date): Date {
  const cur = toMalayalam(currentViewDate);
  const monthDiff = (targetYear - cur.year) * 12 + (targetMonthIdx - cur.monthIndex);
  const approx = shiftDate(currentViewDate, Math.round(monthDiff * 30.44));
  return findMalayalamMonthStart(approx);
}

// ─── Nakshatra ───────────────────────────────────────────────────────────────

export function getNakshatra(date: Date) {
  const moonPos = Astronomy.EclipticGeoMoon(date);
  const year = date.getFullYear() + date.getMonth() / 12;
  const ayanamsa = 23.85 + (year - 2024) * 0.0139;
  const siderealLon = ((moonPos.lon - ayanamsa) % 360 + 360) % 360;
  const index = Math.floor(siderealLon / (360 / 27));
  const pada = Math.floor((siderealLon % (360 / 27)) / (360 / 108)) + 1;
  return { name: NAKSHATRAS[index], lord: NAKSHATRA_LORDS[index], pada };
}
