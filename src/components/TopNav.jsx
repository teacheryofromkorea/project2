function TopNav({ activeTab, setActiveTab }) {
  
  const tabs = ["등교", "쉬는시간", "점심", "수업", "하교", "능력치", "현황", "도구", "설정"];
  
  return (
    <header className="bg-white/60 backdrop-blur border-b border-white/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <nav className="flex gap-2">
          {tabs.map((tab, idx) => (
<button
  key={tab}
  onClick={() => {
  if (tab === "등교") {
    setActiveTab("attendance");
    localStorage.setItem("activeTab", "attendance");
  } else if (tab === "쉬는시간") {
    setActiveTab("break");
    localStorage.setItem("activeTab", "break");
  } else if (tab === "점심") {
    setActiveTab("lunch");
    localStorage.setItem("activeTab", "lunch");
  } else if (tab === "수업") {
    setActiveTab("class");
    localStorage.setItem("activeTab", "class");
  } else if (tab === "하교") {
    setActiveTab("checkout");
    localStorage.setItem("activeTab", "checkout");
  } else if (tab === "능력치") {
    setActiveTab("stats");
    localStorage.setItem("activeTab", "stats");
  } else if (tab === "현황") {
    setActiveTab("overview");
    localStorage.setItem("activeTab", "overview");
  } else if (tab === "도구") {
    setActiveTab("tools");
    localStorage.setItem("activeTab", "tools");
  } else if (tab === "설정") {
    setActiveTab("settings");
    localStorage.setItem("activeTab", "settings");
  }
}}  
  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
    (tab === "등교" && activeTab === "attendance") ||
    (tab === "쉬는시간" && activeTab === "break") ||
    (tab === "점심" && activeTab === "lunch") ||
    (tab === "수업" && activeTab === "class") ||
    (tab === "하교" && activeTab === "checkout") ||
    (tab === "능력치" && activeTab === "stats") ||
    (tab === "현황" && activeTab === "overview") ||
    (tab === "도구" && activeTab === "tools") ||
    (tab === "설정" && activeTab === "settings")
      ? "bg-pink-500 text-white shadow"
      : "text-gray-600 hover:bg-white"
  }`}
>
  {tab}
</button>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center rounded-full bg-purple-600 text-white px-3 py-1 text-xs font-semibold">
            필수 세팅 가이드
          </span>
          <div className="text-gray-700 text-xs">11:39</div>
        </div>
      </div>
    </header>
  );


}


export default TopNav;