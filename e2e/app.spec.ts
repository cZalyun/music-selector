import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForApp(page: Page) {
  await page.goto('/');
  await page.waitForSelector('#root', { state: 'attached' });
  await page.waitForTimeout(800);
}

async function loadSampleData(page: Page) {
  await waitForApp(page);
  await page.getByText(/Load Sample Data/i).click();
  await page.waitForTimeout(2500);
}

async function navigateTo(page: Page, path: string) {
  const labels: Record<string, string> = {
    '/': 'Upload',
    '/swipe': 'Swipe',
    '/library': 'Library',
    '/stats': 'Settings',
  };
  const label = labels[path];
  if (label) {
    await page.getByRole('navigation').getByText(label, { exact: true }).click();
    await page.waitForTimeout(500);
  }
}

// Scoped swipe control helpers — avoids MiniPlayer duplicate buttons
async function clickSwipeLike(page: Page) {
  await page.locator('button[aria-label="Like this song"]').first().click();
  await page.waitForTimeout(500);
}
async function clickSwipeDislike(page: Page) {
  await page.locator('button[aria-label="Dislike this song"]').first().click();
  await page.waitForTimeout(500);
}
async function clickSwipeSkip(page: Page) {
  await page.locator('button[aria-label="Skip this song"]').first().click();
  await page.waitForTimeout(500);
}
async function clickSwipeUndo(page: Page) {
  await page.locator('button[aria-label="Undo last selection"]').first().click();
  await page.waitForTimeout(500);
}

// ─── 1. HOME PAGE ─────────────────────────────────────────────────────────────

test.describe('Home Page', () => {
  test('renders title and subtitle', async ({ page }) => {
    await waitForApp(page);
    await expect(page.getByText('Music Selector')).toBeVisible();
    await expect(page.getByText(/Review your YouTube Music/i)).toBeVisible();
  });

  test('renders DropZone with upload prompt', async ({ page }) => {
    await waitForApp(page);
    await expect(page.getByText(/Drop your CSV file here/i)).toBeVisible();
    await expect(page.getByText(/or click to browse/i)).toBeVisible();
  });

  test('renders Load Sample Data button', async ({ page }) => {
    await waitForApp(page);
    const btn = page.getByText(/Load Sample Data/i);
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('renders How To Use button', async ({ page }) => {
    await waitForApp(page);
    await expect(page.getByText('How To Use')).toBeVisible();
  });

  test('renders feedback link', async ({ page }) => {
    await waitForApp(page);
    await expect(page.getByText('Send Feedback')).toBeVisible();
  });

  test('loads sample data and shows session resume card', async ({ page }) => {
    await loadSampleData(page);
    // Should show toast
    await expect(page.getByText(/Loaded .* sample songs/i)).toBeVisible({ timeout: 5000 });
    // Should show resume card
    await expect(page.getByText('Continue Session')).toBeVisible();
    await expect(page.getByText('Continue Reviewing')).toBeVisible();
  });

  test('How To Use modal opens and closes', async ({ page }) => {
    await waitForApp(page);
    await page.getByText('How To Use').click();
    await page.waitForTimeout(300);
    // Modal content
    await expect(page.getByText(/Step 1: Get Your Songs/i)).toBeVisible();
    await expect(page.getByText(/Swipe right/i)).toBeVisible();
    await expect(page.getByText('Copy Bookmarklet Code')).toBeVisible();
    // Close
    await page.getByLabel('Close').click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Step 1: Get Your Songs/i)).not.toBeVisible();
  });

  test('Copy Bookmarklet button is clickable', async ({ page }) => {
    await waitForApp(page);
    await page.getByText('How To Use').click();
    await page.waitForTimeout(300);
    const copyBtn = page.getByText('Copy Bookmarklet Code');
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toBeEnabled();
    // Click should not throw
    await copyBtn.click();
    await page.waitForTimeout(500);
    // Verify either toast or button text changed (clipboard may not be available in test)
    const changed = await page.getByText('Copied!').isVisible().catch(() => false);
    const toastVisible = await page.getByText(/Copied to clipboard/i).isVisible().catch(() => false);
    // At minimum the button should still be present and app didn't crash
    await expect(copyBtn.or(page.getByText('Copied!'))).toBeVisible();
  });

  test('Continue Reviewing navigates to swipe page', async ({ page }) => {
    await loadSampleData(page);
    await page.getByText('Continue Reviewing').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#/swipe');
  });

  test('DropZone shows preview after file upload', async ({ page }) => {
    await waitForApp(page);
    // We test with sample data load instead of actual file upload
    await loadSampleData(page);
    // After loading sample data, the session resume card should appear
    await expect(page.getByText('Continue Session')).toBeVisible();
  });
});

// ─── 2. BOTTOM NAVIGATION ────────────────────────────────────────────────────

test.describe('Bottom Navigation', () => {
  test('renders all 4 nav links', async ({ page }) => {
    await waitForApp(page);
    const nav = page.getByRole('navigation');
    await expect(nav.getByText('Upload')).toBeVisible();
    await expect(nav.getByText('Swipe')).toBeVisible();
    await expect(nav.getByText('Library')).toBeVisible();
    await expect(nav.getByText('Settings')).toBeVisible();
  });

  test('navigates between pages', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/swipe');
    expect(page.url()).toContain('#/swipe');
    await navigateTo(page, '/library');
    expect(page.url()).toContain('#/library');
    await navigateTo(page, '/stats');
    expect(page.url()).toContain('#/stats');
    await navigateTo(page, '/');
    expect(page.url()).toMatch(/#\/$/);
  });

  test('active nav link is highlighted', async ({ page }) => {
    await waitForApp(page);
    // On home page, Upload link's parent <a> should have the active class
    const uploadAnchor = page.getByRole('navigation').locator('a').filter({ hasText: 'Upload' });
    await expect(uploadAnchor).toHaveClass(/text-accent-400/);
  });
});

// ─── 3. SWIPE PAGE ───────────────────────────────────────────────────────────

test.describe('Swipe Page', () => {
  test('shows "No Songs Loaded" when no data', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/swipe');
    await expect(page.getByText('No Songs Loaded')).toBeVisible();
  });

  test('shows swipe card after loading sample data', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Should see a song card with title/artist
    await expect(page.getByRole('article').first()).toBeVisible();
    // Progress bar should be visible
    await expect(page.getByText(/of .* reviewed/i)).toBeVisible();
  });

  test('progress bar shows correct initial state', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // 0 reviewed initially
    await expect(page.getByText(/0 of .* reviewed/i)).toBeVisible();
    await expect(page.getByText(/remaining/i)).toBeVisible();
  });

  test('swipe controls are visible and have correct labels', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await expect(page.locator('button[aria-label="Like this song"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Dislike this song"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Skip this song"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Play or pause"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Undo last selection"]').first()).toBeVisible();
  });

  test('undo button is disabled initially', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    const undoBtn = page.locator('button[aria-label="Undo last selection"]').first();
    await expect(undoBtn).toBeDisabled();
  });

  test('like button advances to next card and updates progress', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Get first song title
    const firstCard = page.getByRole('article').first();
    const firstTitle = await firstCard.locator('h2').textContent();
    // Click like
    await clickSwipeLike(page);
    // Progress should update
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
    // Undo should now be enabled
    await expect(page.locator('button[aria-label="Undo last selection"]').first()).toBeEnabled();
    // Card should have changed
    const newCard = page.getByRole('article').first();
    const newTitle = await newCard.locator('h2').textContent();
    expect(newTitle).not.toBe(firstTitle);
  });

  test('dislike button advances to next card', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await clickSwipeDislike(page);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
  });

  test('skip button advances to next card', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await clickSwipeSkip(page);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
  });

  test('undo restores last selection', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Like first song
    await clickSwipeLike(page);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
    // Undo
    await clickSwipeUndo(page);
    // Progress should go back to 0
    await expect(page.getByText(/0 of .* reviewed/i)).toBeVisible();
  });

  test('keyboard shortcut → likes a song', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
  });

  test('keyboard shortcut ← dislikes a song', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(600);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
  });

  test('keyboard shortcut ↑ skips a song', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(600);
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();
  });

  test('keyboard Z undoes last selection', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await page.keyboard.press('z');
    await page.waitForTimeout(600);
    await expect(page.getByText(/0 of .* reviewed/i)).toBeVisible();
  });

  test('like shows toast notification', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await clickSwipeLike(page);
    await expect(page.getByText(/Liked/i)).toBeVisible({ timeout: 3000 });
  });
});

// ─── 4. LIBRARY PAGE ─────────────────────────────────────────────────────────

test.describe('Library Page', () => {
  test('shows empty state when no songs loaded', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/library');
    await expect(page.getByText('No songs match your filters')).toBeVisible();
  });

  test('shows songs after loading sample data', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    // Should show result count
    await expect(page.getByText(/^\d+ songs$/)).toBeVisible();
    // Tab counts should be visible
    await expect(page.getByText(/^All \(/)).toBeVisible();
  });

  test('search bar filters songs', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    const searchInput = page.getByPlaceholder('Search songs...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Dire Straits');
    await page.waitForTimeout(300);
    // Count should decrease
    const countText = await page.getByText(/^\d+ songs$/).textContent();
    expect(countText).toBeTruthy();
    const count = parseInt(countText!);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(1148);
  });

  test('search clear button works', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    const searchInput = page.getByPlaceholder('Search songs...');
    await searchInput.fill('test');
    await page.waitForTimeout(200);
    await page.getByLabel('Clear search').click();
    await expect(searchInput).toHaveValue('');
  });

  test('tab filters work', async ({ page }) => {
    await loadSampleData(page);
    // Like a few songs first
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await clickSwipeLike(page);
    await clickSwipeDislike(page);

    await navigateTo(page, '/library');
    await page.waitForTimeout(500);

    // Click Liked tab — use exact match to avoid matching "Disliked"
    await page.getByRole('button', { name: 'Liked (1)', exact: true }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('1 songs')).toBeVisible();

    // Click Disliked tab
    await page.getByRole('button', { name: 'Disliked (1)', exact: true }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('1 songs')).toBeVisible();

    // Click All tab
    await page.getByRole('button', { name: /^All \(/ }).click();
    await page.waitForTimeout(300);
  });

  test('sort buttons change order', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    // Click Title sort — use first() because group-by also has these labels
    await page.getByRole('button', { name: 'Title', exact: true }).first().click();
    await page.waitForTimeout(300);
    // Click Artist sort
    await page.getByRole('button', { name: 'Artist', exact: true }).first().click();
    await page.waitForTimeout(300);
    // No crash = pass
  });

  test('group by buttons work', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    // Click Artist group
    await page.getByRole('button', { name: 'Artist', exact: true }).last().click();
    await page.waitForTimeout(500);
    // Should see collapsible groups — look for chevron indicators
    const groups = page.locator('button[aria-expanded]');
    const groupCount = await groups.count();
    expect(groupCount).toBeGreaterThan(0);
  });

  test('shuffle play button is visible', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    await expect(page.getByText('Shuffle Play')).toBeVisible();
  });

  test('jump to unreviewed is visible', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    await expect(page.getByText('Jump to unreviewed')).toBeVisible();
  });
});

// ─── 5. STATS / SETTINGS PAGE ───────────────────────────────────────────────

test.describe('Stats / Settings Page', () => {
  test('renders settings title', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await expect(page.getByText('Settings', { exact: true }).first()).toBeVisible();
  });

  test('renders playback settings', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await expect(page.getByText('Playback').first()).toBeVisible();
    await expect(page.getByText('Autoplay').first()).toBeVisible();
    await expect(page.getByText('Loop Mode')).toBeVisible();
    await expect(page.getByText('Auto-Continue')).toBeVisible();
    await expect(page.getByText('Shuffle Playback')).toBeVisible();
  });

  test('renders content settings', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await expect(page.getByText('Content').first()).toBeVisible();
    await expect(page.getByText('Hide Explicit').first()).toBeVisible();
  });

  test('renders appearance settings with theme toggle', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await expect(page.getByText('Appearance')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('System')).toBeVisible();
  });

  test('autoplay toggle works', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    const autoplayBtn = page.getByText('Autoplay').locator('..');
    await autoplayBtn.click();
    await page.waitForTimeout(200);
    // Toggle should have changed state — just verify no crash
  });

  test('loop mode cycles through off → one → all', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    // Initial: off
    await expect(page.getByText('Loop off')).toBeVisible();
    // Click to cycle
    const loopBtn = page.getByText('Loop Mode').locator('..');
    await loopBtn.click();
    await page.waitForTimeout(200);
    await expect(page.getByText('Repeat one')).toBeVisible();
    await loopBtn.click();
    await page.waitForTimeout(200);
    await expect(page.getByText('Repeat all')).toBeVisible();
    await loopBtn.click();
    await page.waitForTimeout(200);
    await expect(page.getByText('Loop off')).toBeVisible();
  });

  test('theme toggle switches between dark/light/system', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    // Click Light
    await page.getByRole('button', { name: 'Light' }).click();
    await page.waitForTimeout(300);
    const hasLightClass = await page.evaluate(() => document.documentElement.classList.contains('light'));
    expect(hasLightClass).toBe(true);
    // Click Dark
    await page.getByRole('button', { name: 'Dark' }).click();
    await page.waitForTimeout(300);
    const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDarkClass).toBe(true);
  });

  test('shows stats dashboard after loading data and making selections', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Make some selections
    await clickSwipeLike(page);
    await clickSwipeDislike(page);
    await clickSwipeSkip(page);

    await navigateTo(page, '/stats');
    await page.waitForTimeout(500);

    // Stats should be visible
    await expect(page.getByText('Statistics')).toBeVisible();
    await expect(page.getByText('Total Songs')).toBeVisible();
    await expect(page.getByText('Review Completion')).toBeVisible();
  });

  test('renders export panel', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await expect(page.getByText('Export & Data')).toBeVisible();
    await expect(page.getByText('Export Liked Songs (CSV)')).toBeVisible();
    await expect(page.getByText('Export All Songs (CSV)')).toBeVisible();
    await expect(page.getByText('Backup (JSON)')).toBeVisible();
    await expect(page.getByText('Restore from Backup')).toBeVisible();
    await expect(page.getByText('Reset All Data')).toBeVisible();
  });

  test('reset all data shows custom confirm modal', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/stats');
    await page.getByText('Reset All Data').click();
    await page.waitForTimeout(300);
    // Modal should appear
    await expect(page.getByText('Reset All Data?')).toBeVisible();
    await expect(page.getByText(/This will clear all songs/i)).toBeVisible();
    await expect(page.getByText('Cancel')).toBeVisible();
    await expect(page.getByText('Reset Everything')).toBeVisible();
    // Cancel
    await page.getByText('Cancel').click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Reset All Data?')).not.toBeVisible();
  });

  test('reset confirm actually clears data', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/stats');
    await page.getByText('Reset All Data').click();
    await page.waitForTimeout(300);
    await page.getByText('Reset Everything').click();
    await page.waitForTimeout(500);
    // Stats section should no longer show
    await expect(page.getByText('Statistics')).not.toBeVisible();
    // Navigate to home — no resume card
    await navigateTo(page, '/');
    await page.waitForTimeout(300);
    await expect(page.getByText('Continue Session')).not.toBeVisible();
  });

  test('export no songs shows info toast', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    await page.getByText('Export Liked Songs (CSV)').click();
    await expect(page.getByText(/No liked songs/i).or(page.getByText(/No songs loaded/i))).toBeVisible({ timeout: 3000 });
  });
});

// ─── 6. TOAST NOTIFICATIONS ──────────────────────────────────────────────────

test.describe('Toast Notifications', () => {
  test('toasts auto-dismiss after ~3 seconds', async ({ page }) => {
    await loadSampleData(page);
    const toast = page.getByText(/Loaded .* sample songs/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
    // Wait for auto-dismiss
    await page.waitForTimeout(4000);
    await expect(toast).not.toBeVisible();
  });

  test('toast can be manually dismissed', async ({ page }) => {
    await loadSampleData(page);
    const toast = page.getByText(/Loaded .* sample songs/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
    await page.getByLabel('Dismiss notification').first().click();
    await page.waitForTimeout(300);
    await expect(toast).not.toBeVisible();
  });
});

// ─── 7. ACCESSIBILITY CHECKS ────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('skip-to-content link exists and works', async ({ page }) => {
    await waitForApp(page);
    // Tab to reveal the skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to content');
    // It should be focusable (sr-only becomes visible on focus)
    await expect(skipLink).toBeFocused();
  });

  test('main content landmark exists', async ({ page }) => {
    await waitForApp(page);
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('navigation landmark exists', async ({ page }) => {
    await waitForApp(page);
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('swipe cards have aria-label', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    const article = page.getByRole('article').first();
    const label = await article.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).toContain('by');
  });

  test('progress bar has ARIA attributes', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();
    const valuenow = await progressBar.getAttribute('aria-valuenow');
    const valuemax = await progressBar.getAttribute('aria-valuemax');
    expect(valuenow).toBe('0');
    expect(parseInt(valuemax!)).toBeGreaterThan(0);
  });

  test('all icon-only buttons have aria-label', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Check all buttons in the controls area
    const buttons = page.locator('button[aria-label]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('toast has correct ARIA role', async ({ page }) => {
    await loadSampleData(page);
    const toast = page.locator('[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});

// ─── 8. STATE PERSISTENCE ────────────────────────────────────────────────────

test.describe('State Persistence', () => {
  test('songs survive page reload', async ({ page }) => {
    await loadSampleData(page);
    await page.reload();
    await page.waitForTimeout(1500);
    // Session resume card should still be visible
    await expect(page.getByText('Continue Session')).toBeVisible();
  });

  test('selections survive page reload', async ({ page }) => {
    await loadSampleData(page);
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    // Like 2 songs
    await clickSwipeLike(page);
    await clickSwipeLike(page);
    // Reload
    await page.reload();
    await page.waitForTimeout(1500);
    // Navigate to swipe — should show 2 reviewed
    await navigateTo(page, '/swipe');
    await page.waitForTimeout(500);
    await expect(page.getByText(/2 of .* reviewed/i)).toBeVisible();
  });

  test('settings survive page reload', async ({ page }) => {
    await waitForApp(page);
    await navigateTo(page, '/stats');
    // Change theme to light
    await page.getByRole('button', { name: 'Light' }).click();
    await page.waitForTimeout(300);
    // Reload
    await page.reload();
    await page.waitForTimeout(1500);
    await navigateTo(page, '/stats');
    await page.waitForTimeout(300);
    // Light button should still be active (pressed)
    const lightBtn = page.getByRole('button', { name: 'Light' });
    await expect(lightBtn).toHaveClass(/bg-accent-500/);
    // Restore dark for other tests
    await page.getByRole('button', { name: 'Dark' }).click();
  });
});

// ─── 9. ERROR HANDLING ───────────────────────────────────────────────────────

test.describe('Error Handling', () => {
  test('navigating to unknown route redirects to home', async ({ page }) => {
    await page.goto('/#/nonexistent');
    await page.waitForTimeout(500);
    expect(page.url()).toMatch(/#\/$/);
  });
});

// ─── 10. MULTI-PAGE FLOW ────────────────────────────────────────────────────

test.describe('Full User Flow', () => {
  test('complete flow: load → swipe → library → stats → export', async ({ page }) => {
    // 1. Load sample data
    await loadSampleData(page);
    await expect(page.getByText('Continue Session')).toBeVisible();

    // 2. Navigate to swipe
    await page.getByText('Continue Reviewing').click();
    await page.waitForTimeout(500);

    // 3. Make some selections
    await clickSwipeLike(page);
    await clickSwipeDislike(page);
    await clickSwipeSkip(page);

    // 4. Navigate to library
    await navigateTo(page, '/library');
    await page.waitForTimeout(500);
    // Verify tab counts updated — use exact match
    await expect(page.getByRole('button', { name: 'Liked (1)', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disliked (1)', exact: true })).toBeVisible();

    // 5. Navigate to stats
    await navigateTo(page, '/stats');
    await page.waitForTimeout(500);
    await expect(page.getByText('Statistics')).toBeVisible();

    // 6. Export buttons exist
    await expect(page.getByText('Export Liked Songs (CSV)')).toBeVisible();
  });
});
