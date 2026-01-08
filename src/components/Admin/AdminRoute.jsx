import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                />
            </div>
        );
    }

    if (!user || !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
