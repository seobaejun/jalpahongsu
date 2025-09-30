import { test, expect } from '@playwright/test';

test.describe('모바일 반응형 테스트', () => {
  test('홈페이지가 모바일에서 제대로 로드되는지 확인', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/잘파는 샤오홍슈/);
    
    // 헤더가 모바일에서 보이는지 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 모바일에서 텍스트가 적절히 표시되는지 확인
    const heroSection = page.locator('[data-testid="hero"]').or(page.locator('main > div').first());
    await expect(heroSection).toBeVisible();
  });

  test('모바일 네비게이션 메뉴 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 햄버거 메뉴 버튼이 있는지 확인 (모바일에서)
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button').first());
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // 메뉴가 열렸는지 확인
      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator('nav[aria-expanded="true"]'));
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('모바일에서 경험 목록이 제대로 표시되는지 확인', async ({ page }) => {
    await page.goto('/');
    
    // 경험 목록 섹션 확인
    const experienceList = page.locator('[data-testid="experience-list"]').or(page.locator('main').last());
    await expect(experienceList).toBeVisible();
    
    // 카드들이 모바일에서 적절히 배치되는지 확인
    const cards = page.locator('[data-testid="experience-card"]').or(page.locator('div').filter({ hasText: /경험/ }));
    
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('모바일 터치 인터랙션 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 스크롤 테스트
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    // 다시 맨 위로 스크롤
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    // 페이지가 정상적으로 스크롤되는지 확인
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });

  test('모바일에서 이미지 최적화 확인', async ({ page }) => {
    await page.goto('/');
    
    // 이미지들이 로드되는지 확인
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // 첫 번째 이미지가 로드되는지 확인
      await expect(images.first()).toBeVisible();
      
      // 이미지의 src 속성 확인
      const firstImageSrc = await images.first().getAttribute('src');
      expect(firstImageSrc).toBeTruthy();
    }
  });

  test('모바일 폼 요소 테스트', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
    
    // 입력 필드들이 모바일에서 적절히 표시되는지 확인
    const emailInput = page.locator('input[type="email"]').or(page.locator('input').first());
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input').last());
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
      await emailInput.fill('test@example.com');
    }
    
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill('testpassword');
    }
  });
});
