import { useEffect, useState } from "react";
import { Users, UserPlus, Clock } from "lucide-react";

// Supabase REST API config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        loading: true
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Total Users - using fetch directly
                const totalResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/profiles?select=id`,
                    {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Prefer': 'count=exact'
                        }
                    }
                );
                const totalCount = parseInt(totalResponse.headers.get('content-range')?.split('/')[1] || '0');

                // 2. New Users Today
                const today = new Date().toISOString().split('T')[0];
                const todayResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/profiles?created_at=gte.${today}&select=id`,
                    {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Prefer': 'count=exact'
                        }
                    }
                );
                const todayCount = parseInt(todayResponse.headers.get('content-range')?.split('/')[1] || '0');

                setStats({
                    totalUsers: totalCount,
                    newUsersToday: todayCount,
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
                <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
                <p className="text-gray-500 mt-1">관리자님, 오늘의 현황입니다.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="전체 사용자"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="오늘 가입자"
                    value={stats.newUsersToday}
                    icon={UserPlus}
                    color="bg-green-500"
                />
                <StatCard
                    title="시스템 상태"
                    value="정상"
                    icon={Clock}
                    color="bg-indigo-500"
                />
            </div>

            {/* Recent Activity Section Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">플랫폼 성장 추이 (최근 30일)</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">차트 시각화 준비 중...</p>
                </div>
            </div>
        </div>
    );
}
