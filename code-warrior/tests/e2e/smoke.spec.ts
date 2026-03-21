import { expect, test } from '@playwright/test';

test('landing page loads and offers GitHub sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Code Warrior|GitHub RPG|GitHub/i);

  const signInCta = page.getByRole('button', {
    name: /sign in with github|start your adventure/i,
  }).first();

  try {
    await expect(signInCta).toBeVisible({ timeout: 15_000 });
  } catch {
    // NextAuth session fetch can occasionally stall on first load in CI/dev server mode.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(signInCta).toBeVisible({ timeout: 15_000 });
  }
});

test('unauthorized quest claim returns auth error payload', async ({ request }) => {
  const response = await request.post('/api/quests/claim', {
    data: { questId: '123e4567-e89b-12d3-a456-426614174000' },
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.success).toBe(false);
  expect(body.code).toBe('UNAUTHORIZED');
});
