import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ibbjsjvjfeymglpsvgap.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliYmpzanZqZmV5bWdscHN2Z2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMwODM1OCwiZXhwIjoyMDgwODg0MzU4fQ._gIdqP80fwN_6Qu_Pgqi3ecYJHEYuZmJjboBnfs9zv0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const policies = [
    // System Policies
    { policy_name: 'Allianz Well', policy_type: 'Allianz Well', policy_category: 'System' },
    { policy_name: 'AZpire Growth', policy_type: 'AZpire Growth', policy_category: 'System' },
    { policy_name: 'Single Pay/Optimal', policy_type: 'Single Pay/Optimal', policy_category: 'System' },

    // Manual Policies
    { policy_name: 'Eazy Health', policy_type: 'Eazy Health', policy_category: 'Manual' },
    { policy_name: 'Allianz Fundamental Cover', policy_type: 'Allianz Fundamental Cover', policy_category: 'Manual' },
    { policy_name: 'Allianz Secure Pro', policy_type: 'Allianz Secure Pro', policy_category: 'Manual' }
];

async function seedPolicies() {
    console.log('--- Seeding Policies ---');
    for (const p of policies) {
        const { data: existing } = await supabase.from('policy').select('policy_id').eq('policy_name', p.policy_name).maybeSingle();

        if (!existing) {
            const { data, error } = await supabase.from('policy').insert([p]).select();
            if (error) console.error(`Failed to insert ${p.policy_name}:`, error.message);
            else console.log(`Created Policy: ${p.policy_name}`);
        } else {
            console.log(`Policy already exists: ${p.policy_name}`);
        }
    }
}

async function seedSerialNumbers() {
    console.log('\n--- Seeding Serial Numbers ---');

    // Default Pool (20000000 range)
    const defaultStart = 20000001;
    for (let i = 0; i < 10; i++) {
        const serial = (defaultStart + i).toString();
        const { data: existing } = await supabase.from('serial_number').select('serial_id').eq('serial_number', serial).maybeSingle();

        if (!existing) {
            const { error } = await supabase.from('serial_number').insert([{
                serial_number: serial,
                serial_type: 'Default',
                is_issued: false,
                date: new Date().toISOString()
            }]);
            if (error) console.error(`Failed to insert Serial ${serial}:`, error.message);
            else console.log(`Created Default Serial: ${serial}`);
        }
    }

    // Allianz Well Pool (50000000 range)
    const awStart = 50000001;
    for (let i = 0; i < 10; i++) {
        const serial = (awStart + i).toString();
        const { data: existing } = await supabase.from('serial_number').select('serial_id').eq('serial_number', serial).maybeSingle();

        if (!existing) {
            const { error } = await supabase.from('serial_number').insert([{
                serial_number: serial,
                serial_type: 'Allianz Well',
                is_issued: false,
                date: new Date().toISOString()
            }]);
            if (error) console.error(`Failed to insert AW Serial ${serial}:`, error.message);
            else console.log(`Created AZ Well Serial: ${serial}`);
        }
    }
}

async function main() {
    await seedPolicies();
    await seedSerialNumbers();
    console.log('\n✅ Seeding Complete!');
}

main();
