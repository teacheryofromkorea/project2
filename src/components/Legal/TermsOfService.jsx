import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
                <h1 className="text-4xl font-black text-slate-900 mb-8">서비스 이용약관</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-500 mb-8">시행일: 2026년 1월 7일</p>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">1. 서비스의 목적 및 정의</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600 bg-slate-50 p-5 rounded-lg">
                            <li><strong>서비스 목적</strong>: 초등학교 학급 운영 및 교육과정 지원을 위한 출결 관리, 루틴 설정, 학생 동기부여(게임화) 기능 제공.</li>
                            <li><strong>이용자 정의</strong>: 학교장의 승인을 받아 정규 교과 및 학급 운영을 위해 서비스를 사용하는 교사.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">2. 가이드라인 준수 및 서비스의 공신력</h2>
                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-slate-700">
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>선정 기준 준수</strong>: 본 서비스는 교육부의 <span className="font-bold text-blue-700">「학습지원 소프트웨어 선정 기준 및 가이드라인」</span>에 따른 필수 기준을 준수함을 명시합니다.</li>
                                <li><strong>증빙 자료 제공</strong>: 학교운영위원회 심의를 위해 필요한 기업용 체크리스트 및 관련 증빙 자료를 제공할 의무를 가집니다.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">3. 이용자의 의무 (교사의 역할)</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>데이터 등록 권한</strong>: 교사는 학생의 이름, 번호 등 교육 활동에 필요한 최소한의 정보를 등록할 권한과 책임이 있습니다.</li>
                            <li><strong>보호자 동의 확인</strong>: 만 14세 미만 학생의 정보를 처리할 경우, 교사는 학교의 절차에 따라 법정대리인(학부모)의 동의를 확인해야 합니다.</li>
                            <li><strong>계정 관리</strong>: 교사는 자신의 계정 정보가 유출되지 않도록 관리해야 하며, 비인가된 제3자에게 공유해서는 안 됩니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">4. 서비스의 권리와 의무 (개발자의 역할)</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>안전성 확보</strong>: 개인정보의 안전한 관리를 위해 기술적·관리적 보호 조치를 시행할 의무가 있습니다.</li>
                            <li><strong>기술 지원</strong>: 사용 환경 적합성 및 접근성을 위해 서비스 안정성을 유지하고, 장애 발생 시 기술 지원(문의 대응)을 제공해야 합니다.</li>
                            <li><strong>데이터 파기</strong>: 서비스 종료 시 또는 보유 기간 만료 시 학생 정보를 지체 없이 파기해야 합니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">5. 게임화 요소 및 콘텐츠 관련 (특화 항목)</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                            <li><strong>콘텐츠 품질</strong>: 제공되는 펫, 상점 아이템 등의 콘텐츠가 학생의 연령에 적합하며 안전함을 보장합니다.</li>
                            <li><strong>서비스 변경</strong>: 학급 운영의 효율성을 위해 기능(가챠, 퀘스트 등)을 수정하거나 업데이트할 수 있으며, 중요 변경 사항은 사전에 고지합니다.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">6. 책임의 제한 및 면책</h2>
                        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200 text-yellow-900 text-sm leading-relaxed">
                            <ul className="list-disc pl-5 space-y-3">
                                <li>회사는 Beta 서비스 제공 기간 중 발생하는 데이터의 손실, 변경에 대해 회사의 고의 또는 중과실이 없는 한 책임을 지지 않습니다.</li>
                                <li>회사는 학교의 네트워크 환경, 기기 호환성, 교내 보안 정책 등 기술적 인프라 요인으로 인한 서비스 장애에 대해 책임을 지지 않습니다.</li>
                                <li>이용자(교사)가 법정대리인의 동의 없이 학생 정보를 등록하거나, 계정 정보를 제3자에게 공유하여 발생하는 모든 개인정보 보호 사고의 책임은 이용자에게 있습니다.</li>
                                <li>본 서비스의 선정 여부는 교육부 가이드라인에 따라 학교의 자율적 판단에 의해 결정되며, 회사는 선정 결과나 그로 인한 교육적 성과를 보장하지 않습니다.</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-8 bg-slate-50 border-t border-slate-200 text-center text-sm text-slate-400">
                © 2026 Class Routine Team. All rights reserved.
            </footer>
        </div >
    );
}
