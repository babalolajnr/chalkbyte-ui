#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const snapshotDirs = [
	join(projectRoot, 'e2e', 'visual.test.ts-snapshots'),
	join(projectRoot, 'e2e', '__screenshots__')
];

async function cleanupSnapshots() {
	console.log('🧹 Cleaning up Playwright snapshots and test artifacts...\n');

	let cleanedCount = 0;
	let skippedCount = 0;
	let failedCount = 0;

	for (const dir of snapshotDirs) {
		if (existsSync(dir)) {
			try {
				await rm(dir, { recursive: true, force: true });
				console.log(`✓ Removed: ${dir.replace(projectRoot, '.')}`);
				cleanedCount++;
			} catch (error) {
				console.error(`✗ Failed to remove ${dir}:`, error.message);
				failedCount++;
			}
		} else {
			console.log(`⊘ Not found: ${dir.replace(projectRoot, '.')}`);
			skippedCount++;
		}
	}

	console.log('\n📊 Cleanup Summary:');
	console.log(`   Cleaned: ${cleanedCount}`);
	console.log(`   Skipped: ${skippedCount}`);
	console.log(`   Failed:  ${failedCount}`);
	console.log('\n✨ Cleanup complete!');

	if (failedCount > 0) {
		process.exit(1);
	}
}

cleanupSnapshots().catch((error) => {
	console.error('❌ Cleanup failed:', error);
	process.exit(1);
});
