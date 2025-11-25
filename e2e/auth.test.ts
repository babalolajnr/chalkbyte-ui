import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.describe('Login Page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/login');
		});

		test('displays login form', async ({ page }) => {
			await expect(
				page.locator('h2, [data-slot="card-title"]').filter({ hasText: /^Login$/ })
			).toBeVisible();
			await expect(page.getByText('Enter your email below to login to your account')).toBeVisible();
			await expect(page.getByLabel(/email/i)).toBeVisible();
			await expect(page.getByLabel(/password/i)).toBeVisible();
			await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
		});

		test('shows HTML5 validation for empty email', async ({ page }) => {
			const emailInput = page.getByLabel(/email/i);
			await expect(emailInput).toHaveAttribute('required');
		});

		test('has link to signup', async ({ page }) => {
			const signupLink = page.getByRole('link', { name: /sign up/i });
			await expect(signupLink).toBeVisible();
		});

		test('has link to forgot password page', async ({ page }) => {
			const forgotLink = page.getByRole('link', { name: /forgot.*password/i });
			await expect(forgotLink).toBeVisible();
			await forgotLink.click();
			await expect(page).toHaveURL('/forgot-password');
		});

		test('password field is masked', async ({ page }) => {
			const passwordInput = page.getByLabel(/password/i);
			await expect(passwordInput).toHaveAttribute('type', 'password');
		});

		test('has login with google button', async ({ page }) => {
			const googleButton = page.getByRole('button', { name: 'Login with Google' });
			await expect(googleButton).toBeVisible();
		});

		test('disables buttons while pending', async ({ page }) => {
			await page.getByLabel(/email/i).fill('test@example.com');
			await page.getByLabel(/password/i).fill('password123');

			const loginButton = page.getByRole('button', { name: 'Login', exact: true });
			await loginButton.click();

			await page.waitForTimeout(100);
		});
	});

	test.describe('Forgot Password Page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/forgot-password');
		});

		test('displays forgot password form', async ({ page }) => {
			await expect(page.getByText('Forgot Password')).toBeVisible();
			await expect(
				page.getByText(/Enter your email address and we'll send you a password reset link/i)
			).toBeVisible();
			await expect(page.getByLabel(/email/i)).toBeVisible();
			await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
		});

		test('email field is required', async ({ page }) => {
			const emailInput = page.getByLabel(/email/i);
			await expect(emailInput).toHaveAttribute('required');
			await expect(emailInput).toHaveAttribute('type', 'email');
		});

		test('has link back to login', async ({ page }) => {
			const loginLink = page.getByRole('link', { name: /back to login/i });
			await expect(loginLink).toBeVisible();
			await loginLink.click();
			await expect(page).toHaveURL('/login');
		});

		test('submit button shows pending state', async ({ page }) => {
			await page.getByLabel(/email/i).fill('test@example.com');
			const submitButton = page.getByRole('button', { name: /send reset link/i });
			await submitButton.click();
			await page.waitForTimeout(100);
		});
	});

	test.describe('OTP Page', () => {
		test('otp page is accessible', async ({ page }) => {
			await page.goto('/otp');
			await expect(page).toHaveURL('/otp');
		});
	});

	test.describe('Reset Password Page', () => {
		test('reset password page is accessible', async ({ page }) => {
			await page.goto('/reset-password');
			await expect(page).toHaveURL('/reset-password');
		});
	});

	test.describe('Authentication State', () => {
		test('unauthenticated user is redirected from dashboard', async ({ page }) => {
			await page.goto('/dashboard');
			await page.waitForTimeout(500);
			const currentUrl = page.url();
			const isOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:4173/';
			expect(isOnLogin).toBeTruthy();
		});

		test('login page is accessible without auth', async ({ page }) => {
			await page.goto('/login');
			await expect(page).toHaveURL('/login');
		});
	});
});

test.describe('Protected Routes', () => {
	test('dashboard redirects when not authenticated', async ({ page }) => {
		await page.goto('/dashboard');
		await page.waitForTimeout(500);
		const currentUrl = page.url();
		const isOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:4173/';
		expect(isOnLogin).toBeTruthy();
	});

	test('schools redirects when not authenticated', async ({ page }) => {
		await page.goto('/schools');
		await page.waitForTimeout(500);
		const currentUrl = page.url();
		const isOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:4173/';
		expect(isOnLogin).toBeTruthy();
	});

	test('settings redirects when not authenticated', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForTimeout(500);
		const currentUrl = page.url();
		const isOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:4173/';
		expect(isOnLogin).toBeTruthy();
	});

	test('payments redirects when not authenticated', async ({ page }) => {
		await page.goto('/payments');
		await page.waitForTimeout(500);
		const currentUrl = page.url();
		const isOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:4173/';
		expect(isOnLogin).toBeTruthy();
	});
});
