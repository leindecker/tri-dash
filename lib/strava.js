const SPORT_MAP = {
  Swim: 'swim', Pool_Swim: 'swim',
  Ride: 'bike', VirtualRide: 'bike', EBikeRide: 'bike', MountainBikeRide: 'bike',
  Run:  'run',  VirtualRun:  'run',  TrailRun:  'run',
  WeightTraining: 'gym', Workout: 'gym', Crossfit: 'gym', Yoga: 'gym',
};

function estimateTSS(sport, mins) {
  if (!mins) return 0;
  const IF = { swim: 0.75, bike: 0.70, run: 0.75, gym: 0.55 };
  const h   = mins / 60;
  const if_ = IF[sport] || 0.70;
  return Math.round(h * if_ * if_ * 100);
}

function getMondayISO(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function weeksAgoTimestamp(weeks) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - (weeks - 1) * 7);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function mapActivity(a) {
  const sport     = SPORT_MAP[a.sport_type] || SPORT_MAP[a.type] || 'run';
  const mins      = Math.round((a.moving_time || a.elapsed_time || 0) / 60);
  const distKm    = Math.round((a.distance || 0) / 100) / 10;
  const date      = new Date(a.start_date_local);
  const dayOfWeek = (date.getDay() + 6) % 7;

  return {
    id:        `strava_${a.id}`,
    stravaId:  a.id,
    source:    'strava',
    sport,
    day:       dayOfWeek,
    weekKey:   getMondayISO(date),
    desc:      a.name,
    mins,
    dist:      distKm,
    tss:       estimateTSS(sport, mins),
    avgSpeed:  a.average_speed          || null,
    avgHr:     a.average_heartrate     || null,
    maxHr:     a.max_heartrate         || null,
    elevGain:  a.total_elevation_gain  || 0,
    // power fields (may be present for rides with power meters)
    avgPower:  a.average_watts         || null,
    normPower: a.weighted_average_watts || a.weighted_average_power || null,
    maxPower:  a.max_watts             || null,
    startDate: a.start_date_local,
  };
}
