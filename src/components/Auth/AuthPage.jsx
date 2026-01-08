import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Timeout helper: 10 seconds limit
        const withTimeout = (promise) => {
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("서버 응답이 지연되고 있습니다. 네트워크를 확인하거나 잠시 후 다시 시도해주세요.")), 10000);
            });
            return Promise.race([promise, timeout]);
        };

        try {
            if (isLogin) {
                const { error } = await withTimeout(supabase.auth.signInWithPassword({
                    email,
                    password,
                }));
                if (error) throw error;

                // Navigation happens, AuthContext will handle loading state
                navigate("/attendance");
            } else {
                const { error } = await withTimeout(supabase.auth.signUp({
                    email,
                    password,
                }));
                if (error) throw error;
                alert("회원가입 확인 메일을 전송했습니다! 이메일을 확인해주세요.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">R</div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isLogin ? "선생님, 환영합니다!" : "새로운 학급을 만들어보세요"}
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        {isLogin ? "계정에 로그인하여 학급 관리를 시작하세요." : "이메일로 간편하게 가입하고 무료로 시작하세요."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400"
                            placeholder="teacher@school.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium animate-shake">
                            ⚠️ {error === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                            </span>
                        ) : (
                            isLogin ? "로그인하기" : "무료로 가입하기"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        {isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-blue-600 font-bold hover:underline"
                        >
                            {isLogin ? "회원가입" : "로그인"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
