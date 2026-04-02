import { describe, it, expect, vi } from 'vitest';

// Mock db to prevent SQLite from being opened during tests
vi.mock('@/lib/db', () => ({
  getStravaTokensForUser: vi.fn(),
  upsertStravaTokens: vi.fn(),
}));

import { mapActivity, weeksAgoTimestamp } from '@/lib/strava';

const BASE_ACTIVITY = {
  id: 123,
  sport_type: 'Run',
  moving_time: 3600,   // 60 min
  distance: 10000,     // 10 km
  start_date_local: '2024-01-10T08:00:00', // Wednesday
  name: 'Morning Run',
  average_speed: 2.78,
  average_heartrate: 150,
  max_heartrate: 175,
  total_elevation_gain: 50,
};

describe('mapActivity', () => {
  it('maps basic fields correctly', () => {
    const result = mapActivity(BASE_ACTIVITY);
    expect(result.id).toBe('strava_123');
    expect(result.stravaId).toBe(123);
    expect(result.source).toBe('strava');
    expect(result.sport).toBe('run');
    expect(result.mins).toBe(60);
    expect(result.dist).toBe(10);
    expect(result.desc).toBe('Morning Run');
    expect(result.avgHr).toBe(150);
    expect(result.maxHr).toBe(175);
    expect(result.elevGain).toBe(50);
    expect(result.startDate).toBe('2024-01-10T08:00:00');
  });

  it.each([
    ['Swim',          'swim'],
    ['Pool_Swim',     'swim'],
    ['Ride',          'bike'],
    ['VirtualRide',   'bike'],
    ['EBikeRide',     'bike'],
    ['MountainBikeRide', 'bike'],
    ['Run',           'run'],
    ['VirtualRun',    'run'],
    ['TrailRun',      'run'],
    ['WeightTraining','gym'],
    ['Workout',       'gym'],
    ['Crossfit',      'gym'],
    ['Yoga',          'gym'],
  ])('maps sport_type "%s" → "%s"', (sportType, expected) => {
    expect(mapActivity({ ...BASE_ACTIVITY, sport_type: sportType }).sport).toBe(expected);
  });

  it('defaults unknown sport_type to run', () => {
    expect(mapActivity({ ...BASE_ACTIVITY, sport_type: 'Surfing' }).sport).toBe('run');
  });

  it('falls back to elapsed_time when moving_time is absent', () => {
    const result = mapActivity({ ...BASE_ACTIVITY, moving_time: undefined, elapsed_time: 1800 });
    expect(result.mins).toBe(30);
  });

  it('handles zero distance', () => {
    const result = mapActivity({ ...BASE_ACTIVITY, distance: 0 });
    expect(result.dist).toBe(0);
  });

  it('computes weekKey as the Monday of the activity date', () => {
    // 2024-01-10 is Wednesday → Monday is 2024-01-08
    expect(mapActivity(BASE_ACTIVITY).weekKey).toBe('2024-01-08');
  });

  it('computes day-of-week with Monday=0', () => {
    // Wednesday → index 2
    expect(mapActivity(BASE_ACTIVITY).day).toBe(2);
  });

  it('computes tss > 0 for non-zero duration', () => {
    expect(mapActivity(BASE_ACTIVITY).tss).toBeGreaterThan(0);
  });

  it('sets optional fields to null when absent', () => {
    const result = mapActivity({
      ...BASE_ACTIVITY,
      average_heartrate: undefined,
      average_watts: undefined,
    });
    expect(result.avgHr).toBeNull();
    expect(result.avgPower).toBeNull();
  });
});

describe('weeksAgoTimestamp', () => {
  it('returns a number', () => {
    expect(typeof weeksAgoTimestamp(4)).toBe('number');
  });

  it('returns a unix timestamp in the past', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(weeksAgoTimestamp(1)).toBeLessThan(now);
  });

  it('returns an earlier timestamp for more weeks ago', () => {
    expect(weeksAgoTimestamp(8)).toBeLessThan(weeksAgoTimestamp(4));
  });
});