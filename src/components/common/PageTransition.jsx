import { motion } from "framer-motion";

/**
 * PageTransition
 * Wraps page content to provide smooth fade/slide animations on route changes.
 */
export default function PageTransition({ children }) {
    return (
        <motion.div
            className="flex-1 flex flex-col h-full min-h-0"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
