import { type Page, type Locator, expect } from '@playwright/test';

export async function expectElementVisible(element: Locator, message?: string): Promise<void> {
	await expect(element, message).toBeVisible();
}

export async function expectElementHidden(element: Locator, message?: string): Promise<void> {
	await expect(element, message).not.toBeVisible();
}

export async function expectElementEnabled(element: Locator, message?: string): Promise<void> {
	await expect(element, message).toBeEnabled();
}

export async function expectElementDisabled(element: Locator, message?: string): Promise<void> {
	await expect(element, message).toBeDisabled();
}

export async function expectTextContent(
	element: Locator,
	text: string | RegExp,
	message?: string
): Promise<void> {
	await expect(element, message).toContainText(text);
}

export async function expectExactText(
	element: Locator,
	text: string,
	message?: string
): Promise<void> {
	await expect(element, message).toHaveText(text);
}

export async function expectElementCount(
	locator: Locator,
	count: number,
	message?: string
): Promise<void> {
	await expect(locator, message).toHaveCount(count);
}

export async function expectInputValue(
	input: Locator,
	value: string,
	message?: string
): Promise<void> {
	await expect(input, message).toHaveValue(value);
}

export async function expectCheckboxChecked(checkbox: Locator, message?: string): Promise<void> {
	await expect(checkbox, message).toBeChecked();
}

export async function expectCheckboxUnchecked(checkbox: Locator, message?: string): Promise<void> {
	await expect(checkbox, message).not.toBeChecked();
}

export async function expectElementFocused(element: Locator, message?: string): Promise<void> {
	await expect(element, message).toBeFocused();
}

export async function expectAttribute(
	element: Locator,
	attribute: string,
	value: string | RegExp,
	message?: string
): Promise<void> {
	await expect(element, message).toHaveAttribute(attribute, value);
}

export async function expectClass(
	element: Locator,
	className: string | RegExp,
	message?: string
): Promise<void> {
	await expect(element, message).toHaveClass(className);
}

export async function expectURL(page: Page, url: string | RegExp, message?: string): Promise<void> {
	await expect(page, message).toHaveURL(url);
}

export async function expectTitle(
	page: Page,
	title: string | RegExp,
	message?: string
): Promise<void> {
	await expect(page, message).toHaveTitle(title);
}

export async function expectPageLoaded(page: Page): Promise<void> {
	await page.waitForLoadState('domcontentloaded');
	await page.waitForLoadState('load');
}

export async function expectNoConsoleErrors(page: Page): Promise<void> {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			errors.push(msg.text());
		}
	});

	await page.waitForLoadState('networkidle');
	expect(errors).toHaveLength(0);
}

export async function expectSuccessResponse(page: Page, url: string | RegExp): Promise<void> {
	const response = await page.waitForResponse(url);
	expect(response.status()).toBeLessThan(400);
}

export async function expectErrorResponse(page: Page, url: string | RegExp): Promise<void> {
	const response = await page.waitForResponse(url);
	expect(response.status()).toBeGreaterThanOrEqual(400);
}

export async function expectFormValid(form: Locator): Promise<void> {
	const isValid = await form.evaluate((el) => (el as HTMLFormElement).checkValidity());
	expect(isValid).toBe(true);
}

export async function expectFormInvalid(form: Locator): Promise<void> {
	const isValid = await form.evaluate((el) => (el as HTMLFormElement).checkValidity());
	expect(isValid).toBe(false);
}

export async function expectAriaLabel(
	element: Locator,
	label: string | RegExp,
	message?: string
): Promise<void> {
	await expect(element, message).toHaveAttribute('aria-label', label);
}

export async function expectAriaRole(
	element: Locator,
	role: string,
	message?: string
): Promise<void> {
	await expect(element, message).toHaveAttribute('role', role);
}

export async function expectToastMessage(page: Page, message: string | RegExp): Promise<void> {
	const toast = page.locator('[role="status"], [role="alert"], .toast, [data-sonner-toast]');
	await expect(toast.first()).toBeVisible();
	await expect(toast.first()).toContainText(message);
}

export async function expectErrorMessage(page: Page, message: string | RegExp): Promise<void> {
	const error = page.getByText(message);
	await expect(error.first()).toBeVisible();
}

export async function expectValidationError(page: Page): Promise<void> {
	const error = page.locator('[role="alert"], .error-message, [aria-invalid="true"]');
	await expect(error.first()).toBeVisible();
}

export async function expectLoadingIndicator(page: Page, visible: boolean): Promise<void> {
	const loader = page.locator('[role="progressbar"], .loading, .spinner');
	if (visible) {
		await expect(loader.first()).toBeVisible();
	} else {
		await expect(loader.first()).not.toBeVisible();
	}
}

export async function expectModalOpen(page: Page, title?: string | RegExp): Promise<void> {
	const modal = page.locator('[role="dialog"]');
	await expect(modal).toBeVisible();
	if (title) {
		await expect(modal.getByRole('heading')).toContainText(title);
	}
}

export async function expectModalClosed(page: Page): Promise<void> {
	const modal = page.locator('[role="dialog"]');
	await expect(modal).not.toBeVisible();
}

export async function expectInViewport(element: Locator): Promise<void> {
	await expect(element).toBeInViewport();
}

export async function expectScrollPosition(page: Page, y: number): Promise<void> {
	const scrollY = await page.evaluate(() => window.scrollY);
	expect(scrollY).toBeGreaterThanOrEqual(y - 10);
	expect(scrollY).toBeLessThanOrEqual(y + 10);
}

export async function expectLocalStorageItem(
	page: Page,
	key: string,
	value?: string
): Promise<void> {
	const storageValue = await page.evaluate((k) => localStorage.getItem(k), key);
	if (value !== undefined) {
		expect(storageValue).toBe(value);
	} else {
		expect(storageValue).not.toBeNull();
	}
}

export async function expectSessionStorageItem(
	page: Page,
	key: string,
	value?: string
): Promise<void> {
	const storageValue = await page.evaluate((k) => sessionStorage.getItem(k), key);
	if (value !== undefined) {
		expect(storageValue).toBe(value);
	} else {
		expect(storageValue).not.toBeNull();
	}
}

export async function expectCookie(page: Page, name: string, value?: string): Promise<void> {
	const cookies = await page.context().cookies();
	const cookie = cookies.find((c) => c.name === name);
	expect(cookie).toBeDefined();
	if (value !== undefined) {
		expect(cookie?.value).toBe(value);
	}
}

export async function expectNoCookie(page: Page, name: string): Promise<void> {
	const cookies = await page.context().cookies();
	const cookie = cookies.find((c) => c.name === name);
	expect(cookie).toBeUndefined();
}

export async function expectRedirect(
	page: Page,
	fromURL: string,
	toURL: string | RegExp
): Promise<void> {
	await page.goto(fromURL);
	await expectURL(page, toURL);
}

export async function expectElementBefore(element1: Locator, element2: Locator): Promise<void> {
	const box1 = await element1.boundingBox();
	const box2 = await element2.boundingBox();
	expect(box1).not.toBeNull();
	expect(box2).not.toBeNull();
	if (box1 && box2) {
		expect(box1.y).toBeLessThan(box2.y);
	}
}

export async function expectAccessibleName(element: Locator, name: string | RegExp): Promise<void> {
	const accessibleName = await element.evaluate((el) => {
		return (el as HTMLElement).getAttribute('aria-label') || (el as HTMLElement).textContent;
	});
	if (typeof name === 'string') {
		expect(accessibleName).toContain(name);
	} else {
		expect(accessibleName).toMatch(name);
	}
}
