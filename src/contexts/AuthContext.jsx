import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Supabase REST API config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch admin status using direct fetch (bypasses Supabase JS client issue)
    const fetchAdminStatus = useCallback(async (userId, accessToken) => {
        if (!userId) {
            console.log("[Auth] No userId provided");
            return false;
        }

        console.log("[Auth] Fetching admin status for:", userId);

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=is_admin`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                console.error("[Auth] Fetch error:", response.status);
                return false;
            }

            const data = await response.json();
            console.log("[Auth] Profile data:", data);

            const isAdmin = data?.[0]?.is_admin || false;
            console.log("[Auth] is_admin:", isAdmin);
            return isAdmin;
        } catch (e) {
            console.error("[Auth] Exception:", e);
            return false;
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            console.warn("[Auth] Supabase client is null");
            setLoading(false);
            return;
        }

        let isMounted = true;

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[Auth] Event:", event, "| User:", session?.user?.email);

            if (!isMounted) return;

            setSession(session);

            if (session?.user) {
                const isAdmin = await fetchAdminStatus(
                    session.user.id,
                    session.access_token
                );

                if (isMounted) {
                    setUser({ ...session.user, is_admin: isAdmin });
                    setLoading(false);
                    console.log("[Auth] ✅ User ready with is_admin:", isAdmin);
                }
            } else {
                setUser(null);
                setLoading(false);
                console.log("[Auth] No session");
            }
        });

        return () => {
            isMounted = false;
            listener?.subscription.unsubscribe();
        };
    }, [fetchAdminStatus]);

    const value = {
        session,
        user,
        loading,
        signOut: async () => {
            await supabase?.auth.signOut();
            setUser(null);
            setSession(null);
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
