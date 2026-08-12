// Single Supabase client for the whole app.
//
// The underlying client is created by the managed integration
// (`src/integrations/supabase/client.ts`) from environment variables —
// VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (alias:
// VITE_SUPABASE_ANON_KEY). Keys are never hardcoded and the service-role key
// is never referenced from browser code.
import { supabase } from "@/integrations/supabase/client";

export { supabase };
export default supabase;
