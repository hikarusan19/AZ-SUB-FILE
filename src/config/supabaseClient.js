
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibbjsjvjfeymglpsvgap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliYmpzanZqZmV5bWdscHN2Z2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDgzNTgsImV4cCI6MjA4MDg4NDM1OH0.DYh6mxqh83LDJyIShi8rfOihYa_2rZnU_g_5fE6G3rg';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
