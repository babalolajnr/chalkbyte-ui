import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
	test('has expected h1', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('h1')).toContainText('Welcome to Chalkbyte');
	});

	test('displays login and signup buttons when not authenticated', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
	});

	test('has mode toggle button', async ({ page }) => {
		await page.goto('/');
		const modeToggle = page
			.locator('button')
			.filter({ hasText: /toggle theme/i })
			.or(page.locator('[aria-label*="theme"]'))
			.or(page.locator('.mode-toggle'))
			.first();
		await expect(modeToggle).toBeVisible();
	});

	test('displays tagline', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Your comprehensive learning management system')).toBeVisible();
	});

	test('login button navigates to login page', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Login' }).click();
		await expect(page).toHaveURL('/login');
	});

	test('signup button is visible', async ({ page }) => {
		await page.goto('/');
		const signupButton = page.getByRole('link', { name: 'Sign Up' });
		await expect(signupButton).toBeVisible();
	});
});
