import { cn, formatDate, truncate, formatDateTime, formatDistanceFromNow, generateId, capitalize, isValidEmail, slugify, isMobile, formatNumber, calculateProgress, validateCPF, validateCNPJ, validateCREFITO, validateEmail, validatePhone, formatCPF, formatCNPJ, formatPhone, truncateText, capitalizeFirst, generateSlug, getStatusColor, getStatusLabel, groupBy, sortBy, calculateBMI, getBMIClassification, generatePatientCode } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', { 'is-active': true, 'is-disabled': false })).toBe('base is-active');
  });
});

describe('formatDate', () => {
  it('should format a date string', () => {
    expect(formatDate('2024-07-26T12:00:00.000Z')).toBe('26/07/2024');
  });

  it('should format a Date object', () => {
    const date = new Date('2024-07-26T12:00:00.000Z');
    expect(formatDate(date)).toBe('26/07/2024');
  });
});

describe('truncate', () => {
  it('should truncate text', () => {
    expect(truncate('This is a long text', 10)).toBe('This is a ...');
  });

  it('should not truncate short text', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });
});

describe('formatDateTime', () => {
  it('should format a date-time string', () => {
    const date = new Date('2024-07-26T12:30:00.000Z');
    const formattedDate = formatDateTime(date);
    // This will test against the local time zone of the test runner
    const expectedDate = new Date('2024-07-26T12:30:00.000Z');
    const expected = `${expectedDate.toLocaleDateString('pt-BR')} às ${expectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    expect(formattedDate).toContain('26/07/2024');
    expect(formattedDate).toContain('09:30');
  });
});

describe('formatDistanceFromNow', () => {
  it('should return a human-readable distance', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    expect(formatDistanceFromNow(date.toISOString())).toBe('há cerca de 2 horas');
  });
});

describe('generateId', () => {
  it('should generate a unique string id', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });
});

describe('capitalize', () => {
  it('should capitalize the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  it('should invalidate incorrect emails', () => {
    expect(isValidEmail('test@.com')).toBe(false);
  });
});

describe('slugify', () => {
  it('should convert text to a slug', () => {
    expect(slugify('Hello World! 123')).toBe('hello-world-123');
  });
});

describe('isMobile', () => {
  it('should return false in a non-browser environment', () => {
    expect(isMobile()).toBe(false);
  });
});

describe('formatNumber', () => {
  it('should format numbers', () => {
    expect(formatNumber(12345)).toBe('12.3K');
    expect(formatNumber(1234567)).toBe('1.2M');
    expect(formatNumber(123)).toBe('123');
  });
});

describe('calculateProgress', () => {
  it('should calculate progress correctly', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(0, 100)).toBe(0);
    expect(calculateProgress(100, 100)).toBe(100);
  });
});
