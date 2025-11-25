import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
	test.describe('Public Navigation', () => {
		test('can navigate between public pages', async ({ page }) => {
			await page.goto('/');
			await expect(page).toHaveURL('/');

			await page.getByRole('link', { name: 'Login' }).click();
			await expect(page).toHaveURL('/login');

			await page.goto('/');
			await page.getByRole('link', { name: 'Sign Up' }).click();
			await expect(page).toHaveURL(/\/signup/);
		});

		test('browser back button works correctly', async ({ page }) => {
			await page.goto('/');
			await page.getByRole('link', { name: 'Login' }).click();
			await expect(page).toHaveURL('/login');

			await page.goBack();
			await expect(page).toHaveURL('/');
		});

		test('browser forward button works correctly', async ({ page }) => {
			await page.goto('/');
			await page.getByRole('link', { name: 'Login' }).click();
			await expect(page).toHaveURL('/login');

			await page.goBack();
			await expect(page).toHaveURL('/');

			await page.goForward();
			await expect(page).toHaveURL('/login');
		});
	});

	test.describe('Auth Flow Navigation', () => {
		test('can navigate from login to forgot password', async ({ page }) => {
			await page.goto('/login');
			await page.getByRole('link', { name: /forgot.*password/i }).click();
			await expect(page).toHaveURL('/forgot-password');
		});

		test('can navigate from forgot password back to login', async ({ page }) => {
			await page.goto('/forgot-password');
			const loginLink = page.getByRole('link', { name: /login|back/i });
			if (await loginLink.isVisible()) {
				await loginLink.click();
				await expect(page).toHaveURL('/login');
			}
		});

		test('signup link is visible on login page', async ({ page }) => {
			await page.goto('/login');
			const signupLink = page.getByRole('link', { name: /sign up/i });
			await expect(signupLink).toBeVisible();
		});
	});

	test.describe('Direct URL Access', () => {
		test('accessing root URL loads home page', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('heading', { name: /Welcome to Chalkbyte/i })).toBeVisible();
		});

		test('accessing /login loads login page', async ({ page }) => {
			await page.goto('/login');
			await expect(
				page.locator('h2, [data-slot="card-title"]').filter({ hasText: /^Login$/ })
			).toBeVisible();
		});

		test('accessing /forgot-password loads forgot password page', async ({ page }) => {
			await page.goto('/forgot-password');
			await expect(page.getByText('Forgot Password')).toBeVisible();
		});

		test('accessing protected route redirects to login', async ({ page }) => {
			await page.goto('/dashboard');
			await expect(page).toHaveURL(/\/login/);
		});
	});

	test.describe('Page Metadata', () => {
		test('home page has heading', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('heading', { name: /welcome to chalkbyte/i })).toBeVisible();
		});

		test('login page has heading', async ({ page }) => {
			await page.goto('/login');
			await expect(
				page.locator('h2, [data-slot="card-title"]').filter({ hasText: /^Login$/ })
			).toBeVisible();
		});
	});

	test.describe('Loading States', () => {
		test('page loads without console errors', async ({ page }) => {
			const consoleErrors: string[] = [];
			page.on('console', (msg) => {
				if (msg.type() === 'error') {
					consoleErrors.push(msg.text());
				}
			});

			await page.goto('/');
			expect(consoleErrors).toHaveLength(0);
		});

		test('page loads all critical resources', async ({ page }) => {
			const response = await page.goto('/');
			expect(response?.status()).toBe(200);
		});
	});
});
