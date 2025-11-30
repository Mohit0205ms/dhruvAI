import { getVedicMoonSign } from '../../../lib/astrology/astrology';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateStr = url.searchParams.get('dateStr');
    const timeStr = url.searchParams.get('timeStr');
    const latitude = url.searchParams.get('latitude');
    const longitude = url.searchParams.get('longitude');

    // Validate required parameters
    if (!dateStr || !timeStr || latitude === null || longitude === null) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: dateStr, timeStr, latitude, longitude' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse date and time
    const fullDateTime = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(fullDateTime.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date or time format. Expected YYYY-MM-DD for date and HH:MM for time' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract year, month, day, hour, minute for getVedicMoonSign
    const year = fullDateTime.getFullYear();
    const month = fullDateTime.getMonth() + 1; // getMonth() returns 0-based month
    const day = fullDateTime.getDate();
    const hour = fullDateTime.getHours();
    const minute = fullDateTime.getMinutes();

    // Parse coordinates (stored for potential future use, not currently used by getVedicMoonSign)
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate moon sign using the new getVedicMoonSign function
    const moonSign = await getVedicMoonSign(year, month, day, hour, minute);
    console.log('Debug: Moon sign calculation for', dateStr, timeStr, lat, lon, '->', moonSign);

    // Return success response
    return new Response(
      JSON.stringify({ moonSign }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in getMoonSign API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const dynamic = 'force-dynamic';
