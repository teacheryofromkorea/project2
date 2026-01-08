import { Link, Outlet, useLocation } from "react-router-dom";
import {
    Home,
    Users,
    BarChart3,
    LogOut
} from "lucide-react";

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", path: "/admin", icon: BarChart3 },
        { name: "Users", path: "/admin/users", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white p-1 rounded-md text-sm">ADMIN</span>
                        Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Mobile Header (visible only on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white h-16 shadow-sm z-20 flex items-center px-4 justify-between">
                <span className="font-bold text-gray-800">Admin Panel</span>
                <Link to="/" className="text-sm text-gray-500">Exit</Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 pt-20 md:pt-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
