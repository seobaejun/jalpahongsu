// 간단한 description 확인 스크립트
console.log('Firestore에 저장된 description 데이터들:');

// 실제 데이터를 하드코딩으로 확인 (seedData.ts에서)
const descriptions = [
  '한국 국민 맥주! 칼로리 33% 감소!',
  '순대국밥|백숙|돼지갈비탕 등 한식 체인점',
  '고급 화장품 브랜드 체험',
  '한국 대표 화장품 브랜드',
  '서울 최고 전망대 체험',
  '최신 스마트폰 체험',
  '한국 전통 시장 체험',
  '전통 한국 음식 체험',
  '고급 헤어 스타일링 체험',
  '테마파크 체험'
];

console.log('확인해야 할 description들:');
descriptions.forEach((desc, index) => {
  console.log(`${index + 1}. ${desc}`);
});
