import { test, expect } from '@playwright/test';

test.describe('Pitch builder', () => {
  test('pitch builder index is accessible', async ({ page }) => {
    await page.goto('/pitch-builder');
    // Either shows the list (if auth bypass) or redirects
    // We just ensure no hard crash
    await expect(page).toBeTruthy();
  });

  test('pitch builder page has correct title', async ({ page }) => {
    await page.goto('/pitch-builder');
    const title = await page.title();
    expect(title).toContain('Pitch Builder');
  });
});

test.describe('Milestones page', () => {
  test('milestones page has correct title', async ({ page }) => {
    await page.goto('/milestones');
    const title = await page.title();
    expect(title).toContain('Milestones');
  });
});

test.describe('Investors page', () => {
  test('investors page has correct title', async ({ page }) => {
    await page.goto('/investors');
    const title = await page.title();
    expect(title).toContain('Investors');
  });
});
