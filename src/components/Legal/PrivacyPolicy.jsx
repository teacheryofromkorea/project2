import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') navigate('/');
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 py-4">
                <div className="container mx-auto px-6 max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">R</div>
                        <span className="text-xl font-bold text-slate-900">Class Routine</span>
                    </div>
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-900">
                        닫기
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-4xl pt-24 pb-20">
                <h1 className="text-4xl font-black text-slate-900 mb-8">개인정보처리방침</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg font-medium text-slate-700 mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <strong>[서비스명: Class Routine App (우리반 루틴 매니저)]</strong>은(는) 「개인정보 보호법」 및 <strong>교육부의 '학습지원 소프트웨어 선정 기준 및 가이드라인'</strong>을 준수합니다.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">1. 개인정보의 수집 항목 및 목적 (최소처리 원칙 준수)</h2>
                        <p>서비스는 학급 관리 목적을 달성하기 위해 필요한 최소한의 정보만을 처리합니다.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600 bg-slate-50 p-5 rounded-lg">
                            <li><strong>가입 회원(교사)</strong>: 이메일 주소(ID), 비밀번호(암호화 저장) - 회원 식별 및 관리 목적.</li>
                            <li><strong>학생 정보(교사 등록)</strong>: 이름, 출석 번호, 성별 - 성별 맞춤형 좌석 배치 지원, 학급 운영 통계 산출 및 학생 식별 목적.</li>
                            <li className="text-red-600 font-bold bg-red-50 inline-block px-2 rounded">중요: 주민등록번호, 주소 등 민감한 고유 식별 정보는 일절 수집하지 않습니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">2. 개인정보의 보유 및 이용 기간</h2>
                        <p>이용자의 개인정보는 회원 탈퇴 시 또는 해당 학년도 종료 시까지 보유하며, 목적 달성 시 지체 없이 파기합니다.</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">3. 개인정보 처리 업무의 위탁</h2>
                        <p>서비스의 안정적인 데이터 보관을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>수탁자</strong>: Supabase Inc.</li>
                            <li><strong>위탁 업무</strong>: 데이터베이스 저장 및 관리, 사용자 인증 시스템 운영.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">4. 개인정보의 제3자 제공</h2>
                        <p>본 서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. (단, 법령의 규정에 의거하거나 수사 기관의 정당한 요청이 있는 경우는 예외로 합니다).</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">5. 이용자 및 법정대리인의 권리와 행사 방법</h2>
                        <p>이용자 및 법정대리인은 언제든지 자신의 정보를 열람·정정·삭제·처리정지를 요구할 수 있는 절차가 마련되어 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>만 14세 미만 아동 보호</strong>: 초등학생 정보를 처리함에 있어 법정대리인(학부모)의 동의를 확인하는 절차를 준수합니다. 교사는 보호자 동의를 얻은 후 학생 정보를 등록해야 합니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">6. 개인정보의 안전성 확보 조치</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>기술적 조치</strong>: 모든 데이터 통신은 HTTPS 암호화 구간을 통하며, 비밀번호는 단방향 암호화되어 저장됩니다.</li>
                            <li><strong>관리적 조치</strong>: 개인정보 취급자의 접근 권한을 최소화하여 관리합니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">7. 개인정보 보호책임자</h2>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <p className="mb-2">서비스 이용 중 발생하는 모든 개인정보보호 관련 민원을 개인정보 보호책임자에게 신고하실 수 있습니다.</p>
                            <ul className="list-none space-y-2 font-medium text-slate-800 mt-4">
                                <li>성명: Team Routine</li>
                                <li>연락처: <a href="mailto:youngyo.park@gmail.com" className="text-blue-600 hover:underline">youngyo.park@gmail.com</a></li>
                            </ul>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-8 bg-slate-50 border-t border-slate-200 text-center text-sm text-slate-400">
                © 2026 Class Routine Team. All rights reserved.
            </footer>
        </div>
    );
}
