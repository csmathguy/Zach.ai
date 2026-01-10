import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { formatRelativeTime } from '../formatRelativeTime';

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-02T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns just now for invalid timestamps', () => {
    expect(formatRelativeTime('invalid-date')).toBe('Just now');
  });

  it('returns just now for recent timestamps', () => {
    const recent = new Date(now - 30 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toBe('Just now');
  });

  it('formats minutes', () => {
    const oneMinute = new Date(now - 60 * 1000).toISOString();
    const fiveMinutes = new Date(now - 5 * 60 * 1000).toISOString();

    expect(formatRelativeTime(oneMinute)).toBe('1 minute ago');
    expect(formatRelativeTime(fiveMinutes)).toBe('5 minutes ago');
  });

  it('formats hours', () => {
    const oneHour = new Date(now - 60 * 60 * 1000).toISOString();
    const twoHours = new Date(now - 2 * 60 * 60 * 1000).toISOString();

    expect(formatRelativeTime(oneHour)).toBe('1 hour ago');
    expect(formatRelativeTime(twoHours)).toBe('2 hours ago');
  });

  it('formats days', () => {
    const oneDay = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const threeDays = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

    expect(formatRelativeTime(oneDay)).toBe('1 day ago');
    expect(formatRelativeTime(threeDays)).toBe('3 days ago');
  });
});
