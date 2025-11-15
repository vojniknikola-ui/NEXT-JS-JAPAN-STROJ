import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    const migrationSQL = readFileSync(join(__dirname, '../drizzle/0001_add_part_fields.sql'), 'utf-8');
    
    console.log('Applying migration...');
    await client.query(migrationSQL);
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(console.error);
