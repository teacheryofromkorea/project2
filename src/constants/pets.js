// 🐾 Pet Data and Sets Configuration

// 🎊 세트 데이터
export const petSets = [
  {
    id: 'forest',
    name: '숲속 친구들',
    description: '자연을 사랑하는 숲속 동물들',
    thumbnailPetId: 'forest_rabbit',
    theme: '🌲',
    completionReward: {
      gachaCoupons: 10,
      specialRewards: ['숲속 배경', '자연보호자 칭호']
    }
  },
  {
    id: 'ocean',
    name: '바다 탐험대',
    description: '신비로운 바다의 생물들',
    thumbnailPetId: 'ocean_dolphin',
    theme: '🌊',
    completionReward: {
      gachaCoupons: 12,
      specialRewards: ['바다 배경', '해양지킴이 칭호']
    }
  },
  {
    id: 'sky',
    name: '하늘 정원',
    description: '구름 위를 나는 하늘 친구들',
    thumbnailPetId: 'sky_phoenix',
    theme: '☁️',
    completionReward: {
      gachaCoupons: 15,
      specialRewards: ['하늘 배경', '하늘수호자 칭호']
    }
  },
  {
    id: 'magic',
    name: '마법학교',
    description: '신기한 마법을 부리는 환상 생물들',
    thumbnailPetId: 'magic_unicorn',
    theme: '✨',
    completionReward: {
      gachaCoupons: 20,
      specialRewards: ['마법 배경', '마법사 칭호', '특별 뽑기권 3장']
    }
  },
  {
    id: 'space',
    name: '우주 여행단',
    description: '광활한 우주를 탐험하는 외계 친구들',
    thumbnailPetId: 'space_alien',
    theme: '🚀',
    completionReward: {
      gachaCoupons: 25,
      specialRewards: ['우주 배경', '우주탐험가 칭호', '전설 확률 2배 쿠폰']
    }
  },
  {
    id: 'legend',
    name: '전설의 수호자',
    description: '세상을 지키는 전설적인 존재들',
    thumbnailPetId: 'legend_dragon',
    theme: '👑',
    completionReward: {
      gachaCoupons: 50,
      specialRewards: ['황금 배경', '전설수호자 칭호', '무한 뽑기권']
    }
  }
];

// 🐾 펫 데이터
export const petsData = [
  // 숲속 친구들 세트 (일반~희귀)
  {
    id: 'forest_rabbit',
    name: '숲토끼',
    emoji: '🐰',
    rarity: 'common',
    setId: 'forest',
    description: '깡충깡충 뛰어다니는 귀여운 토끼'
  },
  {
    id: 'forest_squirrel',
    name: '다람쥐',
    emoji: '🐿️',
    rarity: 'common',
    setId: 'forest',
    description: '도토리를 모으는 부지런한 다람쥐'
  },
  {
    id: 'forest_hedgehog',
    name: '고슴도치',
    emoji: '🦔',
    rarity: 'common',
    setId: 'forest',
    description: '가시로 자신을 보호하는 귀여운 고슴도치'
  },
  {
    id: 'forest_deer',
    name: '새끼 사슴',
    emoji: '🦌',
    rarity: 'rare',
    setId: 'forest',
    description: '우아하게 뛰어다니는 아름다운 사슴'
  },
  {
    id: 'forest_owl',
    name: '지혜 부엉이',
    emoji: '🦉',
    rarity: 'rare',
    setId: 'forest',
    description: '밤을 밝히는 현명한 부엉이'
  },
  {
    id: 'forest_fox',
    name: '영리한 여우',
    emoji: '🦊',
    rarity: 'rare',
    setId: 'forest',
    description: '꾀가 많고 아름다운 붉은 여우'
  },
  {
    id: 'forest_bear',
    name: '숲곰 대장',
    emoji: '🐻',
    rarity: 'epic',
    setId: 'forest',
    description: '숲을 지키는 용감한 곰'
  },
  {
    id: 'forest_wolf',
    name: '늑대 왕',
    emoji: '🐺',
    rarity: 'epic',
    setId: 'forest',
    description: '숲의 진정한 왕, 늑대의 우두머리'
  },

  // 바다 탐험대 세트
  {
    id: 'ocean_fish',
    name: '무지개 물고기',
    emoji: '🐠',
    rarity: 'common',
    setId: 'ocean',
    description: '아름다운 색깔을 가진 열대어'
  },
  {
    id: 'ocean_crab',
    name: '바닷게',
    emoji: '🦀',
    rarity: 'common',
    setId: 'ocean',
    description: '집게발로 모래성을 짓는 게'
  },
  {
    id: 'ocean_turtle',
    name: '바다거북',
    emoji: '🐢',
    rarity: 'common',
    setId: 'ocean',
    description: '천천히 헤엄치는 지혜로운 거북'
  },
  {
    id: 'ocean_dolphin',
    name: '장난꾸러기 돌고래',
    emoji: '🐬',
    rarity: 'rare',
    setId: 'ocean',
    description: '재주부리기를 좋아하는 똑똑한 돌고래'
  },
  {
    id: 'ocean_seahorse',
    name: '해마',
    emoji: '🐴',
    rarity: 'rare',
    setId: 'ocean',
    description: '바다의 신비로운 말, 해마'
  },
  {
    id: 'ocean_octopus',
    name: '문어 박사',
    emoji: '🐙',
    rarity: 'epic',
    setId: 'ocean',
    description: '8개 다리로 재주를 부리는 똑똑한 문어'
  },
  {
    id: 'ocean_whale',
    name: '거대 고래',
    emoji: '🐋',
    rarity: 'epic',
    setId: 'ocean',
    description: '바다의 왕자, 장엄한 고래'
  },

  // 하늘 정원 세트
  {
    id: 'sky_bird',
    name: '파랑새',
    emoji: '🐦',
    rarity: 'common',
    setId: 'sky',
    description: '행복을 가져다주는 파랑새'
  },
  {
    id: 'sky_butterfly',
    name: '나비',
    emoji: '🦋',
    rarity: 'common',
    setId: 'sky',
    description: '꽃에서 꽃으로 날아다니는 아름다운 나비'
  },
  {
    id: 'sky_bee',
    name: '꿀벌',
    emoji: '🐝',
    rarity: 'common',
    setId: 'sky',
    description: '열심히 일하는 부지런한 꿀벌'
  },
  {
    id: 'sky_eagle',
    name: '독수리',
    emoji: '🦅',
    rarity: 'rare',
    setId: 'sky',
    description: '하늘 높이 날아오르는 독수리'
  },
  {
    id: 'sky_parrot',
    name: '앵무새',
    emoji: '🦜',
    rarity: 'rare',
    setId: 'sky',
    description: '말을 따라하는 영리한 앵무새'
  },
  {
    id: 'sky_phoenix',
    name: '불사조',
    emoji: '🔥🦅',
    rarity: 'legendary',
    setId: 'sky',
    description: '영원히 살아가는 전설의 불사조'
  },

  // 마법학교 세트
  {
    id: 'magic_cat',
    name: '마법 고양이',
    emoji: '🐱‍👤',
    rarity: 'rare',
    setId: 'magic',
    description: '마법을 부리는 신비한 고양이'
  },
  {
    id: 'magic_frog',
    name: '마법 개구리',
    emoji: '🐸',
    rarity: 'rare',
    setId: 'magic',
    description: '왕자로 변할 수 있는 마법 개구리'
  },
  {
    id: 'magic_unicorn',
    name: '유니콘',
    emoji: '🦄',
    rarity: 'epic',
    setId: 'magic',
    description: '순수한 마음을 가진 신화 속 유니콘'
  },
  {
    id: 'magic_dragon_baby',
    name: '아기 드래곤',
    emoji: '🐲',
    rarity: 'epic',
    setId: 'magic',
    description: '미래의 전설이 될 귀여운 아기 드래곤',
    evolutionTo: 'legend_dragon'
  },

  // 우주 여행단 세트
  {
    id: 'space_alien',
    name: '우주 친구',
    emoji: '👽',
    rarity: 'rare',
    setId: 'space',
    description: '먼 우주에서 온 친근한 외계인'
  },
  {
    id: 'space_robot',
    name: '로봇 도우미',
    emoji: '🤖',
    rarity: 'epic',
    setId: 'space',
    description: '우주선을 돕는 똑똑한 로봇'
  },
  {
    id: 'space_astronaut',
    name: '우주 비행사',
    emoji: '👨‍🚀',
    rarity: 'epic',
    setId: 'space',
    description: '우주를 탐험하는 용감한 비행사'
  },

  // 전설의 수호자 세트
  {
    id: 'legend_dragon',
    name: '황금 드래곤',
    emoji: '🐉',
    rarity: 'legendary',
    setId: 'legend',
    description: '세상을 지키는 전설의 황금 드래곤',
    evolutionFrom: 'magic_dragon_baby',
    obtainMethod: 'evolution'
  },
  {
    id: 'legend_phoenix_king',
    name: '불사조 제왕',
    emoji: '🦅👑',
    rarity: 'legendary',
    setId: 'legend',
    description: '모든 하늘을 다스리는 불사조의 왕',
    limited: true,
    availableUntil: '2024-12-31',
    obtainMethod: 'gacha'
  },
  {
    id: 'legend_leviathan',
    name: '리바이어던',
    emoji: '🐋👑',
    rarity: 'legendary',
    setId: 'legend',
    description: '모든 바다를 지배하는 전설의 바다괴물'
  },
];

// 🧭 Get pet metadata by petId
export function getPetById(petId) {
  return petsData.find((pet) => pet.id === petId) || null;
}

// 🧭 Get all pets in a specific set
export function getPetsBySet(setId) {
  return petsData.filter((pet) => pet.setId === setId);
}

// 🧭 Get owned pets filtered by setId
export function getOwnedPetsBySet(ownedPetIds, setId) {
  return ownedPetIds
    .map((id) => getPetById(id))
    .filter((pet) => pet && pet.setId === setId);
}

// 🎲 Get random pet by rarity (used in Gacha)
export function getRandomPet(options = {}) {
  const { rarity } = options;

  // 전체 풀 또는 rarity 필터 풀 구성 (한정판/기간 만료 로직 추가 고려 가능하나, 여기서는 기본 기능 유지)
  const pool = rarity
    ? petsData.filter((pet) => pet.rarity === rarity)
    : petsData;

  if (!Array.isArray(pool) || pool.length === 0) {
    console.warn("[getRandomPet] No pet found for rarity:", rarity);
    return null;
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected || null;
}