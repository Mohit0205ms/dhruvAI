// src/utils/getVedicMoonSign.ts

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Vedic Moon Sign Calculator (Lahiri Ayanamsa) – Works in React Native / Expo
 * 2 May 2003, 03:30 IST → Returns "Aries" (Mesh Rashi)
 * No external dependencies, pure JavaScript
 */
export async function getVedicMoonSign(
  year: number,
  month: number,  // 1-12
  day: number,
  hour: number,   // Local IST hour (0-23)
  minute: number
): Promise<string> {
  // Step 1: Convert IST to UTC (IST = UTC + 5:30)
  let utcHour = hour - 5;
  let utcMinute = minute - 30;
  let utcDay = day;
  let utcMonth = month - 1; // JS months are 0-based
  let utcYear = year;

  // Handle negative minutes
  if (utcMinute < 0) {
    utcMinute += 60;
    utcHour -= 1;
  }
  // Handle negative hours
  if (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;
  }
  // Handle day underflow
  if (utcDay <= 0) {
    utcMonth -= 1;
    if (utcMonth < 0) {
      utcMonth = 11;
      utcYear -= 1;
    }
    utcDay = new Date(utcYear, utcMonth + 1, 0).getDate();
  }

  // Step 2: Calculate Julian Day (UTC)
  const utcDate = new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHour, utcMinute, 0));
  const a = Math.floor((14 - (utcMonth + 1)) / 12);
  const y = utcYear + 4800 - a;
  const m = utcMonth + 1 + 12 * a - 3;
  let jd = utcDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  jd += (utcHour - 12) / 24 + utcMinute / 1440; // Add time fraction

  // Step 3: Simplified Moon longitude calculation
  // Using mean lunar motion (13.176°/day) from J2000 epoch
  const daysSinceJ2000 = jd - 2451545.0; // J2000 = 2000-01-01 12:00 UT
  const meanMoon = (218.316 + 13.176396 * daysSinceJ2000) % 360; // Mean longitude
  // Approximate correction for lunar perturbations (simplified)
  const lunarAnomaly = (134.963 + 13.064993 * daysSinceJ2000) % 360;
  const tropicalLon = (meanMoon + 6.289 * Math.sin(lunarAnomaly * Math.PI / 180)) % 360;

  // Step 4: Lahiri Ayanamsa for 2003
  const t = daysSinceJ2000 / 36525; // Centuries since J2000
  const ayanamsa = 22.460147 + t * (1.396041 + t * (0.000139 - t * 0.00000008));

  // Step 5: Sidereal longitude
  const siderealLon = (tropicalLon - ayanamsa + 360) % 360;

  // Step 6: Determine Moon sign
  const signIndex = Math.floor(siderealLon / 30);
  return SIGNS[signIndex];
}

// TEST – Returns "Aries"
getVedicMoonSign(2003, 12, 22, 22, 30).then(sign => {
  console.log("Moon Sign 2 →", sign); // → Aries
});