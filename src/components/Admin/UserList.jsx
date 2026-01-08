import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Trash2, Shield, ShieldOff } from "lucide-react";

// Supabase REST API config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function UserList() {
    const { session } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Get the user's access token (or fall back to anon key for read operations)
    const getAuthToken = () => session?.access_token || SUPABASE_ANON_KEY;

    useEffect(() => {
        fetchUsers();
    }, [session]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleAdminStatus(userId, currentStatus) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ is_admin: !currentStatus })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Update failed:", response.status, errorText);
                throw new Error('Failed to update user');
            }

            alert(currentStatus ? "관리자 권한이 해제되었습니다." : "관리자로 승격되었습니다.");
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            alert("권한 변경에 실패했습니다.");
        }
    }

    async function deleteUser(e, userId, email) {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = window.confirm(`정말 ${email} 사용자를 삭제하시겠습니까?\n\n⚠️ 프로필만 삭제됩니다. (인증 계정은 유지됨)`);
        if (!confirmed) return;

        console.log("Deleting user:", userId);

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Prefer': 'return=minimal'
                    }
                }
            );

            console.log("Delete response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Delete failed:", response.status, errorText);
                throw new Error('Failed to delete user');
            }

            alert("사용자 프로필이 삭제되었습니다.");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("사용자 삭제에 실패했습니다.");
        }
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
                    <p className="text-gray-500 mt-1">등록된 선생님들을 관리합니다.</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="이메일 검색..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-6 py-4">이메일</th>
                                <th className="px-6 py-4">사용자명</th>
                                <th className="px-6 py-4">역할</th>
                                <th className="px-6 py-4">가입일</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">사용자가 없습니다.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">{user.email}</td>
                                        <td className="px-6 py-4">{user.username || "-"}</td>
                                        <td className="px-6 py-4">
                                            {user.is_admin ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    관리자
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    선생님
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(user.created_at).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_admin
                                                        ? 'text-amber-600 hover:bg-amber-50'
                                                        : 'text-indigo-600 hover:bg-indigo-50'
                                                        }`}
                                                    title={user.is_admin ? "관리자 권한 해제" : "관리자로 승격"}
                                                >
                                                    {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => deleteUser(e, user.id, user.email)}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                    title="사용자 삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
