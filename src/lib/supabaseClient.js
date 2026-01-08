import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Client for graceful failure when env vars are missing
const createMockClient = () => {
    console.warn("⚠️ Supabase Credentials Missing! Using Mock Client.");

    const mockBuilder = new Proxy({}, {
        get: (target, prop) => {
            // If 'then' is accessed, behave like a Promise resolving to error
            if (prop === 'then') {
                return (resolve) => {
                    console.warn("Supabase Mock Call: returning error");
                    resolve({ data: null, error: { message: "Supabase not configured in .env" } });
                };
            }
            // Otherwise return function that returns self (chaining)
            return () => mockBuilder;
        }
    });

    return {
        from: () => mockBuilder,
        rpc: () => mockBuilder,
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: async () => ({ error: { message: "Supabase credentials missing" } }),
            signUp: async () => ({ error: { message: "Supabase credentials missing" } }),
            signOut: async () => ({ error: null }),
            getUser: async () => ({ data: { user: null } }),
            admin: {
                deleteUser: async () => ({ error: { message: "Supabase credentials missing" } })
            }
        }
    };
};

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : createMockClient();

// Debug: expose to window for console testing
if (typeof window !== 'undefined') {
    window.__SUPABASE__ = supabase;
    console.log("[Debug] Supabase client exposed as window.__SUPABASE__");
}

