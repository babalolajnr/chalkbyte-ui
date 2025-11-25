import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

async function globalTeardown() {
	console.log('\n🧹 Running global teardown...');

	// Small delay to ensure all Playwright processes have finished writing
	await new Promise((resolve) => setTimeout(resolve, 100));

	const snapshotDirs = [
		join(process.cwd(), 'e2e', 'visual.test.ts-snapshots'),
		join(process.cwd(), 'e2e', '__screenshots__')
	];

	const cleanupPromises = snapshotDirs.map(async (dir) => {
		if (existsSync(dir)) {
			try {
				await rm(dir, { recursive: true, force: true });
				console.log(`  ✓ Cleaned: ${dir.replace(process.cwd(), '.')}`);
				return true;
			} catch (error: any) {
				console.error(`  ✗ Failed to clean ${dir}:`, error?.message || error);
				return false;
			}
		}
		return true;
	});

	await Promise.all(cleanupPromises);
	console.log('✨ Teardown complete!\n');
}

export default globalTeardown;
