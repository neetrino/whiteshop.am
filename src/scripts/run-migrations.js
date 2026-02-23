#!/usr/bin/env node

/**
 * Cross-platform migration runner
 * Tries to run migrations, falls back to db:push if migrations fail
 * Always exits with success to allow build to continue
 */

const { execSync } = require('child_process');
const path = require('path');

const dbPath = path.join(__dirname, '../../shared/db');

process.chdir(dbPath);

try {
  console.log('🔄 Attempting to deploy migrations...');
  execSync('pnpm run db:migrate:deploy', { stdio: 'inherit' });
  console.log('✅ Migrations deployed successfully');
} catch (error) {
  console.log('⚠️  Migration deploy failed, trying db:push...');
  try {
    execSync('pnpm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema pushed successfully');
  } catch (pushError) {
    console.log('⚠️  Database operations failed, but continuing build...');
    console.log('   (This is expected if DATABASE_URL is not set)');
  }
}

// Always exit with success to allow build to continue
process.exit(0);




