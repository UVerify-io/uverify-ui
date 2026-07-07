import { test, expect } from '@playwright/test';
import { shortCodeFromHash } from '../../src/utils/shortCode';
import { cropSalt } from '../../src/utils/tools';
import { isReservedKey } from '../../src/utils/updatePolicy';

test.describe('shortCodeFromHash', () => {
  test('matches the shared cross-language vectors', () => {
    expect(
      shortCodeFromHash(
        'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      ),
    ).toBe('RXYWODQzXG');
    expect(
      shortCodeFromHash(
        '243d719da7c49d8616723e0cfb698611b0f370f0b34a744b2e0e88b55cd86fa8',
      ),
    ).toBe('61kgLIX6vE');
    expect(
      shortCodeFromHash(
        '0000000000000000000000000000000000000000000000000000000000000000',
      ),
    ).toBe('0000000000');
  });

  test('always returns 10 base62 chars', () => {
    expect(
      shortCodeFromHash(
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      ),
    ).toMatch(/^[0-9A-Za-z]{10}$/);
  });
});

test.describe('cropSalt', () => {
  test('crops at the last tilde only', () => {
    expect(cropSalt('Jane Doe~x7Rk2p')).toBe('Jane Doe');
    expect(cropSalt('Jane~Doe~x7Rk2p')).toBe('Jane~Doe');
    expect(cropSalt('Jane Doe')).toBe('Jane Doe');
    expect(cropSalt('~leading')).toBe('~leading');
  });
});

test.describe('isReservedKey', () => {
  test('reserves uverify_ prefix, uv_og_ prefix and uv_tid', () => {
    expect(isReservedKey('uverify_update_policy')).toBe(true);
    expect(isReservedKey('uv_tid')).toBe(true);
    expect(isReservedKey('uv_og_title')).toBe(true);
    expect(isReservedKey('uv_og_desc')).toBe(true);
    expect(isReservedKey('uv_url_name')).toBe(false);
    expect(isReservedKey('title')).toBe(false);
  });
});
