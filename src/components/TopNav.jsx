

function TopNav({ setActiveTab }) {
  
  const tabs = ["등교", "쉬는시간", "점심", "수업", "하교", "능력치", "현황", "도구"];
  
  return (
    <header className="bg-white/60 backdrop-blur border-b border-white/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <nav className="flex gap-2">
          {tabs.map((tab, idx) => (
<button
  key={tab}
  onClick={() => {
  if (tab === "쉬는시간") setActiveTab("break");
  else if (tab === "등교") setActiveTab("attendance");
}}  // ← 이거 추가!
  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
    idx === 0 ? "bg-pink-500 text-white shadow" : "text-gray-600 hover:bg-white"
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