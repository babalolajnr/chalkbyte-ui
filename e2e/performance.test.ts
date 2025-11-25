import { expect, test } from '@playwright/test';

test.describe('Performance', () => {
	test.describe('Page Load Performance', () => {
		test('home page loads within acceptable time', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/');
			const loadTime = Date.now() - startTime;
			expect(loadTime).toBeLessThan(3000);
		});

		test('login page loads within acceptable time', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/login');
			const loadTime = Date.now() - startTime;
			expect(loadTime).toBeLessThan(3000);
		});

		test('forgot password page loads within acceptable time', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/forgot-password');
			const loadTime = Date.now() - startTime;
			expect(loadTime).toBeLessThan(3000);
		});
	});

	test.describe('Network Performance', () => {
		test('home page makes reasonable number of requests', async ({ page }) => {
			const requests: string[] = [];
			page.on('request', (request) => {
				requests.push(request.url());
			});

			await page.goto('/');
			expect(requests.length).toBeLessThan(50);
		});

		test('no large images are loaded', async ({ page }) => {
			const largeResources: Array<{ url: string; size: number }> = [];
			page.on('response', async (response) => {
				const url = response.url();
				if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
					const headers = response.headers();
					const contentLength = parseInt(headers['content-length'] || '0', 10);
					if (contentLength > 500000) {
						largeResources.push({ url, size: contentLength });
					}
				}
			});

			await page.goto('/');
			expect(largeResources).toHaveLength(0);
		});

		test('resources are requested on page load', async ({ page }) => {
			const scriptRequests: string[] = [];
			page.on('request', (request) => {
				if (request.resourceType() === 'script' || request.resourceType() === 'stylesheet') {
					scriptRequests.push(request.url());
				}
			});

			await page.goto('/');
			expect(scriptRequests.length).toBeGreaterThan(0);
		});

		test('no failed network requests', async ({ page }) => {
			const failedRequests: string[] = [];
			page.on('response', (response) => {
				if (response.status() >= 400) {
					failedRequests.push(response.url());
				}
			});

			await page.goto('/');
			expect(failedRequests).toHaveLength(0);
		});
	});

	test.describe('JavaScript Performance', () => {
		test('no excessive JavaScript execution time', async ({ page }) => {
			await page.goto('/');
			const metrics = await page.evaluate(() => {
				const perfEntries = performance.getEntriesByType('navigation');
				if (perfEntries.length > 0) {
					const nav = perfEntries[0] as PerformanceNavigationTiming;
					return {
						domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
						loadComplete: nav.loadEventEnd - nav.loadEventStart
					};
				}
				return null;
			});

			if (metrics) {
				expect(metrics.domContentLoaded).toBeLessThan(2000);
				expect(metrics.loadComplete).toBeLessThan(3000);
			}
		});

		test('no memory leaks on navigation', async ({ page }) => {
			await page.goto('/');
			const initialMetrics = await page.evaluate(() => {
				const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
				if (perf.memory) {
					return perf.memory.usedJSHeapSize;
				}
				return null;
			});

			for (let i = 0; i < 5; i++) {
				await page.goto('/login');
				await page.goto('/');
			}

			const finalMetrics = await page.evaluate(() => {
				const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
				if (perf.memory) {
					return perf.memory.usedJSHeapSize;
				}
				return null;
			});

			if (initialMetrics && finalMetrics) {
				const memoryIncrease = finalMetrics - initialMetrics;
				const memoryIncreasePercent = (memoryIncrease / initialMetrics) * 100;
				expect(memoryIncreasePercent).toBeLessThan(200);
			}
		});
	});

	test.describe('Core Web Vitals', () => {
		test('measures First Contentful Paint', async ({ page }) => {
			await page.goto('/');
			const fcp = await page.evaluate(() => {
				const entries = performance.getEntriesByName('first-contentful-paint');
				if (entries.length > 0) {
					return entries[0].startTime;
				}
				return null;
			});

			if (fcp !== null) {
				expect(fcp).toBeLessThan(2000);
			}
		});

		test('measures Largest Contentful Paint', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const lcp = await page.evaluate(() => {
				return new Promise((resolve) => {
					const observer = new PerformanceObserver((list) => {
						const entries = list.getEntries();
						const lastEntry = entries[entries.length - 1];
						resolve(lastEntry.startTime);
					});
					observer.observe({ entryTypes: ['largest-contentful-paint'] });
					setTimeout(() => resolve(null), 3000);
				});
			});

			if (lcp !== null) {
				expect(lcp as number).toBeLessThan(2500);
			}
		});

		test('measures Cumulative Layout Shift', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const cls = await page.evaluate(() => {
				return new Promise((resolve) => {
					let clsValue = 0;
					const observer = new PerformanceObserver((list) => {
						for (const entry of list.getEntries()) {
							const layoutShiftEntry = entry as PerformanceEntry & {
								hadRecentInput?: boolean;
								value?: number;
							};
							if (!layoutShiftEntry.hadRecentInput) {
								clsValue += layoutShiftEntry.value || 0;
							}
						}
					});
					observer.observe({ entryTypes: ['layout-shift'] });
					setTimeout(() => resolve(clsValue), 3000);
				});
			});

			expect(cls as number).toBeLessThan(0.1);
		});
	});

	test.describe('Rendering Performance', () => {
		test('page renders without layout thrashing', async ({ page }) => {
			await page.goto('/');
			const reflows = await page.evaluate(() => {
				let count = 0;
				const observer = new PerformanceObserver((list) => {
					count += list.getEntries().length;
				});
				observer.observe({ entryTypes: ['measure'] });
				void document.body.offsetHeight;
				return count;
			});

			expect(reflows).toBeLessThan(100);
		});

		test('smooth scrolling performance', async ({ page }) => {
			await page.goto('/');
			await page.setViewportSize({ width: 1280, height: 720 });

			const startTime = Date.now();
			await page.evaluate(() => {
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
			});
			await page.waitForTimeout(1000);
			const scrollTime = Date.now() - startTime;

			expect(scrollTime).toBeLessThan(2000);
		});
	});

	test.describe('Asset Optimization', () => {
		test('images are optimized', async ({ page }) => {
			const largeImages: Array<{ url: string; size: number }> = [];
			page.on('response', async (response) => {
				const url = response.url();
				if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
					const headers = response.headers();
					const contentLength = parseInt(headers['content-length'] || '0', 10);
					if (contentLength > 0) {
						largeImages.push({ url, size: contentLength });
					}
				}
			});

			await page.goto('/');

			for (const image of largeImages) {
				expect(image.size).toBeLessThan(500000);
			}
		});

		test('CSS is minified', async ({ page }) => {
			let cssMinified = true;
			page.on('response', async (response) => {
				const url = response.url();
				if (url.endsWith('.css')) {
					const text = await response.text();
					if (text.includes('  ') || text.includes('\n\n')) {
						cssMinified = false;
					}
				}
			});

			await page.goto('/');
			expect(cssMinified).toBe(true);
		});

		test('JavaScript is minified', async ({ page }) => {
			let jsMinified = true;
			page.on('response', async (response) => {
				const url = response.url();
				if (url.endsWith('.js') && !url.includes('node_modules')) {
					const text = await response.text();
					const lines = text.split('\n');
					const avgLineLength = text.length / lines.length;
					if (avgLineLength < 50) {
						jsMinified = false;
					}
				}
			});

			await page.goto('/');
			expect(jsMinified).toBe(true);
		});
	});

	test.describe('Bundle Size', () => {
		test('total page weight is acceptable', async ({ page }) => {
			let totalSize = 0;
			page.on('response', async (response) => {
				const headers = response.headers();
				const contentLength = parseInt(headers['content-length'] || '0', 10);
				totalSize += contentLength;
			});

			await page.goto('/');
			expect(totalSize).toBeLessThan(5000000);
		});

		test('JavaScript bundle size is reasonable', async ({ page }) => {
			let jsSize = 0;
			page.on('response', async (response) => {
				const url = response.url();
				if (url.endsWith('.js')) {
					const headers = response.headers();
					const contentLength = parseInt(headers['content-length'] || '0', 10);
					jsSize += contentLength;
				}
			});

			await page.goto('/');
			expect(jsSize).toBeLessThan(1000000);
		});

		test('CSS bundle size is reasonable', async ({ page }) => {
			let cssSize = 0;
			page.on('response', async (response) => {
				const url = response.url();
				if (url.endsWith('.css')) {
					const headers = response.headers();
					const contentLength = parseInt(headers['content-length'] || '0', 10);
					cssSize += contentLength;
				}
			});

			await page.goto('/');
			expect(cssSize).toBeLessThan(200000);
		});
	});

	test.describe('Time to Interactive', () => {
		test('page becomes interactive quickly', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/');

			await page.waitForLoadState('domcontentloaded');
			const domLoadTime = Date.now() - startTime;
			expect(domLoadTime).toBeLessThan(2000);

			await page.waitForLoadState('networkidle');
			const interactiveTime = Date.now() - startTime;
			expect(interactiveTime).toBeLessThan(5000);
		});

		test('buttons are clickable quickly', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/');
			await page.getByRole('link', { name: 'Login' }).waitFor({ state: 'visible' });
			const timeToInteractive = Date.now() - startTime;
			expect(timeToInteractive).toBeLessThan(3000);
		});
	});
});
