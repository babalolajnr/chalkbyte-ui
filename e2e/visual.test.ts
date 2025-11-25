import { expect, test } from '@playwright/test';

test.describe('Visual Regression', () => {
	test.describe('Home Page', () => {
		test('home page snapshot - desktop', async ({ page }) => {
			await page.goto('/');
			await expect(page).toHaveScreenshot('home-desktop.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});

		test('home page snapshot - mobile', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/');
			await expect(page).toHaveScreenshot('home-mobile.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});

		test('home page light mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'light' });
			await expect(page.locator('body')).toHaveScreenshot('home-light.png');
		});

		test('home page dark mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'dark' });
			await expect(page.locator('body')).toHaveScreenshot('home-dark.png');
		});
	});

	test.describe('Login Page', () => {
		test('login page snapshot', async ({ page }) => {
			await page.goto('/login');
			await expect(page).toHaveScreenshot('login-page.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});

		test('login form focused state', async ({ page }) => {
			await page.goto('/login');
			await page.getByLabel(/email/i).focus();
			await expect(page.locator('form').first()).toHaveScreenshot('login-form-focused.png');
		});

		test('login form with validation errors', async ({ page }) => {
			await page.goto('/login');
			await page.getByRole('button', { name: 'Login', exact: true }).click();
			await page.waitForTimeout(500);
			await expect(page.locator('form').first()).toHaveScreenshot('login-form-errors.png');
		});

		test('login page mobile', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/login');
			await expect(page).toHaveScreenshot('login-mobile.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});
	});

	test.describe('Forgot Password Page', () => {
		test('forgot password page snapshot', async ({ page }) => {
			await page.goto('/forgot-password');
			await expect(page).toHaveScreenshot('forgot-password.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});

		test('forgot password mobile', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/forgot-password');
			await expect(page).toHaveScreenshot('forgot-password-mobile.png', {
				fullPage: true,
				animations: 'disabled'
			});
		});
	});

	test.describe('Component States', () => {
		test('buttons hover state', async ({ page }) => {
			await page.goto('/');
			const button = page.getByRole('link', { name: 'Login' });
			await button.hover();
			await expect(button).toHaveScreenshot('button-hover.png');
		});

		test('mode toggle button', async ({ page }) => {
			await page.goto('/');
			const modeToggle = page
				.locator('button')
				.filter({ hasText: /toggle theme/i })
				.or(page.locator('[aria-label*="theme"]'))
				.first();
			if (await modeToggle.isVisible()) {
				await expect(modeToggle).toHaveScreenshot('mode-toggle.png');
			}
		});
	});

	test.describe('Responsive Design', () => {
		const viewports = [
			{ name: 'mobile-small', width: 320, height: 568 },
			{ name: 'mobile', width: 375, height: 667 },
			{ name: 'tablet', width: 768, height: 1024 },
			{ name: 'desktop', width: 1280, height: 720 },
			{ name: 'desktop-large', width: 1920, height: 1080 }
		];

		for (const viewport of viewports) {
			test(`home page at ${viewport.name}`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto('/');
				await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});

			test(`login page at ${viewport.name}`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto('/login');
				await expect(page).toHaveScreenshot(`login-${viewport.name}.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});
		}
	});

	test.describe('Loading States', () => {
		test('page before full load', async ({ page }) => {
			await page.goto('/', { waitUntil: 'domcontentloaded' });
			await expect(page).toHaveScreenshot('page-loading.png', {
				animations: 'disabled'
			});
		});
	});

	test.describe('Print Styles', () => {
		test('home page print view', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ media: 'print' });
			await expect(page).toHaveScreenshot('home-print.png', {
				fullPage: true
			});
		});

		test('login page print view', async ({ page }) => {
			await page.goto('/login');
			await page.emulateMedia({ media: 'print' });
			await expect(page).toHaveScreenshot('login-print.png', {
				fullPage: true
			});
		});
	});
});
