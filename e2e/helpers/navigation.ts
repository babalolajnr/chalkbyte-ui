import { type Page, expect } from '@playwright/test';

export async function navigateTo(page: Page, path: string): Promise<void> {
	await page.goto(path);
	await page.waitForLoadState('domcontentloaded');
}

export async function navigateToHome(page: Page): Promise<void> {
	await navigateTo(page, '/');
}

export async function navigateToLogin(page: Page): Promise<void> {
	await navigateTo(page, '/login');
}

export async function navigateToSignup(page: Page): Promise<void> {
	await navigateTo(page, '/signup');
}

export async function navigateToDashboard(page: Page): Promise<void> {
	await navigateTo(page, '/dashboard');
}

export async function navigateToSettings(page: Page): Promise<void> {
	await navigateTo(page, '/settings');
}

export async function navigateToSchools(page: Page): Promise<void> {
	await navigateTo(page, '/schools');
}

export async function navigateToPayments(page: Page): Promise<void> {
	await navigateTo(page, '/payments');
}

export async function navigateToForgotPassword(page: Page): Promise<void> {
	await navigateTo(page, '/forgot-password');
}

export async function navigateToResetPassword(page: Page): Promise<void> {
	await navigateTo(page, '/reset-password');
}

export async function navigateToOTP(page: Page): Promise<void> {
	await navigateTo(page, '/otp');
}

export async function verifyURL(page: Page, expectedPath: string | RegExp): Promise<void> {
	await expect(page).toHaveURL(expectedPath);
}

export async function goBack(page: Page): Promise<void> {
	await page.goBack();
	await page.waitForLoadState('domcontentloaded');
}

export async function goForward(page: Page): Promise<void> {
	await page.goForward();
	await page.waitForLoadState('domcontentloaded');
}

export async function reload(page: Page): Promise<void> {
	await page.reload();
	await page.waitForLoadState('domcontentloaded');
}

export async function clickLink(page: Page, linkText: string): Promise<void> {
	await page.getByRole('link', { name: linkText }).click();
	await page.waitForLoadState('domcontentloaded');
}

export async function clickButton(page: Page, buttonText: string): Promise<void> {
	await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
}

export async function waitForNavigation(page: Page, expectedURL?: string | RegExp): Promise<void> {
	if (expectedURL) {
		await page.waitForURL(expectedURL, { timeout: 5000 });
	} else {
		await page.waitForLoadState('networkidle');
	}
}

export async function getCurrentPath(page: Page): Promise<string> {
	return new URL(page.url()).pathname;
}

export async function getBreadcrumbs(page: Page): Promise<string[]> {
	const breadcrumbs = page.locator('[aria-label="breadcrumb"], nav[aria-label="Breadcrumb"]');
	if (await breadcrumbs.isVisible()) {
		const items = breadcrumbs.locator('a, span');
		const count = await items.count();
		const texts: string[] = [];
		for (let i = 0; i < count; i++) {
			const text = await items.nth(i).textContent();
			if (text) {
				texts.push(text.trim());
			}
		}
		return texts;
	}
	return [];
}

export async function verifyActiveNavItem(page: Page, itemText: string): Promise<void> {
	const navItem = page.getByRole('link', { name: new RegExp(itemText, 'i') });
	await expect(navItem).toHaveAttribute('aria-current', 'page');
}

export async function openSidebar(page: Page): Promise<void> {
	const sidebarToggle = page.getByRole('button', { name: /menu|toggle sidebar/i });
	if (await sidebarToggle.isVisible()) {
		await sidebarToggle.click();
	}
}

export async function closeSidebar(page: Page): Promise<void> {
	const closeButton = page.getByRole('button', { name: /close|dismiss/i });
	if (await closeButton.isVisible()) {
		await closeButton.click();
	}
}
