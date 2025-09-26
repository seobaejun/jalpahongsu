import { test, expect } from '@playwright/test';

test('홈페이지가 제대로 로드되는지 확인', async ({ page }) => {
  await page.goto('/');
  
  // 페이지 제목 확인 (실제 Next.js 기본 페이지 제목)
  await expect(page).toHaveTitle(/Create Next App/);
  
  // Next.js 로고가 있는지 확인
  await expect(page.locator('h1')).toBeVisible();
});

test('링크가 제대로 작동하는지 확인', async ({ page }) => {
  await page.goto('/');
  
  // Next.js 문서 링크 확인 (첫 번째 링크만 선택)
  const docsLink = page.locator('a[href*="nextjs.org"]').first();
  await expect(docsLink).toBeVisible();
});

test('반응형 디자인 확인', async ({ page }) => {
  await page.goto('/');
  
  // 데스크톱 뷰포트에서 테스트
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('main')).toBeVisible();
  
  // 모바일 뷰포트로 변경
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('main')).toBeVisible();
});
