import { test, expect } from '@playwright/test';

test.describe('Music Selector App E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('Homepage has correct title and elements', async ({ page }) => {
    await expect(page).toHaveTitle(/Music Selector/);
    await expect(page.locator('h1')).toHaveText('Music Selector');
    
    // Check for the DropZone and the "Load Sample Songs" button
    await expect(page.getByText('Click to upload or drag and drop')).toBeVisible();
    await expect(page.getByRole('button', { name: /Load 1,148 Sample Songs/i })).toBeVisible();
  });

  test('Loading sample data navigates to Swipe view', async ({ page }) => {
    const loadSampleButton = page.getByRole('button', { name: /Load 1,148 Sample Songs/i });
    await loadSampleButton.click();

    // The app should navigate to /swipe automatically
    await expect(page).toHaveURL(/.*\/swipe/);

    // The swipe view should show controls and a card
    await expect(page.getByRole('button', { name: /like/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /dislike/i })).toBeVisible();

    // Verify some text on the card (we can't know exactly what song it is but there should be a heading)
    const activeCard = page.locator('div[role="article"]').first();
    await expect(activeCard).toBeVisible();
  });

  test('Navigation via bottom nav works', async ({ page }) => {
    // First load data to enable other pages
    await page.getByRole('button', { name: /Load 1,148 Sample Songs/i }).click();
    await expect(page).toHaveURL(/.*\/swipe/);

    // Go to Library
    await page.getByRole('link', { name: /library/i }).click();
    await expect(page).toHaveURL(/.*\/library/);
    await expect(page.getByPlaceholder('Search songs...')).toBeVisible();

    // Go to Stats
    await page.getByRole('link', { name: /stats/i }).click();
    await expect(page).toHaveURL(/.*\/stats/);
    await expect(page.getByRole('heading', { name: 'Settings & Stats' })).toBeVisible();

    // Go to Home
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('Library page filtering and searching', async ({ page }) => {
    // Load data
    await page.getByRole('button', { name: /Load 1,148 Sample Songs/i }).click();
    await page.getByRole('link', { name: /library/i }).click();

    // Wait for virtual list to render rows
    const searchInput = page.getByPlaceholder('Search songs...');
    await searchInput.fill('the'); // Search for something common

    // Let the filter apply
    await page.waitForTimeout(500);

    // We should see items matching the search
    const virtualItems = page.locator('.virtual-item');
    await expect(virtualItems.first()).toBeVisible();
  });

  test('Settings can be toggled', async ({ page }) => {
    await page.getByRole('button', { name: /Load 1,148 Sample Songs/i }).click();
    await page.getByRole('link', { name: /stats/i }).click();

    // Find the Autoplay toggle
    const autoplayToggle = page.locator('input[type="checkbox"]').nth(0);
    const initialState = await autoplayToggle.isChecked();
    
    // Click its label to toggle it
    await autoplayToggle.click({ force: true }); // It might be hidden by CSS
    
    const newState = await autoplayToggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('Swipe interactions record selections', async ({ page }) => {
    // Load data
    await page.getByRole('button', { name: /Load 1,148 Sample Songs/i }).click();
    await expect(page).toHaveURL(/.*\/swipe/);

    // Click Like
    const likeButton = page.getByRole('button', { name: /like/i });
    await likeButton.click();

    // Go to stats to see if we have 1 liked
    await page.getByRole('link', { name: /stats/i }).click();
    
    // Stats dashboard should be visible and show 1 reviewed, 1 liked
    await expect(page.getByText('Reviewed').first()).toBeVisible();
    
    // In our stats layout, the numbers are next to the labels
    const reviewedCount = page.locator('.text-2xl.font-bold.text-brand-500').first();
    await expect(reviewedCount).toHaveText('1');
    
    const likedCount = page.locator('.text-2xl.font-bold.text-accent-500').first();
    await expect(likedCount).toHaveText('1');
  });

});
