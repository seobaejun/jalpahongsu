import { test, expect } from '@playwright/test';

test('REVU 사이트 분석', async ({ page }) => {
  // REVU 사이트 방문
  await page.goto('https://revu.hongshengstore.cn/home/');
  
  // 페이지 로딩 대기
  await page.waitForLoadState('networkidle');
  
  // 스크린샷 촬영
  await page.screenshot({ path: 'revu-homepage.png', fullPage: true });
  
  // 페이지 제목 확인
  const title = await page.title();
  console.log('페이지 제목:', title);
  
  // 메인 컨텐츠 요소들 확인
  const mainContent = await page.locator('main, .main, #main').first();
  if (await mainContent.count() > 0) {
    console.log('메인 컨텐츠 영역 발견');
  }
  
  // 헤더/네비게이션 확인
  const header = await page.locator('header, .header, nav, .nav').first();
  if (await header.count() > 0) {
    console.log('헤더/네비게이션 영역 발견');
  }
  
  // 체험단 관련 텍스트 확인
  const experienceText = await page.locator('text=体验').first();
  if (await experienceText.count() > 0) {
    console.log('체험단 관련 텍스트 발견');
  }
  
  // 한국어/중국어 관련 텍스트 확인
  const koreanText = await page.locator('text=韩国').first();
  const chineseText = await page.locator('text=中国').first();
  
  if (await koreanText.count() > 0) {
    console.log('한국 관련 텍스트 발견');
  }
  
  if (await chineseText.count() > 0) {
    console.log('중국 관련 텍스트 발견');
  }
  
  // 로그인 관련 요소 확인
  const loginElements = await page.locator('text=登入, text=login, text=로그인').count();
  console.log('로그인 관련 요소 개수:', loginElements);
  
  // 체험단 목록 확인
  const experienceItems = await page.locator('[class*="experience"], [class*="item"], [class*="card"]').count();
  console.log('체험단 아이템 개수:', experienceItems);
  
  // 페이지 구조 분석을 위한 HTML 저장
  const htmlContent = await page.content();
  console.log('페이지 HTML 길이:', htmlContent.length);
  
  // CSS 클래스명들 수집
  const classNames = await page.evaluate(() => {
    const elements = document.querySelectorAll('*[class]');
    const classes = new Set();
    elements.forEach(el => {
      if (el.className) {
        el.className.split(' ').forEach(cls => {
          if (cls.trim()) classes.add(cls.trim());
        });
      }
    });
    return Array.from(classes);
  });
  
  console.log('발견된 CSS 클래스 수:', classNames.length);
  console.log('주요 CSS 클래스들:', classNames.slice(0, 20));
});

test('REVU 사이트 모바일 분석', async ({ page }) => {
  // 모바일 뷰포트로 설정
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('https://revu.hongshengstore.cn/home/');
  await page.waitForLoadState('networkidle');
  
  // 모바일 스크린샷
  await page.screenshot({ path: 'revu-mobile.png', fullPage: true });
  
  // 모바일 메뉴 확인
  const mobileMenu = await page.locator('[class*="mobile"], [class*="menu"], [class*="hamburger"]').first();
  if (await mobileMenu.count() > 0) {
    console.log('모바일 메뉴 발견');
  }
  
  console.log('모바일 분석 완료');
});
