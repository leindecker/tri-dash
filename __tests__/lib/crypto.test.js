import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encrypt, decrypt } from '@/lib/crypto';

const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

beforeAll(() => {
  process.env.TOKEN_ENCRYPTION_KEY = TEST_KEY;
});

afterAll(() => {
  delete process.env.TOKEN_ENCRYPTION_KEY;
});

describe('encrypt', () => {
  it('produces output with 3 colon-separated parts (iv:authTag:ciphertext)', () => {
    const parts = encrypt('hello').split(':');
    expect(parts).toHaveLength(3);
  });

  it('does not return the plaintext', () => {
    const plaintext = 'my-secret-token';
    expect(encrypt(plaintext)).not.toBe(plaintext);
  });

  it('produces a different ciphertext on each call due to random IV', () => {
    const a = encrypt('same-value');
    const b = encrypt('same-value');
    expect(a).not.toBe(b);
  });
});

describe('decrypt', () => {
  it('round-trips: decrypt(encrypt(x)) === x', () => {
    const original = 'strava-access-token-xyz';
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it('each independently encrypted value decrypts correctly', () => {
    const a = encrypt('same-value');
    const b = encrypt('same-value');
    expect(decrypt(a)).toBe('same-value');
    expect(decrypt(b)).toBe('same-value');
  });

  it('returns plaintext as-is when it has no colons (legacy token)', () => {
    expect(decrypt('plainlegacytoken')).toBe('plainlegacytoken');
  });

  it('returns value as-is when it does not have exactly 3 parts', () => {
    expect(decrypt('only:two')).toBe('only:two');
    expect(decrypt('a:b:c:d')).toBe('a:b:c:d');
  });

  it('returns null for null input', () => {
    expect(decrypt(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect(decrypt(undefined)).toBeUndefined();
  });

  it('returns the raw value when ciphertext is tampered (auth tag mismatch)', () => {
    const tampered = 'aabbccddeeff0011:aabbccddeeff00112233:deadbeef001122';
    expect(decrypt(tampered)).toBe(tampered);
  });
});