import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Users, UserPlus, Clock } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        loading: true
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Total Users
                const { count: totalCount, error: totalError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. New Users Today
                const today = new Date().toISOString().split('T')[0];
                const { count: todayCount, error: todayError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today);

                if (totalError) throw totalError;

                setStats({
                    totalUsers: totalCount || 0,
                    newUsersToday: todayCount || 0,
                    loading: false
                });

            } catch (error) {
                console.error("Error fetching admin stats:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        }

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.loading ? "..." : value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="New Users Today"
                    value={stats.newUsersToday}
                    icon={UserPlus}
                    color="bg-green-500"
                />
                <StatCard
                    title="System Status"
                    value="Healthy"
                    icon={Clock}
                    color="bg-indigo-500"
                />
            </div>

            {/* Recent Activity Section Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Growth (Last 30 Days)</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">Chart visualization coming soon...</p>
                </div>
            </div>
        </div>
    );
}
