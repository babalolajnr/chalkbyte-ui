import { type Page } from '@playwright/test';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface SignupData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	confirmPassword?: string;
}

export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
	await page.goto('/login');
	await page.getByLabel(/email/i).fill(credentials.email);
	await page.getByLabel(/password/i).fill(credentials.password);
	await page.getByRole('button', { name: /login/i }).click();
	await page.waitForURL('/dashboard', { timeout: 5000 }).catch(() => {});
}

export async function signup(page: Page, data: SignupData): Promise<void> {
	await page.goto('/signup');
	await page.getByLabel(/email/i).fill(data.email);
	await page.getByLabel(/first.*name/i).fill(data.firstName);
	await page.getByLabel(/last.*name/i).fill(data.lastName);
	await page.getByLabel(/^password/i).fill(data.password);
	if (data.confirmPassword) {
		await page.getByLabel(/confirm.*password/i).fill(data.confirmPassword);
	}
	await page.getByRole('button', { name: /sign up|create/i }).click();
}

export async function logout(page: Page): Promise<void> {
	const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
	if (await logoutButton.isVisible()) {
		await logoutButton.click();
	}
}

export async function isAuthenticated(page: Page): Promise<boolean> {
	const dashboardLink = page.getByRole('link', { name: /dashboard/i });
	const loginLink = page.getByRole('link', { name: /login/i });

	const hasDashboard = await dashboardLink.isVisible().catch(() => false);
	const hasLogin = await loginLink.isVisible().catch(() => false);

	return hasDashboard && !hasLogin;
}

export async function forgotPassword(page: Page, email: string): Promise<void> {
	await page.goto('/forgot-password');
	await page.getByLabel(/email/i).fill(email);
	await page.getByRole('button', { name: /send|reset|submit/i }).click();
}

export async function resetPassword(page: Page, password: string): Promise<void> {
	await page.goto('/reset-password');
	await page.getByLabel(/new.*password/i).fill(password);
	await page.getByLabel(/confirm.*password/i).fill(password);
	await page.getByRole('button', { name: /reset|submit/i }).click();
}

export async function verifyOTP(page: Page, otp: string): Promise<void> {
	await page.goto('/otp');
	const otpInputs = page.locator('input[type="text"], input[type="number"]');
	const count = await otpInputs.count();

	if (count === 1) {
		await otpInputs.first().fill(otp);
	} else {
		for (let i = 0; i < Math.min(otp.length, count); i++) {
			await otpInputs.nth(i).fill(otp[i]);
		}
	}

	await page.getByRole('button', { name: /verify|submit/i }).click();
}

export function getTestCredentials(): LoginCredentials {
	return {
		email: 'test@example.com',
		password: 'TestPassword123!'
	};
}

export function getTestSignupData(): SignupData {
	const timestamp = Date.now();
	return {
		email: `test${timestamp}@example.com`,
		password: 'TestPassword123!',
		firstName: 'Test',
		lastName: 'User',
		confirmPassword: 'TestPassword123!'
	};
}
