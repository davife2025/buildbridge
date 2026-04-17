import { test, expect } from '@playwright/test';

const API_URL = process.env['E2E_API_URL'] ?? 'http://localhost:4000';

test.describe('API health', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.ok()).toBe(true);
    const body = await res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('buildbridge-api');
  });

  test('unknown routes return 404', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/unknown-route`);
    expect(res.status()).toBe(404);
  });

  test('auth challenge requires a public key', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/auth/challenge`);
    expect(res.status()).toBe(400);
  });

  test('protected routes reject missing token', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('investor list is publicly accessible', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/investors`);
    expect(res.ok()).toBe(true);
    const body = await res.json() as { investors: unknown[] };
    expect(Array.isArray(body.investors)).toBe(true);
  });

  test('public profile returns 404 for unknown founder', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/profiles/nonexistent-id`);
    expect(res.status()).toBe(404);
  });
});
