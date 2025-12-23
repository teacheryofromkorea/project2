import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// import {
//   RARITY_KO,
//   FRAGMENT_EXCHANGE_RATES,
//   COUPON_PURCHASE_RATES,
//   RARITY_STARS,
//   GACHA_CONFIG,
//   PET_SETS,
//   PETS,
// } from "../../features/pets/petMvpData";
// import { pickRarity, pickPetByRarity } from "../../features/pets/gachaMvp";

// TEMP STUBS (펫 데이터 리팩터링 전까지 임시 유지)
const RARITY_KO = {};
const FRAGMENT_EXCHANGE_RATES = {};
const COUPON_PURCHASE_RATES = {};
const RARITY_STARS = {};
const GACHA_CONFIG = { costPerPull: 1, probabilities: {} };
const PET_SETS = [];
const PETS = [];
const pickRarity = () => null;
const pickPetByRarity = () => null;

export default function PetCollectionPanel({
  selectedStudent,
  setStudents,
  fetchStudents,
  gachaProgress,
  updateStudentPatch,
  refreshAll,
}) {
  // TEMP: AbilityTab 개발을 위한 안전 가드
  if (!selectedStudent) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-400">
        🐾 펫 도감은 준비 중이에요
      </div>
    );
  }

  const [isGachaSpinning, setIsGachaSpinning] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  const [gachaSaving, setGachaSaving] = useState(false);

  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isPurchaseConfirmOpen, setIsPurchaseConfirmOpen] = useState(false);
  const [petToPurchase, setPetToPurchase] = useState(null);

  const hardRefresh = async () => {
    if (typeof refreshAll === "function") return refreshAll();
    return fetchStudents();
  };

  const persistStudentUpdate = async (studentId, patch) => {
    if (typeof updateStudentPatch === "function") {
      return updateStudentPatch(studentId, patch);
    }

    const { data, error } = await supabase
      .from("students")
      .update(patch)
      .eq("id", studentId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  };

  const userOwnedPets = useMemo(() => {
    if (!selectedStudent) return new Set();
    return new Set(Array.isArray(selectedStudent.pets) ? selectedStudent.pets : []);
  }, [selectedStudent]);

  const userDuplicateCount = useMemo(() => {
    if (!selectedStudent) return {};
    return selectedStudent.duplicate_count || {};
  }, [selectedStudent]);

  const userFragments = useMemo(() => Number(selectedStudent?.fragments ?? 0), [selectedStudent]);

  const findPetById = (petId) => PETS.find((p) => p.id === petId) || null;

  const categorizedPets = useMemo(() => {
    const categories = {};
    for (const set of PET_SETS) {
      const setPets = PETS.filter((p) => p.setId === set.id);
      const ownedCount = setPets.filter((p) => userOwnedPets.has(p.id)).length;
      categories[set.id] = {
        id: set.id,
        name: set.name,
        theme: set.theme,
        pets: setPets,
        progress: { owned: ownedCount, total: setPets.length },
      };
    }
    return categories;
  }, [userOwnedPets]);

  const recentPets = useMemo(() => {
    if (!selectedStudent) return [];
    const arr = Array.isArray(selectedStudent.recent_pet_acquisitions)
      ? selectedStudent.recent_pet_acquisitions
      : [];
    return arr
      .map((a) => {
        const pet = findPetById(a.petId);
        return pet ? { ...a, pet } : null;
      })
      .filter(Boolean)
      .slice(0, 5);
  }, [selectedStudent]);

  const openPetDialog = (pet) => {
    setSelectedPet(pet);
    setIsPetDialogOpen(true);
  };

  const requestCouponPurchase = (pet) => {
    if (!selectedStudent) return;

    const owned = Array.isArray(selectedStudent.pets) ? selectedStudent.pets : [];
    if (owned.includes(pet.id)) return;

    const cost = COUPON_PURCHASE_RATES[pet.rarity] ?? 999999;
    const currentCoupons = Number(selectedStudent.gacha_coupons ?? 0);
    if (currentCoupons < cost) return;

    setPetToPurchase(pet);
    setIsPurchaseConfirmOpen(true);
  };

  const confirmCouponPurchase = async () => {
    if (!selectedStudent || !petToPurchase) return;

    const owned = Array.isArray(selectedStudent.pets) ? selectedStudent.pets : [];
    if (owned.includes(petToPurchase.id)) {
      setIsPurchaseConfirmOpen(false);
      setPetToPurchase(null);
      return;
    }

    const cost = COUPON_PURCHASE_RATES[petToPurchase.rarity] ?? 999999;
    const currentCoupons = Number(selectedStudent.gacha_coupons ?? 0);
    if (currentCoupons < cost) return;

    const nextCoupons = currentCoupons - cost;
    const nextPets = [...owned, petToPurchase.id];
    const nowIso = new Date().toISOString();

    const prevRecent = Array.isArray(selectedStudent.recent_pet_acquisitions)
      ? selectedStudent.recent_pet_acquisitions
      : [];
    const nextRecent = [
      { petId: petToPurchase.id, timestamp: nowIso, method: "coupon", isNew: true },
      ...prevRecent,
    ].slice(0, 10);

    // optimistic
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? { ...s, gacha_coupons: nextCoupons, pets: nextPets, recent_pet_acquisitions: nextRecent }
          : s
      )
    );

    try {
      const data = await persistStudentUpdate(selectedStudent.id, {
        gacha_coupons: nextCoupons,
        pets: nextPets,
        recent_pet_acquisitions: nextRecent,
      });

      setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast.success(`🛍️ 쿠폰으로 구매: ${petToPurchase.emoji} ${petToPurchase.name}`);

      setIsPurchaseConfirmOpen(false);
      setPetToPurchase(null);
      setIsPetDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("쿠폰 구매 저장 실패");
      await hardRefresh();
    }
  };

  const handleGacha = async () => {
    if (!selectedStudent) return;
    if (gachaSaving || isGachaSpinning) return;

    const currentCoupons = Number(selectedStudent.gacha_coupons ?? 0);
    if (currentCoupons < GACHA_CONFIG.costPerPull) return;

    setIsGachaSpinning(true);
    setGachaResult(null);

    setTimeout(async () => {
      const rarity = pickRarity(GACHA_CONFIG.probabilities);
      const pet = pickPetByRarity(rarity);

      const owned = Array.isArray(selectedStudent.pets) ? selectedStudent.pets : [];
      const isNew = !owned.includes(pet.id);

      const nextCoupons = currentCoupons - GACHA_CONFIG.costPerPull;
      const nextPets = isNew ? [...owned, pet.id] : owned;

      const currentFragments = Number(selectedStudent.fragments ?? 0);
      const nextFragments = isNew ? currentFragments : currentFragments + 1;

      const prevDup = selectedStudent.duplicate_count || {};
      const prevCount = Number(prevDup[pet.id] ?? 0);
      const nextDuplicateCount = isNew ? prevDup : { ...prevDup, [pet.id]: prevCount + 1 };

      const prevPullCount = Number(selectedStudent.gacha_pull_count ?? 0);
      const nextPullCount = prevPullCount + 1;
      const nowIso = new Date().toISOString();

      const prevRecent = Array.isArray(selectedStudent.recent_pet_acquisitions)
        ? selectedStudent.recent_pet_acquisitions
        : [];
      const nextRecent = [{ petId: pet.id, timestamp: nowIso, method: "gacha", isNew }, ...prevRecent].slice(0, 10);

      // optimistic
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id
            ? {
                ...s,
                gacha_coupons: nextCoupons,
                pets: nextPets,
                fragments: nextFragments,
                duplicate_count: nextDuplicateCount,
                gacha_pull_count: nextPullCount,
                last_gacha_pull: nowIso,
                recent_pet_acquisitions: nextRecent,
              }
            : s
        )
      );

      setGachaSaving(true);
      try {
        const data = await persistStudentUpdate(selectedStudent.id, {
          gacha_coupons: nextCoupons,
          pets: nextPets,
          fragments: nextFragments,
          duplicate_count: nextDuplicateCount,
          gacha_pull_count: nextPullCount,
          last_gacha_pull: nowIso,
          recent_pet_acquisitions: nextRecent,
        });

        setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
        setGachaResult({ pet, isNew });

        if (isNew) toast.success(`✨ 새로운 펫: ${pet.emoji} ${pet.name} (${RARITY_KO[pet.rarity]})`);
        else toast(`중복! 조각 +1 (${pet.emoji} ${pet.name})`);
      } catch (e) {
        console.error(e);
        toast.error("가챠 저장 실패");
        await hardRefresh();
      } finally {
        setGachaSaving(false);
        setIsGachaSpinning(false);
      }
    }, 1200);
  };

  const handleFragmentExchange = async () => {
    if (!selectedStudent || !selectedPet) return;
    if (userOwnedPets.has(selectedPet.id)) return;

    const cost = FRAGMENT_EXCHANGE_RATES[selectedPet.rarity] ?? 999999;
    if (userFragments < cost) return;

    const owned = Array.isArray(selectedStudent.pets) ? selectedStudent.pets : [];
    const nextPets = [...owned, selectedPet.id];

    const nextFragments = userFragments - cost;
    const nowIso = new Date().toISOString();

    const prevRecent = Array.isArray(selectedStudent.recent_pet_acquisitions)
      ? selectedStudent.recent_pet_acquisitions
      : [];
    const nextRecent = [{ petId: selectedPet.id, timestamp: nowIso, method: "fragment", isNew: true }, ...prevRecent].slice(0, 10);

    // optimistic
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? { ...s, pets: nextPets, fragments: nextFragments, recent_pet_acquisitions: nextRecent }
          : s
      )
    );

    try {
      const data = await persistStudentUpdate(selectedStudent.id, {
        pets: nextPets,
        fragments: nextFragments,
        recent_pet_acquisitions: nextRecent,
      });

      setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast.success(`🛍️ 조각 교환: ${selectedPet.emoji} ${selectedPet.name}`);
      setIsPetDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("조각 교환 저장 실패");
      await hardRefresh();
    }
  };


  return (
    <>
      {gachaProgress && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-bold">🎟️ 가챠 쿠폰</div>
              <div className="text-sm text-gray-500 mt-1">능력치 총점 10점마다 쿠폰 1장</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-indigo-700">{gachaProgress.currentCoupons}</div>
              <div className="text-xs text-gray-500">보유 쿠폰</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div>
                다음 쿠폰까지 <span className="font-semibold text-gray-900">{gachaProgress.pointsToNextCoupon}</span>점
              </div>
              <div className="text-xs text-gray-500">총점 {gachaProgress.totalScore}점</div>
            </div>
            <Progress value={gachaProgress.progressPercent} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-4 mt-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-bold">🎰 가챠 뽑기</div>
            <div className="text-sm text-gray-500 mt-1">쿠폰 {GACHA_CONFIG.costPerPull}장 사용 · 중복이면 조각 +1</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-emerald-700">{Number(selectedStudent.fragments ?? 0)}</div>
            <div className="text-xs text-gray-500">조각</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleGacha}
            disabled={isGachaSpinning || gachaSaving || Number(selectedStudent.gacha_coupons ?? 0) < GACHA_CONFIG.costPerPull}
          >
            {isGachaSpinning ? "뽑는 중..." : "🎲 가챠 뽑기"}
          </Button>
          <div className="text-sm text-gray-600">
            보유 쿠폰: <span className="font-semibold">{Number(selectedStudent.gacha_coupons ?? 0)}</span>
          </div>
          <div className="text-sm text-gray-600">
            보유 펫: <span className="font-semibold">{Array.isArray(selectedStudent.pets) ? selectedStudent.pets.length : 0}</span>
          </div>
        </div>

        <div className="mt-4">
          {isGachaSpinning && (
            <div className="rounded-xl border bg-gray-50 p-4 text-center">
              <div className="text-4xl">🎲</div>
              <div className="text-sm text-gray-500 mt-2">신비로운 알이 흔들리는 중...</div>
            </div>
          )}

          {!isGachaSpinning && gachaResult && (
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{gachaResult.pet.emoji}</div>
                  <div>
                    <div className="font-extrabold text-lg">{gachaResult.pet.name}</div>
                    <div className="text-sm text-gray-600">
                      {RARITY_KO[gachaResult.pet.rarity]}{gachaResult.isNew ? " · 새로운 발견!" : " · 중복"}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${gachaResult.isNew ? "text-emerald-700" : "text-blue-700"}`}>
                  {gachaResult.isNew ? "도감에 추가" : "조각 +1"}
                </div>
              </div>
            </div>
          )}

          {!isGachaSpinning && !gachaResult && (
            <div className="text-sm text-gray-500">아직 뽑기 결과가 없어요.</div>
          )}
        </div>
      </div>

      {recentPets.length > 0 && (
        <div className="rounded-2xl border bg-white p-4 mt-3">
          <div className="font-bold mb-3">✨ 최근 획득</div>
          <div className="grid grid-cols-5 gap-2">
            {recentPets.map((a, idx) => (
              <button
                key={`${a.pet.id}:${idx}`}
                onClick={() => openPetDialog(a.pet)}
                className="rounded-xl border bg-gray-50 p-3 text-center hover:bg-gray-100 transition"
                title={a.pet.name}
              >
                <div className="text-3xl">{a.pet.emoji}</div>
                <div className="text-xs font-semibold mt-1 truncate">{a.pet.name}</div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {a.method === "gacha" ? "가챠" : a.method === "fragment" ? "조각" : a.method}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-4 mt-3">
        <div className="font-bold">📚 펫 도감</div>
        <div className="text-sm text-gray-500 mt-1">획득한 펫은 이름/아이콘이 공개됩니다.</div>

        <div className="mt-4 space-y-6">
          {Object.values(categorizedPets).map((cat) => {
            const pct = cat.progress.total ? Math.round((cat.progress.owned / cat.progress.total) * 100) : 0;

            return (
              <div key={cat.id} className="rounded-2xl border bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{cat.theme}</div>
                    <div>
                      <div className="font-extrabold">{cat.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {cat.progress.owned}/{cat.progress.total} · {pct}%
                      </div>
                    </div>
                  </div>
                  <div className="w-32"><Progress value={pct} /></div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.pets.map((pet) => {
                    const isOwned = userOwnedPets.has(pet.id);
                    const dup = Number(userDuplicateCount?.[pet.id] ?? 0);
                    const starCount = RARITY_STARS[pet.rarity] ?? 1;

                    return (
                      <button
                        key={pet.id}
                        onClick={() => openPetDialog(pet)}
                        className={`relative rounded-2xl border p-4 text-left transition hover:shadow-sm ${isOwned ? "bg-white" : "bg-gray-100"}`}
                      >
                        {isOwned && dup > 0 && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                            {dup}
                          </div>
                        )}

                        <div className={`text-4xl ${isOwned ? "" : "opacity-30"}`}>
                          {isOwned ? pet.emoji : "❓"}
                        </div>

                        <div className="mt-3 font-extrabold truncate">{isOwned ? pet.name : "???"}</div>

                        <div className="mt-2 flex items-center gap-1">
                          {Array.from({ length: starCount }).map((_, i) => (
                            <span key={i} className={`text-sm ${isOwned ? "" : "opacity-40"}`}>⭐</span>
                          ))}
                        </div>

                        <div className="mt-2">
                          <Badge variant={isOwned ? "default" : "secondary"}>{RARITY_KO[pet.rarity] || pet.rarity}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedPet && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedPet.emoji}</span>
                    <span className="font-extrabold">{selectedPet.name}</span>
                  </div>
                  <Badge>{RARITY_KO[selectedPet.rarity] || selectedPet.rarity}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-2xl border bg-gray-50 p-4">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {selectedPet.description || "설명이 아직 없어요."}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      보유 여부: <span className="font-semibold text-gray-900">{userOwnedPets.has(selectedPet.id) ? "보유" : "미보유"}</span>
                    </div>
                    {userOwnedPets.has(selectedPet.id) && (
                      <div className="text-sm text-gray-600">
                        중복: <span className="font-semibold text-gray-900">{Number(userDuplicateCount?.[selectedPet.id] ?? 0)}</span>
                      </div>
                    )}
                  </div>

                  {!userOwnedPets.has(selectedPet.id) && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">
                          쿠폰 {COUPON_PURCHASE_RATES[selectedPet.rarity] ?? "?"}개로 구매 · 현재 쿠폰 {Number(selectedStudent.gacha_coupons ?? 0)}개
                        </div>
                        <Button
                          onClick={() => requestCouponPurchase(selectedPet)}
                          disabled={Number(selectedStudent.gacha_coupons ?? 0) < (COUPON_PURCHASE_RATES[selectedPet.rarity] ?? 999999)}
                        >
                          🎟️ 쿠폰으로 구매
                        </Button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">
                          조각 {FRAGMENT_EXCHANGE_RATES[selectedPet.rarity] ?? "?"}개로 교환 · 현재 조각 {userFragments}개
                        </div>
                        <Button
                          onClick={handleFragmentExchange}
                          disabled={userFragments < (FRAGMENT_EXCHANGE_RATES[selectedPet.rarity] ?? 999999)}
                        >
                          🛍️ 조각으로 교환
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500">
                        💡 가챠에서도 획득할 수 있어요. (중복이면 조각 +1)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPurchaseConfirmOpen} onOpenChange={setIsPurchaseConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="font-extrabold">구매 확인</span>
              {petToPurchase && <Badge>{RARITY_KO[petToPurchase.rarity] || petToPurchase.rarity}</Badge>}
            </DialogTitle>
          </DialogHeader>

          {petToPurchase && (
            <div className="space-y-4">
              <div className="rounded-2xl border bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{petToPurchase.emoji}</div>
                  <div>
                    <div className="text-lg font-extrabold">{petToPurchase.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      필요 쿠폰: <span className="font-semibold">{COUPON_PURCHASE_RATES[petToPurchase.rarity] ?? "?"}</span>
                      {" · "}
                      보유 쿠폰: <span className="font-semibold">{Number(selectedStudent.gacha_coupons ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">⚠️ 구매 후 환불/취소는 불가합니다.</div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPurchaseConfirmOpen(false);
                    setPetToPurchase(null);
                  }}
                >
                  취소
                </Button>
                <Button onClick={confirmCouponPurchase}>구매 확정</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
