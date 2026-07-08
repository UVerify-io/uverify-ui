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

import {
  buildLinkedInAddToProfileUrl,
  buildEmbedSnippet,
  buildSocialShareUrls,
} from '../../src/utils/share';

test.describe('share utils', () => {
  test('builds a prefilled LinkedIn add-to-profile url', () => {
    const url = buildLinkedInAddToProfileUrl({
      name: 'Certified Cardano Developer',
      organizationName: 'Cardano Academy',
      issueYear: 2026,
      issueMonth: 7,
      certUrl: 'https://go.uverify.io/RXYWODQzXG',
      certId: 'RXYWODQzXG',
    });
    expect(url).toContain('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME');
    expect(url).toContain('name=Certified+Cardano+Developer');
    expect(url).toContain('organizationName=Cardano+Academy');
    expect(url).toContain('issueYear=2026');
    expect(url).toContain('issueMonth=7');
    expect(url).toContain('certId=RXYWODQzXG');
  });

  test('embed snippet escapes html and links the short url', () => {
    const snippet = buildEmbedSnippet(
      'https://go.uverify.io/RXYWODQzXG',
      'https://app.uverify.io/og/diploma.png',
      'My "Diploma" <2026>',
    );
    expect(snippet).toContain('href="https://go.uverify.io/RXYWODQzXG"');
    expect(snippet).toContain('src="https://app.uverify.io/og/diploma.png"');
    expect(snippet).not.toContain('<2026>');
    expect(snippet).toContain('&quot;Diploma&quot;');
  });

  test('builds encoded social share intents', () => {
    const links = buildSocialShareUrls({
      url: 'https://go.uverify.io/RXYWODQzXG?name=Jane+Doe',
      text: 'Certified Cardano Developer — verified on-chain by Cardano Academy',
    });
    const encodedUrl = encodeURIComponent(
      'https://go.uverify.io/RXYWODQzXG?name=Jane+Doe',
    );

    expect(links.x).toContain('https://twitter.com/intent/tweet');
    expect(links.x).toContain(`url=${encodedUrl}`);
    expect(links.x).toContain('text=Certified%20Cardano%20Developer');
    expect(links.bluesky).toContain('https://bsky.app/intent/compose?text=');
    expect(links.whatsapp).toContain('https://wa.me/?text=');
    expect(links.whatsapp).toContain(encodedUrl);
    expect(links.facebook).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    );
    expect(links.email).toContain('mailto:?subject=');
    expect(links.email).toContain(encodedUrl);
  });
});
