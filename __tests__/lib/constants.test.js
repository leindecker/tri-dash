import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fmtTime,
  fmtPaceOrSpeed,
  aggregateSessions,
  getMondayOf,
  getWeekKey,
} from '@/lib/constants';

describe('fmtTime', () => {
  it('returns — for falsy input', () => {
    expect(fmtTime(0)).toBe('—');
    expect(fmtTime(null)).toBe('—');
    expect(fmtTime(undefined)).toBe('—');
  });

  it('formats only minutes when less than an hour', () => {
    expect(fmtTime(45)).toBe('45min');
    expect(fmtTime(1)).toBe('1min');
    expect(fmtTime(59)).toBe('59min');
  });

  it('formats hours and minutes', () => {
    expect(fmtTime(60)).toBe('1h00');
    expect(fmtTime(90)).toBe('1h30');
    expect(fmtTime(125)).toBe('2h05');
  });
});

describe('fmtPaceOrSpeed', () => {
  it('returns null for falsy speed', () => {
    expect(fmtPaceOrSpeed('run', 0)).toBeNull();
    expect(fmtPaceOrSpeed('run', null)).toBeNull();
    expect(fmtPaceOrSpeed('bike', undefined)).toBeNull();
  });

  it('returns km/h for bike', () => {
    // 10 m/s * 3.6 = 36.0 km/h
    expect(fmtPaceOrSpeed('bike', 10)).toBe('36.0 km/h');
  });

  it('returns pace per 100m for swim', () => {
    const result = fmtPaceOrSpeed('swim', 1.5);
    expect(result).toMatch(/\/100m/);
  });

  it('returns pace per km for run', () => {
    const result = fmtPaceOrSpeed('run', 3);
    expect(result).toMatch(/\/km/);
  });

  it('returns pace per km for unknown sport', () => {
    const result = fmtPaceOrSpeed('gym', 2);
    expect(result).toMatch(/\/km/);
  });
});

describe('aggregateSessions', () => {
  it('returns zeroed totals for all sports on empty input', () => {
    const result = aggregateSessions([]);
    expect(result.swim).toEqual({ mins: 0, dist: 0, tss: 0, count: 0 });
    expect(result.bike).toEqual({ mins: 0, dist: 0, tss: 0, count: 0 });
    expect(result.run).toEqual({ mins: 0, dist: 0, tss: 0, count: 0 });
    expect(result.gym).toEqual({ mins: 0, dist: 0, tss: 0, count: 0 });
  });

  it('aggregates sessions of the same sport', () => {
    const sessions = [
      { sport: 'run', mins: 30, dist: 5, tss: 40 },
      { sport: 'run', mins: 45, dist: 8, tss: 55 },
    ];
    const result = aggregateSessions(sessions);
    expect(result.run).toEqual({ mins: 75, dist: 13, tss: 95, count: 2 });
  });

  it('aggregates sessions across different sports', () => {
    const sessions = [
      { sport: 'run', mins: 30, dist: 5, tss: 40 },
      { sport: 'swim', mins: 60, dist: 2, tss: 30 },
      { sport: 'bike', mins: 90, dist: 30, tss: 60 },
    ];
    const result = aggregateSessions(sessions);
    expect(result.run.count).toBe(1);
    expect(result.swim.count).toBe(1);
    expect(result.bike.count).toBe(1);
  });

  it('ignores sessions with unknown sport', () => {
    const sessions = [{ sport: 'yoga', mins: 30, dist: 0, tss: 10 }];
    const result = aggregateSessions(sessions);
    expect(result.run.count).toBe(0);
  });
});

describe('getMondayOf', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns Monday of the current week (Wednesday input)', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z')); // Wednesday
    const mon = getMondayOf(0);
    expect(mon.toISOString().slice(0, 10)).toBe('2024-01-08');
  });

  it('returns Monday of the current week (Monday input)', () => {
    vi.setSystemTime(new Date('2024-01-08T12:00:00Z')); // Monday
    const mon = getMondayOf(0);
    expect(mon.toISOString().slice(0, 10)).toBe('2024-01-08');
  });

  it('returns Monday of the previous week with offset -1', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
    const mon = getMondayOf(-1);
    expect(mon.toISOString().slice(0, 10)).toBe('2024-01-01');
  });

  it('returns Monday of the next week with offset +1', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
    const mon = getMondayOf(1);
    expect(mon.toISOString().slice(0, 10)).toBe('2024-01-15');
  });
});

describe('getWeekKey', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns ISO date string for Monday of current week', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
    expect(getWeekKey(0)).toBe('2024-01-08');
  });

  it('returns correct key for offset weeks', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
    expect(getWeekKey(-1)).toBe('2024-01-01');
  });
});