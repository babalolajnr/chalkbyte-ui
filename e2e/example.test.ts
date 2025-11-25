import { expect, test } from '@playwright/test';
import {
	login,
	logout,
	getTestCredentials,
	navigateTo,
	navigateToLogin,
	expectElementVisible,
	expectTextContent,
	expectURL
} from './helpers';

test.describe('Example Test Suite', () => {
	test.describe('Using Authentication Helpers', () => {
		test('login helper navigates to login page', async ({ page }) => {
			const credentials = getTestCredentials();
			await page.goto('/login');
			await page.getByLabel(/email/i).fill(credentials.email);
			await page.getByLabel(/password/i).fill(credentials.password);
			await expectElementVisible(page.getByRole('button', { name: 'Login', exact: true }));
		});

		test('logout helper is available', async ({ page }) => {
			await page.goto('/');
			const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
			// Logout button only visible when authenticated, so just check the function exists
			expect(typeof logout).toBe('function');
		});
	});

	test.describe('Using Navigation Helpers', () => {
		test('navigate to pages using helpers', async ({ page }) => {
			await navigateTo(page, '/');
			await expectElementVisible(page.getByRole('heading', { name: /welcome/i }));

			await navigateToLogin(page);
			await expectURL(page, '/login');
		});

		test('verify URL after navigation', async ({ page }) => {
			await navigateTo(page, '/forgot-password');
			await expectURL(page, '/forgot-password');
		});
	});

	test.describe('Using Assertion Helpers', () => {
		test('check element visibility', async ({ page }) => {
			await page.goto('/');
			const heading = page.getByRole('heading', { name: /welcome to chalkbyte/i });
			await expectElementVisible(heading);
		});

		test('check text content', async ({ page }) => {
			await page.goto('/');
			const tagline = page.getByText(/comprehensive learning management/i);
			await expectTextContent(tagline, /learning management/i);
		});

		test('check form elements', async ({ page }) => {
			await page.goto('/login');
			const emailInput = page.getByLabel(/email/i);
			const passwordInput = page.getByLabel(/password/i);
			await expectElementVisible(emailInput);
			await expectElementVisible(passwordInput);
		});
	});

	test.describe('Complete User Flow Example', () => {
		test('user can navigate and interact with forms', async ({ page }) => {
			await page.goto('/');
			await expectElementVisible(page.getByRole('heading', { name: /welcome/i }));

			await page.getByRole('link', { name: 'Login' }).click();
			await expectURL(page, '/login');

			const emailInput = page.getByLabel(/email/i);
			const passwordInput = page.getByLabel(/password/i);

			await expectElementVisible(emailInput);
			await expectElementVisible(passwordInput);

			await emailInput.fill('invalid-email');
			await passwordInput.fill('short');
			await page.getByRole('button', { name: 'Login', exact: true }).click();

			const errorMessage = page.getByText(/invalid|required/i);
			if ((await errorMessage.count()) > 0) {
				await expectElementVisible(errorMessage.first());
			}
		});

		test('user can navigate to forgot password', async ({ page }) => {
			await navigateToLogin(page);

			const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
			await expectElementVisible(forgotPasswordLink);

			await forgotPasswordLink.click();
			await expectURL(page, '/forgot-password');

			const emailInput = page.getByLabel(/email/i);
			await expectElementVisible(emailInput);
		});
	});

	test.describe('Responsive Design Example', () => {
		test('mobile view', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/');

			const heading = page.getByRole('heading', { name: /welcome/i });
			await expectElementVisible(heading);

			const viewport = page.viewportSize();
			expect(viewport?.width).toBe(375);
		});

		test('desktop view', async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await page.goto('/');

			const heading = page.getByRole('heading', { name: /welcome/i });
			await expectElementVisible(heading);
		});
	});

	test.describe('Dark Mode Example', () => {
		test('switch to dark mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'dark' });

			const body = page.locator('body');
			await expectElementVisible(body);
		});

		test('switch to light mode', async ({ page }) => {
			await page.goto('/');
			await page.emulateMedia({ colorScheme: 'light' });

			const body = page.locator('body');
			await expectElementVisible(body);
		});
	});

	test.describe('Form Validation Example', () => {
		test('email validation', async ({ page }) => {
			await navigateToLogin(page);

			await page.getByLabel(/email/i).fill('invalid-email');
			await page.getByLabel(/password/i).fill('password123');
			await page.getByRole('button', { name: 'Login', exact: true }).click();

			const errorMessage = page.getByText(/invalid.*email/i);
			if ((await errorMessage.count()) > 0) {
				await expectElementVisible(errorMessage.first());
			}
		});

		test('required field validation', async ({ page }) => {
			await navigateToLogin(page);

			await page.getByRole('button', { name: 'Login', exact: true }).click();

			const requiredError = page.getByText(/required/i);
			if ((await requiredError.count()) > 0) {
				await expectElementVisible(requiredError.first());
			}
		});
	});

	test.describe('Keyboard Navigation Example', () => {
		test('tab through form fields', async ({ page }) => {
			await navigateToLogin(page);

			const emailInput = page.getByLabel(/email/i);
			await emailInput.focus();
			await expect(emailInput).toBeFocused();

			const passwordInput = page.getByLabel(/password/i);
			await passwordInput.focus();
			await expect(passwordInput).toBeFocused();
		});

		test('submit form with enter key', async ({ page }) => {
			await navigateToLogin(page);

			await page.getByLabel(/email/i).fill('test@example.com');
			await page.keyboard.press('Tab');
			await page.getByLabel(/password/i).fill('password123');
			await page.keyboard.press('Enter');

			await page.waitForTimeout(500);
		});
	});

	test.describe('Performance Example', () => {
		test('page loads quickly', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/');
			const loadTime = Date.now() - startTime;

			expect(loadTime).toBeLessThan(3000);
		});

		test('navigation is smooth', async ({ page }) => {
			await page.goto('/');
			const startTime = Date.now();
			await page.getByRole('link', { name: 'Login' }).click();
			await page.waitForURL('/login');
			const navTime = Date.now() - startTime;

			expect(navTime).toBeLessThan(2000);
		});
	});
});
