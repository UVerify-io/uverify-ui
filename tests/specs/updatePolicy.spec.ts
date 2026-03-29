/**
 * Update Policy — end-to-end tests
 *
 * Tests cover all six display-policy modes (append, first, override,
 * restricted, whitelist, accumulate), owner-control operations (policy change,
 * freeze, ownership transfer, whitelist mutation), and the Creation-page UI.
 *
 * Strategy: each test mocks GET /api/v1/verify/{HASH} with a tailored list of
 * certificate objects and then navigates to the certificate page. Assertions
 * inspect the Default-template's MetadataViewer inputs (rendered as
 * <input value="..."> elements) and the Pagination nav links to determine
 * which certificates are actually displayed.
 */

import { test, expect, Page } from '@playwright/test';
import { setupCommonMocks } from '../helpers/routeMocks';

// ─── Shared constants ────────────────────────────────────────────────────────

const ADDR_OWNER = 'addr1vx5sntqjtgyxqhxrgk9tusxn4d4l779p6vupgnhcw8qng5s9vk2c6';
const ADDR_OTHER = 'addr1vyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmpcy8332u';
const ADDR_THIRD = 'addr1qxnrhrxstep9kstep9kstep9kstep9kstep9kstep9kstep9ks3p';

/** 64-char hex hash used for all policy tests (distinct from other spec hashes). */
const POLICY_HASH =
  'deadbeef00000000deadbeef00000000deadbeef00000000deadbeef00000000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCerts(
  specs: Array<{ issuer: string; meta: Record<string, unknown> }>,
) {
  return specs.map((spec, i) => ({
    hash: POLICY_HASH,
    address: 'a909ac125a08605cc3458abe40d3ab6bff78a1d338144ef871c13452',
    blockHash:
      '448e1a2309700198fb14e2cc21c3335718dd36d40def16bb3ab9f592a8e52be9',
    blockNumber: 11753100 + i,
    transactionHash: String(i + 1).padStart(64, '0'),
    slot: 153440386 + i * 10,
    creationTime: 1745006677000 + i * 60000,
    metadata: JSON.stringify(spec.meta),
    issuer: spec.issuer,
  }));
}

async function setupPolicyCerts(
  page: Page,
  certs: ReturnType<typeof makeCerts>,
) {
  await setupCommonMocks(page);
  await page.route(`**/api/v1/verify/${POLICY_HASH}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(certs),
    });
  });
}

/** Returns the pagination nav link for page number n. */
const paginationLink = (page: Page, n: number) =>
  page.locator('nav ul li a').filter({ hasText: new RegExp(`^${n}$`) });

// ─── Display Policy Tests ─────────────────────────────────────────────────────

test.describe('Update Policy — Display Behaviors', () => {
  test('append: all submissions are shown via pagination', async ({ page }) => {
    const certs = makeCerts([
      { issuer: ADDR_OWNER, meta: { marker: 'FIRST_SUBMISSION' } },
      { issuer: ADDR_OTHER, meta: { marker: 'SECOND_SUBMISSION' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Page 1 shows first certificate content
    await expect(page.locator('input[value="FIRST_SUBMISSION"]')).toBeVisible({
      timeout: 5000,
    });

    // Page 2 button is present (both certs displayed)
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });

    // Navigate to page 2 — second certificate content is shown
    await page.goto(`/verify/${POLICY_HASH}/2`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[value="SECOND_SUBMISSION"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('first: always displays the initial submission regardless of later ones', async ({
    page,
  }) => {
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'first', marker: 'FIRST_SUBMISSION' },
      },
      { issuer: ADDR_OTHER, meta: { marker: 'SECOND_SUBMISSION' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    await expect(page.locator('input[value="FIRST_SUBMISSION"]')).toBeVisible({
      timeout: 5000,
    });

    // Only one page displayed — page 2 navigation button must not exist
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 3000 });

    // Content from the second submission must not appear
    await expect(
      page.locator('input[value="SECOND_SUBMISSION"]'),
    ).not.toBeVisible();
  });

  test('override: always shows the most recent submission', async ({
    page,
  }) => {
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'override', marker: 'FIRST_SUBMISSION' },
      },
      { issuer: ADDR_OTHER, meta: { marker: 'LATEST_SUBMISSION' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Latest cert content must be visible on page 1
    await expect(page.locator('input[value="LATEST_SUBMISSION"]')).toBeVisible({
      timeout: 5000,
    });

    // First cert's content must not be shown
    await expect(
      page.locator('input[value="FIRST_SUBMISSION"]'),
    ).not.toBeVisible();

    // No page 2 button — display is collapsed to one entry
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 3000 });
  });

  test('restricted: only submissions from the policy owner are shown', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets restricted policy
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'restricted', marker: 'OWNER_FIRST' },
      },
      // cert 2: non-owner — should be filtered out
      { issuer: ADDR_OTHER, meta: { marker: 'NON_OWNER_FILTERED' } },
      // cert 3: owner again — should appear as page 2
      { issuer: ADDR_OWNER, meta: { marker: 'OWNER_SECOND' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Page 1 shows the first owner cert
    await expect(page.locator('input[value="OWNER_FIRST"]')).toBeVisible({
      timeout: 5000,
    });

    // Page 2 button present (cert1 + cert3 from owner = 2 displayed)
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });

    // Page 3 button absent (cert2 was filtered)
    await expect(paginationLink(page, 3)).not.toBeVisible({ timeout: 3000 });

    // Non-owner content never appears
    await expect(
      page.locator('input[value="NON_OWNER_FILTERED"]'),
    ).not.toBeVisible();

    // Page 2 shows the second owner cert (cert3, not cert2)
    await page.goto(`/verify/${POLICY_HASH}/2`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[value="OWNER_SECOND"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('whitelist: only submissions from approved addresses are shown', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner, declares whitelist containing ADDR_OTHER
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          uverify_update_whitelist: ADDR_OTHER,
          marker: 'OWNER_CERT',
        },
      },
      // cert 2: whitelisted address — shown
      { issuer: ADDR_OTHER, meta: { marker: 'WHITELISTED_CERT' } },
      // cert 3: unlisted address — filtered
      { issuer: ADDR_THIRD, meta: { marker: 'UNLISTED_FILTERED' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Two pages: cert1 (owner) + cert2 (whitelisted)
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });
    await expect(paginationLink(page, 3)).not.toBeVisible({ timeout: 3000 });

    // cert3 from unlisted address never appears
    await expect(
      page.locator('input[value="UNLISTED_FILTERED"]'),
    ).not.toBeVisible();

    // Page 2 shows the whitelisted cert
    await page.goto(`/verify/${POLICY_HASH}/2`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[value="WHITELISTED_CERT"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('accumulate: authorized updates add new metadata keys and are merged into one page', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: sets accumulate policy with key1
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'accumulate', key1: 'FROM_CERT1' },
      },
      // cert 2: owner adds key2 (authorized — owner is always authorized)
      { issuer: ADDR_OWNER, meta: { key2: 'FROM_CERT2' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Both keys from both certs are visible in the merged result
    await expect(page.locator('input[value="FROM_CERT1"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('input[value="FROM_CERT2"]')).toBeVisible({
      timeout: 5000,
    });

    // Display is a single merged entry — no page 2 button
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 3000 });
  });

  test('accumulate: unauthorized submissions are ignored during merge', async ({
    page,
  }) => {
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'accumulate', key1: 'FROM_CERT1' },
      },
      // cert 2: unauthorized — its key2 must not appear in the merged result
      { issuer: ADDR_OTHER, meta: { key2: 'UNAUTHORIZED_VALUE' } },
      // cert 3: owner — its key3 should appear
      { issuer: ADDR_OWNER, meta: { key3: 'FROM_CERT3_OWNER' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    await expect(page.locator('input[value="FROM_CERT1"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('input[value="FROM_CERT3_OWNER"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('input[value="UNAUTHORIZED_VALUE"]'),
    ).not.toBeVisible();
  });

  test('accumulate: authorized submissions cannot overwrite existing keys', async ({
    page,
  }) => {
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'accumulate',
          stable_key: 'ORIGINAL_VALUE',
        },
      },
      // cert 2: owner tries to overwrite stable_key and also adds a new key
      {
        issuer: ADDR_OWNER,
        meta: {
          stable_key: 'ATTEMPTED_OVERWRITE',
          new_key: 'NEWLY_ADDED',
        },
      },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Original value is preserved
    await expect(page.locator('input[value="ORIGINAL_VALUE"]')).toBeVisible({
      timeout: 5000,
    });

    // Overwrite attempt is silently dropped
    await expect(
      page.locator('input[value="ATTEMPTED_OVERWRITE"]'),
    ).not.toBeVisible();

    // New key from the authorized update is added
    await expect(page.locator('input[value="NEWLY_ADDED"]')).toBeVisible({
      timeout: 5000,
    });
  });
});

// ─── Owner Control Tests ──────────────────────────────────────────────────────

test.describe('Update Policy — Owner Controls', () => {
  test('owner can change the active policy via a subsequent submission', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: initial policy is 'first'
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'first', marker: 'CERT1_FIRST' },
      },
      // cert 2: owner changes policy to 'override' and submits content
      {
        issuer: ADDR_OWNER,
        meta: { uverify_policy: 'override', marker: 'CERT2_OWNER_OVERRIDE' },
      },
      // cert 3: non-owner — should now be shown as latest (override mode)
      { issuer: ADDR_OTHER, meta: { marker: 'CERT3_LATEST' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // With 'override' now active, the latest non-policy cert (cert3) is shown
    await expect(page.locator('input[value="CERT3_LATEST"]')).toBeVisible({
      timeout: 5000,
    });

    // The first cert's content is no longer displayed (override replaced 'first')
    await expect(page.locator('input[value="CERT1_FIRST"]')).not.toBeVisible();
  });

  test('owner can freeze the record — subsequent submissions are ignored', async ({
    page,
  }) => {
    const certs = makeCerts([
      { issuer: ADDR_OWNER, meta: { marker: 'CERT1_ORIGINAL' } },
      // cert 2: owner freezes the record
      { issuer: ADDR_OWNER, meta: { uverify_freeze: 'true' } },
      // cert 3: any submission after freeze — must be ignored
      { issuer: ADDR_OTHER, meta: { marker: 'CERT3_POST_FREEZE' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Only the first cert is displayed after freezing
    await expect(page.locator('input[value="CERT1_ORIGINAL"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('input[value="CERT3_POST_FREEZE"]'),
    ).not.toBeVisible();

    // No pagination beyond page 1
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 3000 });
  });

  test('ownership transfer lets the new owner exercise owner rights', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: original owner sets 'restricted' policy
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'restricted',
          marker: 'CERT1_FROM_OWNER',
        },
      },
      // cert 2: owner transfers ownership to ADDR_OTHER
      {
        issuer: ADDR_OWNER,
        meta: { uverify_transfer_ownership: ADDR_OTHER },
      },
      // cert 3: new owner (ADDR_OTHER) submits — should be visible (page 2)
      { issuer: ADDR_OTHER, meta: { marker: 'CERT3_FROM_NEW_OWNER' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 (always shown) + cert3 (new owner) = 2 displayed pages
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });

    await page.goto(`/verify/${POLICY_HASH}/2`, { waitUntil: 'networkidle' });
    await expect(
      page.locator('input[value="CERT3_FROM_NEW_OWNER"]'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('owner can add an address to the whitelist via uverify_whitelist_add', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets whitelist policy with ADDR_OTHER only
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          uverify_update_whitelist: ADDR_OTHER,
          marker: 'CERT1_OWNER',
        },
      },
      // cert 2: owner adds ADDR_THIRD to whitelist, also has content marker
      {
        issuer: ADDR_OWNER,
        meta: { uverify_whitelist_add: ADDR_THIRD, marker: 'CERT2_ADD' },
      },
      // cert 3: ADDR_THIRD — now whitelisted, should appear
      { issuer: ADDR_THIRD, meta: { marker: 'CERT3_NEWLY_WHITELISTED' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert2 (owner) + cert3 (newly whitelisted) = 3 pages
    await expect(paginationLink(page, 3)).toBeVisible({ timeout: 5000 });

    await page.goto(`/verify/${POLICY_HASH}/3`, { waitUntil: 'networkidle' });
    await expect(
      page.locator('input[value="CERT3_NEWLY_WHITELISTED"]'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('non-owner cannot add an address to the whitelist via uverify_whitelist_add', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets whitelist policy with ADDR_OTHER only
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          uverify_update_whitelist: ADDR_OTHER,
          marker: 'CERT1_OWNER',
        },
      },
      // cert 2: ADDR_OTHER (whitelisted) tries to add ADDR_THIRD — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: { uverify_whitelist_add: ADDR_THIRD, marker: 'CERT2_FAKE_ADD' },
      },
      // cert 3: ADDR_THIRD submits — should still be filtered (not actually whitelisted)
      { issuer: ADDR_THIRD, meta: { marker: 'CERT3_STILL_UNLISTED' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert2 (whitelisted) = 2 pages; cert3 must be filtered
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });
    await expect(paginationLink(page, 3)).not.toBeVisible({ timeout: 3000 });

    await expect(
      page.locator('input[value="CERT3_STILL_UNLISTED"]'),
    ).not.toBeVisible();
  });

  test('non-owner cannot remove an address from the whitelist via uverify_whitelist_remove', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner whitelists both ADDR_OTHER and ADDR_THIRD
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          uverify_update_whitelist: `${ADDR_OTHER},${ADDR_THIRD}`,
          marker: 'CERT1_OWNER',
        },
      },
      // cert 2: ADDR_OTHER (whitelisted) tries to remove ADDR_THIRD — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: {
          uverify_whitelist_remove: ADDR_THIRD,
          marker: 'CERT2_FAKE_REMOVE',
        },
      },
      // cert 3: ADDR_THIRD submits — still whitelisted, must be shown
      { issuer: ADDR_THIRD, meta: { marker: 'CERT3_STILL_LISTED' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert2 + cert3 = 3 pages (removal was ignored)
    await expect(paginationLink(page, 3)).toBeVisible({ timeout: 5000 });

    await page.goto(`/verify/${POLICY_HASH}/3`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[value="CERT3_STILL_LISTED"]')).toBeVisible(
      { timeout: 5000 },
    );
  });

  test('non-owner cannot change the policy mode via uverify_policy', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets 'restricted' policy
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'restricted', marker: 'CERT1_OWNER' },
      },
      // cert 2: ADDR_OTHER tries to switch mode to 'append' — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: { uverify_policy: 'append', marker: 'CERT2_FAKE_POLICY' },
      },
      // cert 3: ADDR_OTHER submits content — should still be filtered (restricted)
      { issuer: ADDR_OTHER, meta: { marker: 'CERT3_FILTERED' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // Only cert1 from owner is shown — non-owner policy change had no effect.
    // With a single displayed cert pagination is hidden, so assert on content.
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('input[value="CERT1_OWNER"]'),
    ).toBeVisible({ timeout: 5000 });

    await expect(
      page.locator('input[value="CERT3_FILTERED"]'),
    ).not.toBeVisible();
  });

  test('non-owner cannot freeze the record via uverify_freeze', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets 'append' policy
      { issuer: ADDR_OWNER, meta: { marker: 'CERT1_OWNER' } },
      // cert 2: ADDR_OTHER tries to freeze — must be ignored
      { issuer: ADDR_OTHER, meta: { uverify_freeze: 'true' } },
      // cert 3: owner submits after the fake freeze — must appear
      { issuer: ADDR_OWNER, meta: { marker: 'CERT3_POST_FAKE_FREEZE' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // All 3 certs are shown — fake freeze had no effect
    await expect(paginationLink(page, 3)).toBeVisible({ timeout: 5000 });

    await page.goto(`/verify/${POLICY_HASH}/3`, { waitUntil: 'networkidle' });
    await expect(
      page.locator('input[value="CERT3_POST_FAKE_FREEZE"]'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('non-owner cannot transfer ownership via uverify_transfer_ownership', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner sets 'restricted' policy
      {
        issuer: ADDR_OWNER,
        meta: { uverify_update_policy: 'restricted', marker: 'CERT1_OWNER' },
      },
      // cert 2: ADDR_OTHER tries to transfer ownership to ADDR_THIRD — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: { uverify_transfer_ownership: ADDR_THIRD },
      },
      // cert 3: ADDR_THIRD submits — must be filtered (fake transfer ignored)
      { issuer: ADDR_THIRD, meta: { marker: 'CERT3_FAKE_NEW_OWNER' } },
      // cert 4: real owner still controls — must be shown
      { issuer: ADDR_OWNER, meta: { marker: 'CERT4_REAL_OWNER' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert4 from real owner = 2 pages; cert3 must be filtered
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });
    await expect(paginationLink(page, 3)).not.toBeVisible({ timeout: 3000 });

    await expect(
      page.locator('input[value="CERT3_FAKE_NEW_OWNER"]'),
    ).not.toBeVisible();

    await page.goto(`/verify/${POLICY_HASH}/2`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[value="CERT4_REAL_OWNER"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('owner can remove an address from the whitelist via uverify_whitelist_remove', async ({
    page,
  }) => {
    const certs = makeCerts([
      // cert 1: owner whitelists ADDR_OTHER
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          uverify_update_whitelist: ADDR_OTHER,
          marker: 'CERT1_OWNER',
        },
      },
      // cert 2: ADDR_OTHER submits while whitelisted
      { issuer: ADDR_OTHER, meta: { marker: 'CERT2_WHILE_LISTED' } },
      // cert 3: owner removes ADDR_OTHER from whitelist
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_whitelist_remove: ADDR_OTHER,
          marker: 'CERT3_REMOVAL',
        },
      },
      // cert 4: ADDR_OTHER submits again — now NOT whitelisted, filtered out
      { issuer: ADDR_OTHER, meta: { marker: 'CERT4_AFTER_REMOVAL' } },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert2 (while listed) + cert3 (owner) = 3 pages; cert4 is filtered
    await expect(paginationLink(page, 3)).toBeVisible({ timeout: 5000 });
    await expect(paginationLink(page, 4)).not.toBeVisible({ timeout: 3000 });

    await expect(
      page.locator('input[value="CERT4_AFTER_REMOVAL"]'),
    ).not.toBeVisible();
  });

  test('whitelisted address policy change is not applied until it is actually on the whitelist', async ({
    page,
  }) => {
    // Scenario (certs 1–3 only):
    // cert1: A creates record with whitelist policy (empty whitelist)
    // cert2: B (not yet whitelisted) tries uverify_policy: 'override' — must be ignored
    // cert3: A adds B to whitelist and adds content
    // Expected: mode is still 'whitelist'; cert1 + cert3 are shown (2 pages);
    //           cert2 is filtered because B was not whitelisted at that time.
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          marker: 'CERT1_OWNER',
        },
      },
      // B attempts policy change before being whitelisted — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: { uverify_policy: 'override', marker: 'CERT2_UNAUTHORIZED' },
      },
      // A adds B to whitelist and submits content
      {
        issuer: ADDR_OWNER,
        meta: { uverify_whitelist_add: ADDR_OTHER, marker: 'CERT3_ADDS_B' },
      },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // cert1 + cert3 (both from owner) = 2 pages; cert2 filtered (B not yet listed)
    await expect(paginationLink(page, 2)).toBeVisible({ timeout: 5000 });
    await expect(paginationLink(page, 3)).not.toBeVisible({ timeout: 3000 });

    // cert2's unauthorized content must never appear
    await expect(
      page.locator('input[value="CERT2_UNAUTHORIZED"]'),
    ).not.toBeVisible();
  });

  test('whitelisted address can change the display mode after being added to the whitelist', async ({
    page,
  }) => {
    // Scenario (all 4 certs):
    // cert1: A creates record with whitelist policy (empty whitelist)
    // cert2: B (not yet whitelisted) tries uverify_policy: 'override' — ignored
    // cert3: A adds B to whitelist and submits content
    // cert4: B (now whitelisted) submits uverify_policy: 'override' + content
    // Expected: 'override' mode takes effect → only cert4 shown, no pagination
    const certs = makeCerts([
      {
        issuer: ADDR_OWNER,
        meta: {
          uverify_update_policy: 'whitelist',
          marker: 'CERT1_OWNER',
        },
      },
      // B attempts policy change before being whitelisted — must be ignored
      {
        issuer: ADDR_OTHER,
        meta: { uverify_policy: 'override', marker: 'CERT2_UNAUTHORIZED' },
      },
      // A adds B to whitelist and submits content
      {
        issuer: ADDR_OWNER,
        meta: { uverify_whitelist_add: ADDR_OTHER, marker: 'CERT3_ADDS_B' },
      },
      // B is now whitelisted — policy change takes effect
      {
        issuer: ADDR_OTHER,
        meta: { uverify_policy: 'override', marker: 'CERT4_B_OVERRIDE' },
      },
    ]);
    await setupPolicyCerts(page, certs);

    await page.goto(`/verify/${POLICY_HASH}/1`, { waitUntil: 'networkidle' });

    // 'override' is now active — only the latest cert with content is shown
    await expect(page.locator('input[value="CERT4_B_OVERRIDE"]')).toBeVisible({
      timeout: 5000,
    });

    // No pagination — display collapsed to a single entry
    await expect(paginationLink(page, 2)).not.toBeVisible({ timeout: 3000 });

    // cert2's content (from the unauthorized attempt) must not appear
    await expect(
      page.locator('input[value="CERT2_UNAUTHORIZED"]'),
    ).not.toBeVisible();
  });
});

// ─── Creation Page UI Tests ───────────────────────────────────────────────────

test.describe('Update Policy — Creation Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonMocks(page);
    await page.goto('/create', { waitUntil: 'networkidle' });
  });

  test('Update Policy section is hidden until content is entered', async ({
    page,
  }) => {
    // Before entering any text, the section must not be visible
    await expect(page.getByTestId('update-policy-selector')).not.toBeVisible();

    // Switch to Write Text tab and enter text to produce a hash
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');

    // Now the policy selector should appear
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });
  });

  test('all six policy options are rendered', async ({ page }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');

    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    for (const mode of [
      'append',
      'first',
      'override',
      'restricted',
      'whitelist',
      'accumulate',
    ]) {
      await expect(page.getByTestId(`policy-option-${mode}`)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('append is selected by default (aria-pressed=true)', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // All other options must not be pressed
    for (const mode of [
      'first',
      'override',
      'restricted',
      'whitelist',
      'accumulate',
    ]) {
      await expect(page.getByTestId(`policy-option-${mode}`)).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    }
  });

  test('clicking a policy option activates it and deactivates the previous one', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId('policy-option-override').click();

    await expect(page.getByTestId('policy-option-override')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('whitelist address input is hidden when a non-whitelist mode is selected', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    // append is default — whitelist input must not be present
    await expect(page.getByTestId('policy-whitelist-input')).not.toBeVisible();

    // Override selected — still no whitelist input
    await page.getByTestId('policy-option-override').click();
    await expect(page.getByTestId('policy-whitelist-input')).not.toBeVisible();
  });

  test('whitelist address input appears when whitelist mode is selected', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId('policy-option-whitelist').click();

    await expect(page.getByTestId('policy-whitelist-input')).toBeVisible({
      timeout: 3000,
    });
  });

  test('whitelist address input disappears when switching away from whitelist mode', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId('policy-option-whitelist').click();
    await expect(page.getByTestId('policy-whitelist-input')).toBeVisible({
      timeout: 3000,
    });

    await page.getByTestId('policy-option-first').click();
    await expect(page.getByTestId('policy-whitelist-input')).not.toBeVisible();
  });

  test('selecting the Digital Product Passport template pre-selects the restricted policy', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    // Wait for the template dropdown to include the DPP option
    const select = page.locator('select').first();
    await expect(select).toContainText('Digital Product Passport', {
      timeout: 10000,
    });

    await select.selectOption({ label: 'Digital Product Passport' });

    // The DPP template declares defaultUpdatePolicy = 'restricted'
    await expect(page.getByTestId('policy-option-restricted')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('selecting the Diploma template pre-selects the first policy', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    const select = page.locator('select').first();
    await expect(select).toContainText('Diploma', { timeout: 10000 });
    await select.selectOption({ label: 'Diploma' });

    await expect(page.getByTestId('policy-option-first')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('selecting the Laboratory Report template pre-selects the first policy', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    const select = page.locator('select').first();
    await expect(select).toContainText('Laboratory Report', { timeout: 10000 });
    await select.selectOption({ label: 'Laboratory Report' });

    await expect(page.getByTestId('policy-option-first')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('selecting the Pet Necklace template pre-selects the restricted policy', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    const select = page.locator('select').first();
    await expect(select).toContainText('Pet Necklace', { timeout: 10000 });
    await select.selectOption({ label: 'Pet Necklace' });

    await expect(page.getByTestId('policy-option-restricted')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('switching away from Digital Product Passport resets policy to append', async ({
    page,
  }) => {
    await page.getByText('Write Text').click();
    await page.getByRole('textbox').fill('hello world test');
    await expect(page.getByTestId('update-policy-selector')).toBeVisible({
      timeout: 5000,
    });

    const select = page.locator('select').first();
    await expect(select).toContainText('Digital Product Passport', {
      timeout: 10000,
    });

    // Select DPP — policy should become 'restricted'
    await select.selectOption({ label: 'Digital Product Passport' });
    await expect(page.getByTestId('policy-option-restricted')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );

    // Switch to Default template — policy must reset to 'append'
    await select.selectOption({ label: 'Default' });
    await expect(page.getByTestId('policy-option-append')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 3000 },
    );
    await expect(page.getByTestId('policy-option-restricted')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
