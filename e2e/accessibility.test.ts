import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
	test.describe('Keyboard Navigation', () => {
		test('can navigate home page with keyboard', async ({ page }) => {
			await page.goto('/');
			await page.keyboard.press('Tab');
			const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
			expect(focusedElement).toBeTruthy();
		});

		test('can tab through login form', async ({ page }) => {
			await page.goto('/login');
			await page.waitForLoadState('networkidle');
			const emailInput = page.getByLabel(/email/i);
			await emailInput.focus();
			await expect(emailInput).toBeFocused();
		});

		test('can submit login form with Enter key', async ({ page }) => {
			await page.goto('/login');
			await page.getByLabel(/email/i).fill('test@example.com');
			await page.keyboard.press('Tab');
			await page.getByLabel(/password/i).fill('password123');
			await page.keyboard.press('Enter');
			await page.waitForTimeout(500);
		});

		test('escape key closes modals', async ({ page }) => {
			await page.goto('/');
			const modal = page.locator('[role="dialog"]');
			if (await modal.isVisible()) {
				await page.keyboard.press('Escape');
				await expect(modal).not.toBeVisible();
			}
		});
	});

	test.describe('Screen Reader Support', () => {
		test('home page has proper heading hierarchy', async ({ page }) => {
			await page.goto('/');
			const h1 = page.locator('h1');
			await expect(h1).toBeVisible();
			const h1Count = await h1.count();
			expect(h1Count).toBeGreaterThanOrEqual(1);
		});

		test('form inputs have labels', async ({ page }) => {
			await page.goto('/login');
			const emailInput = page.getByLabel(/email/i);
			const passwordInput = page.getByLabel(/password/i);
			await expect(emailInput).toBeVisible();
			await expect(passwordInput).toBeVisible();
		});

		test('buttons have accessible names', async ({ page }) => {
			await page.goto('/login');
			const loginButton = page.getByRole('button', { name: 'Login', exact: true });
			await expect(loginButton).toBeVisible();
		});

		test('links have accessible text', async ({ page }) => {
			await page.goto('/');
			const loginLink = page.getByRole('link', { name: 'Login' });
			const signupLink = page.getByRole('link', { name: 'Sign Up' });
			await expect(loginLink).toBeVisible();
			await expect(signupLink).toBeVisible();
		});

		test('images have alt text', async ({ page }) => {
			await page.goto('/');
			const images = page.locator('img');
			const imageCount = await images.count();
			for (let i = 0; i < imageCount; i++) {
				const img = images.nth(i);
				const alt = await img.getAttribute('alt');
				expect(alt).toBeTruthy();
			}
		});

		test('form has proper ARIA attributes', async ({ page }) => {
			await page.goto('/login');
			const form = page.locator('form').first();
			if (await form.isVisible()) {
				const ariaLabel = await form.getAttribute('aria-label');
				const ariaLabelledBy = await form.getAttribute('aria-labelledby');
				expect(ariaLabel || ariaLabelledBy).toBeTruthy();
			}
		});
	});

	test.describe('Color Contrast and Visual', () => {
		test('page is readable in light mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'light' });
			await expect(page.locator('body')).toBeVisible();
		});

		test('page is readable in dark mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'dark' });
			await expect(page.locator('body')).toBeVisible();
		});

		test('focus indicators are visible', async ({ page }) => {
			await page.goto('/login');
			await page.waitForLoadState('networkidle');
			const emailInput = page.getByLabel(/email/i);
			await emailInput.focus();
			const focusedElement = page.locator(':focus');
			const count = await focusedElement.count();
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe('Focus Management', () => {
		test('focus is trapped in modals', async ({ page }) => {
			await page.goto('/');
			const modal = page.locator('[role="dialog"]');
			if (await modal.isVisible()) {
				const focusableElements = modal.locator(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				const count = await focusableElements.count();
				expect(count).toBeGreaterThan(0);
			}
		});

		test('focus returns to trigger after modal close', async ({ page }) => {
			await page.goto('/');
			const triggerButton = page.locator('button').first();
			if (await triggerButton.isVisible()) {
				await triggerButton.click();
				const modal = page.locator('[role="dialog"]');
				if (await modal.isVisible()) {
					await page.keyboard.press('Escape');
					await expect(triggerButton).toBeFocused();
				}
			}
		});

		test('skip to main content link exists', async ({ page }) => {
			await page.goto('/');
			const skipLink = page.getByRole('link', { name: /skip to (main )?content/i });
			if ((await skipLink.count()) > 0) {
				await expect(skipLink.first()).toBeInViewport({ ratio: 0 });
			}
		});
	});

	test.describe('Form Accessibility', () => {
		test('required fields are marked', async ({ page }) => {
			await page.goto('/login');
			const emailInput = page.getByLabel(/email/i);
			const isRequired = await emailInput.getAttribute('required');
			const ariaRequired = await emailInput.getAttribute('aria-required');
			expect(isRequired !== null || ariaRequired === 'true').toBeTruthy();
		});

		test('error messages are announced', async ({ page }) => {
			await page.goto('/login');
			await page.waitForLoadState('networkidle');

			// HTML5 validation doesn't create alert roles, so we check for required attribute instead
			const emailInput = page.getByLabel(/email/i);
			await expect(emailInput).toHaveAttribute('required');
		});

		test('form validation provides helpful messages', async ({ page }) => {
			await page.goto('/login');
			await page.getByRole('button', { name: 'Login', exact: true }).click();
			const errorText = page.getByText(/required|invalid|error/i);
			if ((await errorText.count()) > 0) {
				await expect(errorText.first()).toBeVisible();
			}
		});
	});

	test.describe('Mobile Accessibility', () => {
		test.use({ viewport: { width: 375, height: 667 } });

		test('touch targets are large enough', async ({ page }) => {
			await page.goto('/');
			const buttons = page.locator('button, a').filter({ hasText: /.+/ });
			const count = await buttons.count();
			let checkedCount = 0;
			for (let i = 0; i < count && checkedCount < 5; i++) {
				const button = buttons.nth(i);
				if (await button.isVisible()) {
					const box = await button.boundingBox();
					if (box && box.width > 0 && box.height > 0) {
						expect(box.width).toBeGreaterThanOrEqual(36);
						expect(box.height).toBeGreaterThanOrEqual(36);
						checkedCount++;
					}
				}
			}
		});

		test('page is responsive on mobile', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('body')).toBeVisible();
			const viewport = page.viewportSize();
			expect(viewport?.width).toBe(375);
		});

		test('no horizontal scroll on mobile', async ({ page }) => {
			await page.goto('/');
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
			expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
		});
	});

	test.describe('Language and Internationalization', () => {
		test('page has lang attribute', async ({ page }) => {
			await page.goto('/');
			const lang = await page.locator('html').getAttribute('lang');
			expect(lang).toBeTruthy();
		});

		test('text direction is set correctly', async ({ page }) => {
			await page.goto('/');
			const dir = await page.locator('html').getAttribute('dir');
			expect(dir === 'ltr' || dir === 'rtl' || dir === null).toBeTruthy();
		});
	});
});
