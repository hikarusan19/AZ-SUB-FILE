const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const logFile = 'debug_log.txt';

function log(msg) {
    console.log(msg);
    try { fs.appendFileSync(logFile, msg + '\n'); } catch (e) { }
}

async function inspectDB() {
    try { fs.writeFileSync(logFile, '--- Debug Start ---\n'); } catch (e) { }

    log('Checking Tables...');
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (tableError) {
        log('Error fetching tables: ' + tableError.message);
    } else {
        log('Tables found: ' + JSON.stringify(tables.map(t => t.table_name)));
    }

    log('\n--- Checking serial_number columns ---');
    const { data: cols, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'serial_number');

    if (colError) log('Error fetching serial_number columns: ' + colError.message);
    else log('serial_number columns: ' + JSON.stringify(cols.map(c => c.column_name)));

    log('\n--- Checking az_submission columns ---');
    const { data: azCols, error: azColError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'az_submission');

    if (azColError) log('Error fetching az_submission columns: ' + azColError.message);
    else log('az_submission columns: ' + JSON.stringify(azCols.map(c => c.column_name)));
}

inspectDB();
