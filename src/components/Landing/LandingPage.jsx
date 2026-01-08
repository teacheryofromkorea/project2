import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
    {
        id: 0,
        label: "08:30 등교",
        title: "아침 출석체크가\n놀이가 됩니다.",
        desc: "아이들이 등교해서 자신의 이름을 클릭하면,\n기분 좋은 알림음과 함께 하루가 시작됩니다.\n선생님은 그저 지켜보시기만 하면 돼요.",
        color: "bg-blue-600",
        image: "/images/screen_attendance.png"
    },
    {
        id: 1,
        label: "10:30 쉬는시간",
        title: "소란스러운 교실,\n타이머 하나로 해결.",
        desc: "다음 수업 준비 루틴과 화장실 다녀오기.\n남은 시간이 시각적으로 보이니까\n아이들이 스스로 시간을 조절합니다.",
        color: "bg-indigo-600",
        image: "/images/screen_break.png"
    },
    {
        id: 2,
        label: "12:30 점심시간",
        title: "즐거운 급식,\n건강한 습관.",
        desc: "오늘의 급식 메뉴 확인부터 양치 미션까지.\n매일매일 쌓이는 미션 달성으로\n건강한 생활 습관을 자연스럽게 유도하세요.",
        color: "bg-emerald-500",
        image: "/images/screen_lunch.png"
    },
    {
        id: 3,
        label: "14:30 하교",
        title: "완벽한 하루의 마무리.",
        desc: "알림장 작성, 자리 정돈, 인사하기.\n하교 전 해야 할 일을 빠뜨리지 않도록\n친절하게 안내합니다.",
        color: "bg-amber-500",
        image: "/images/screen_end.png"
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    // Navbar Transition
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">

            {/* 🧭 Navbar (Light Theme) */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-4" : "bg-transparent py-6"}`}>
                <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">R</div>
                        <span className="text-xl font-bold text-slate-900">Class Routine</span>
                    </div>
                    <button onClick={() => navigate('/attendance')} className="px-6 py-2.5 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                        Start Free
                    </button>
                </div>
            </header>

            {/* 🌟 Hero Section */}
            <section className="relative min-h-screen py-32 flex flex-col items-center justify-center overflow-hidden">

                {/* Background Decor (Gradient Orbs) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow -z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-50/80 rounded-full blur-[100px] mix-blend-multiply -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-sky-50/80 rounded-full blur-[100px] mix-blend-multiply -z-10 pointer-events-none" />

                <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // Apple-style ease
                    >

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm mb-10 shadow-sm transition-transform hover:scale-105 cursor-default">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Now in Public Beta v1.0
                        </div>

                        {/* Headline */}
                        <h1 className="text-[5rem] md:text-[9rem] font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
                            Classroom<br />
                            <span className="text-blue-600">Simplified.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-xl md:text-3xl text-slate-500 max-w-3xl mx-auto mb-16 leading-relaxed font-medium tracking-tight">
                            복잡한 학급 운영은 이제 그만.<br />
                            출석부터 하교까지, 선생님은 <span className="text-slate-900 font-bold decoration-blue-200 underline decoration-4 underline-offset-4">아이들에게만 집중하세요.</span>
                        </p>

                        {/* 🖥️ Hero Image (Actual App Screenshot) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="relative z-20 mt-8 mb-16"
                        >
                            <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-[50%] -z-10 opacity-0 animate-pulse-slow" />
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                                {/* Browser Toolbar Mockup */}
                                <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                    <div className="ml-4 flex-1 h-5 bg-white rounded border border-slate-200" />
                                </div>
                                <img
                                    src="/images/screen_attendance.png"
                                    alt="Class Routine App Dashboard"
                                    className="w-full h-auto"
                                />
                            </div>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <button
                            onClick={() => document.getElementById('scroll-start').scrollIntoView({ behavior: 'smooth' })}
                            className="animate-bounce text-slate-300 hover:text-blue-600 transition-colors p-4"
                        >
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
                            </svg>
                        </button>

                    </motion.div>
                </div>
            </section>

            {/* 🎢 Scrollytelling Section */}
            <div id="scroll-start" className="relative">
                <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">

                    {/* LEFT: Scrolling Text */}
                    <div className="w-full lg:w-1/2">
                        {FEATURES.map((feature, idx) => (
                            <FeatureText key={idx} feature={feature} setActiveStep={setActiveStep} />
                        ))}
                    </div>

                    {/* RIGHT: Sticky Visual */}
                    <div className="hidden lg:block w-1/2">
                        <div className="sticky top-0 h-screen flex items-center justify-end pr-12">
                            <MockupCard feature={FEATURES[activeStep]} />
                        </div>
                    </div>

                </div>
            </div>

            {/* 🦶 Footer */}
            <footer className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">준비되셨나요?</h2>
                    <button onClick={() => navigate('/attendance')} className="px-10 py-5 rounded-full text-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-200 transition-transform hover:scale-105">
                        선생님 계정으로 시작하기
                    </button>

                    <div className="mt-10">
                        <a href="mailto:?subject=[Class Routine Beta] 피드백&body=사용 중 겪으신 오류나 제안하고 싶은 내용을 자유롭게 적어주세요 :)"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm">
                            🐞 오류 제보 및 피드백 보내기
                        </a>
                    </div>

                    <div className="mt-12 text-sm text-slate-500 space-x-6">
                        <span>© 2026 Team Routine</span>
                        <button onClick={() => navigate('/privacy')} className="hover:text-slate-900 underline-offset-4 hover:underline">개인정보처리방침</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-slate-900 underline-offset-4 hover:underline">이용약관</button>
                    </div>
                </div>
            </footer>

        </div>
    );
}

// 📄 Sub-components

function FeatureText({ feature, setActiveStep }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

    useEffect(() => {
        if (isInView) setActiveStep(feature.id);
    }, [isInView, feature.id, setActiveStep]);

    return (
        <div ref={ref} className="h-screen flex items-center p-8 lg:p-16">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-6 ${feature.color}`}>
                    {feature.label}
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight whitespace-pre-line">
                    {feature.title}
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed whitespace-pre-line">
                    {feature.desc}
                </p>
            </motion.div>
        </div>
    )
}

function MockupCard({ feature }) {
    return (
        <div className="w-[600px] aspect-[16/10] relative flex items-center justify-center">
            {/* Background Blob */}
            <div className={`absolute -inset-10 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${feature.color}`} />

            {/* Card Container (Image Frame) */}
            <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white"
            >
                {/* Browser Toolbar Mockup */}
                <div className="h-6 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <img src={feature.image} alt={feature.title} className="w-full h-auto object-cover" />
            </motion.div>
        </div>
    )
}

