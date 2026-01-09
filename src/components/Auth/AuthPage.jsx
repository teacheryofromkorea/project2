import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = "0x4AAAAAACLbh8kTgXZfdxt1";

export default function AuthPage() {
    const navigate = useNavigate();
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    // 약관 동의 상태
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeAll, setAgreeAll] = useState(false);

    // Google 로그인 시 약관 동의 표시
    const [showTermsForGoogle, setShowTermsForGoogle] = useState(false);

    // CAPTCHA 토큰
    const [captchaToken, setCaptchaToken] = useState(null);

    const handleAgreeAll = (checked) => {
        setAgreeAll(checked);
        setAgreeTerms(checked);
        setAgreePrivacy(checked);
    };

    const isAgreementComplete = agreeTerms && agreePrivacy;

    // Google 로그인 처리
    const handleGoogleLogin = async () => {
        if (isLogin && !showTermsForGoogle) {
            setShowTermsForGoogle(true);
            return;
        }

        if (!isAgreementComplete) {
            setError("필수 약관에 모두 동의해주세요.");
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/attendance`,
            },
        });

        if (error) {
            console.error("Google login error:", error);
            alert("로그인에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!isLogin && !isAgreementComplete) {
            setError("필수 약관에 모두 동의해주세요.");
            return;
        }

        // 회원가입 시 CAPTCHA 토큰 필수
        if (!isLogin && !captchaToken) {
            setError("보안 인증을 완료해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        const withTimeout = (promise) => {
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.")), 10000);
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
                navigate("/attendance");
            } else {
                // 회원가입 시 CAPTCHA 토큰 포함
                const { error } = await withTimeout(supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        captchaToken,
                    },
                }));
                if (error) throw error;
                alert("회원가입이 완료되었습니다! 이제 로그인해주세요.");
                setIsLogin(true);
                setPassword("");
                setCaptchaToken(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setAgreeAll(false);
        setAgreeTerms(false);
        setAgreePrivacy(false);
        setShowTermsForGoogle(false);
        setCaptchaToken(null);
        setError(null);
    };

    // 약관 동의 섹션 컴포넌트
    const TermsSection = () => (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-3">
                {isLogin ? "첫 로그인 시 약관 동의가 필요합니다" : "회원가입을 위해 약관에 동의해주세요"}
            </div>
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer pb-3 border-b border-slate-200">
                    <input
                        type="checkbox"
                        checked={agreeAll}
                        onChange={(e) => handleAgreeAll(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">전체 동의하기</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            setAgreeAll(e.target.checked && agreePrivacy);
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">
                        <span className="text-red-500 font-medium">[필수]</span>{" "}
                        <a href="/terms" target="_blank" className="text-blue-600 hover:underline">이용약관</a> 동의
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => {
                            setAgreePrivacy(e.target.checked);
                            setAgreeAll(agreeTerms && e.target.checked);
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">
                        <span className="text-red-500 font-medium">[필수]</span>{" "}
                        <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">개인정보 처리방침</a> 동의
                    </span>
                </label>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-5 shadow-lg shadow-blue-200">
                        R
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isLogin ? "선생님, 환영합니다!" : "새로운 학급을 만들어보세요"}
                    </h1>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                        {isLogin ? "간편하게 로그인하세요" : "회원가입 후 무료로 시작하세요"}
                    </p>
                </div>

                {/* 회원가입 모드 또는 Google 로그인 시 약관 표시 */}
                {(!isLogin || showTermsForGoogle) && <TermsSection />}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                        ⚠️ {error === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : error}
                    </div>
                )}

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {showTermsForGoogle ? "동의하고 Google로 로그인" : `Google로 ${isLogin ? "로그인" : "가입"}하기`}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">또는</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Email Login Section */}
                {!showEmailForm ? (
                    <button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-all"
                    >
                        이메일로 {isLogin ? "로그인" : "가입"}하기
                    </button>
                ) : (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
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

                        {/* CAPTCHA - 회원가입 시에만 표시 */}
                        {!isLogin && (
                            <div className="flex justify-center">
                                <Turnstile
                                    siteKey={TURNSTILE_SITE_KEY}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                    onError={() => {
                                        setError("보안 인증에 실패했습니다. 새로고침 후 다시 시도해주세요.");
                                        setCaptchaToken(null);
                                    }}
                                    onExpire={() => setCaptchaToken(null)}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!isLogin && !captchaToken)}
                            className="w-full py-3.5 rounded-lg bg-blue-600 text-white font-bold text-base hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "처리 중..." : (isLogin ? "로그인하기" : "가입하기")}
                        </button>
                    </form>
                )}

                {/* 모드 전환 */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
                    </button>
                </div>
            </div>
        </div>
    );
}
