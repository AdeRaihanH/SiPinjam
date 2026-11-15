import { createApp } from '../src/app.js';
import { createModels } from '../src/models/index.js';
import { supabase } from '../src/config/supabaseClient.js';

const app = createApp(createModels(supabase));

export default app;
