const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkUsers() {
    const { data: profiles, error } = await supabase.from('profiles').select('username, email, account_type').ilike('account_type', 'AL').limit(2);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(JSON.stringify(profiles, null, 2));
    }
}

checkUsers();
