import { test, expect, type Page } from '@playwright/test';

// This test file simulates a real user exploring every part of the app
// and captures DOM state, console errors, and visual issues.

const CONSOLE_ERRORS: string[] = [];

test.describe('Real User Exploration', () => {

  test('Full app exploration — find bugs', async ({ page }) => {
    // Collect ALL console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        CONSOLE_ERRORS.push(`[CONSOLE ERROR] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      CONSOLE_ERRORS.push(`[PAGE ERROR] ${err.message}`);
    });

    // ──────────── HOME PAGE ────────────
    await page.goto('/');
    await page.waitForTimeout(1000);

    // CHECK: No JS errors on load
    const initialErrors = [...CONSOLE_ERRORS];

    // CHECK: Title visible
    await expect(page.locator('h1')).toContainText('Music Selector');

    // CHECK: DropZone clickable area
    const dropzone = page.getByText(/Drop your CSV file here/i);
    await expect(dropzone).toBeVisible();

    // CHECK: Load Sample Data button
    const sampleBtn = page.getByText(/Load Sample Data/i);
    await expect(sampleBtn).toBeVisible();

    // ──────────── LOAD SAMPLE DATA ────────────
    await sampleBtn.click();
    await page.waitForTimeout(3000);

    // CHECK: Toast appeared
    const toast = page.getByText(/Loaded .* sample songs/i);
    await expect(toast).toBeVisible({ timeout: 5000 });

    // CHECK: Resume card appeared
    await expect(page.getByText('Continue Session')).toBeVisible();

    // BUG CHECK: Does the resume card show correct song count?
    const songCountText = await page.locator('text=/\\d+ songs/').first().textContent();
    console.log(`[INFO] Song count on resume card: "${songCountText}"`);

    // CHECK: Continue Reviewing button
    const continueBtn = page.getByText('Continue Reviewing');
    await expect(continueBtn).toBeVisible();

    // ──────────── NAVIGATE TO SWIPE ────────────
    await continueBtn.click();
    await page.waitForTimeout(800);
    expect(page.url()).toContain('#/swipe');

    // CHECK: Card is visible
    const card = page.getByRole('article').first();
    await expect(card).toBeVisible();

    // CHECK: Card has song info
    const cardTitle = await card.locator('h2').textContent();
    const cardArtist = await card.locator('p').first().textContent();
    console.log(`[INFO] First card: "${cardTitle}" by "${cardArtist}"`);
    expect(cardTitle).toBeTruthy();
    expect(cardArtist).toBeTruthy();

    // CHECK: Progress bar
    const progressText = await page.getByText(/of .* reviewed/i).textContent();
    console.log(`[INFO] Progress: "${progressText}"`);
    expect(progressText).toContain('0 of');

    // CHECK: Remaining count
    await expect(page.getByText(/remaining/i)).toBeVisible();

    // CHECK: All control buttons present and accessible
    const likeBtn = page.locator('button[aria-label="Like this song"]').first();
    const dislikeBtn = page.locator('button[aria-label="Dislike this song"]').first();
    const skipBtn = page.locator('button[aria-label="Skip this song"]').first();
    const playBtn = page.locator('button[aria-label="Play or pause"]').first();
    const undoBtn = page.locator('button[aria-label="Undo last selection"]').first();

    await expect(likeBtn).toBeVisible();
    await expect(dislikeBtn).toBeVisible();
    await expect(skipBtn).toBeVisible();
    await expect(playBtn).toBeVisible();
    await expect(undoBtn).toBeVisible();

    // BUG CHECK: Undo should be disabled with no history
    await expect(undoBtn).toBeDisabled();

    // ──────────── SWIPE INTERACTIONS ────────────
    // Like song 1
    const title1 = await card.locator('h2').textContent();
    await likeBtn.click();
    await page.waitForTimeout(600);

    // BUG CHECK: Card should have changed
    const title2 = await page.getByRole('article').first().locator('h2').textContent();
    console.log(`[INFO] After like: card changed from "${title1}" to "${title2}"`);
    expect(title2).not.toBe(title1);

    // BUG CHECK: Progress updated
    await expect(page.getByText(/1 of .* reviewed/i)).toBeVisible();

    // BUG CHECK: Undo now enabled
    await expect(undoBtn).toBeEnabled();

    // Dislike song 2
    await dislikeBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/2 of .* reviewed/i)).toBeVisible();

    // Skip song 3
    await skipBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/3 of .* reviewed/i)).toBeVisible();

    // Undo — should restore song 3 (skipped)
    await undoBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/2 of .* reviewed/i)).toBeVisible();

    // Keyboard: → to like
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await expect(page.getByText(/3 of .* reviewed/i)).toBeVisible();

    // Keyboard: ← to dislike
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(600);
    await expect(page.getByText(/4 of .* reviewed/i)).toBeVisible();

    // Keyboard: ↑ to skip
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(600);
    await expect(page.getByText(/5 of .* reviewed/i)).toBeVisible();

    // Keyboard: z to undo
    await page.keyboard.press('z');
    await page.waitForTimeout(600);
    await expect(page.getByText(/4 of .* reviewed/i)).toBeVisible();

    // ──────────── LIBRARY PAGE ────────────
    await page.getByRole('navigation').getByText('Library').click();
    await page.waitForTimeout(800);

    // CHECK: Search bar
    const searchInput = page.getByPlaceholder('Search songs...');
    await expect(searchInput).toBeVisible();

    // CHECK: Tab counts reflect selections
    // We have 2 liked (song1 + keyboard →), 2 disliked (song2 + keyboard ←), rest unreviewed
    const likedTab = page.getByRole('button', { name: /^Liked \(2\)/, exact: false });
    const dislikedTab = page.getByRole('button', { name: /^Disliked \(2\)/, exact: false });
    await expect(likedTab).toBeVisible();
    await expect(dislikedTab).toBeVisible();
    console.log('[INFO] Library tab counts match expected selections (2 liked, 2 disliked)');

    // CHECK: Result count
    const resultCount = await page.getByText(/^\d+ songs$/).textContent();
    console.log(`[INFO] Library result count: "${resultCount}"`);

    // BUG CHECK: Search filtering
    await searchInput.fill('Walk Of Life');
    await page.waitForTimeout(400);
    const filteredCount = await page.getByText(/^\d+ songs$/).textContent();
    console.log(`[INFO] Filtered count for "Walk Of Life": "${filteredCount}"`);
    const filteredNum = parseInt(filteredCount || '0');
    expect(filteredNum).toBeGreaterThan(0);
    expect(filteredNum).toBeLessThan(1200);

    // BUG CHECK: Search highlight — look for <mark> elements
    const marks = page.locator('mark');
    const markCount = await marks.count();
    console.log(`[INFO] Search highlight <mark> elements: ${markCount}`);
    // Should have highlight marks
    expect(markCount).toBeGreaterThan(0);

    // Clear search
    await page.getByLabel('Clear search').click();
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveValue('');

    // BUG CHECK: Sort by Title
    await page.getByRole('button', { name: 'Title', exact: true }).first().click();
    await page.waitForTimeout(400);
    // No crash = OK

    // BUG CHECK: Sort direction toggle
    const dirBtn = page.locator('button[aria-label*="Sort"]');
    if (await dirBtn.count() > 0) {
      await dirBtn.first().click();
      await page.waitForTimeout(300);
      console.log('[INFO] Sort direction toggled');
    }

    // BUG CHECK: Group by Artist
    await page.getByRole('button', { name: 'Artist', exact: true }).last().click();
    await page.waitForTimeout(600);
    const groups = page.locator('button[aria-expanded]');
    const groupCount = await groups.count();
    console.log(`[INFO] Group by Artist: ${groupCount} collapsible groups`);
    expect(groupCount).toBeGreaterThan(0);

    // BUG CHECK: Collapse a group
    if (groupCount > 0) {
      await groups.first().click();
      await page.waitForTimeout(300);
      const isExpanded = await groups.first().getAttribute('aria-expanded');
      console.log(`[INFO] First group after click: aria-expanded=${isExpanded}`);
      // Should be collapsed now
      expect(isExpanded).toBe('false');
      // Re-expand
      await groups.first().click();
      await page.waitForTimeout(300);
    }

    // Reset grouping
    await page.getByRole('button', { name: 'None', exact: true }).click();
    await page.waitForTimeout(300);

    // BUG CHECK: Click Liked tab, verify only liked songs shown
    await page.getByRole('button', { name: /^Liked \(/, exact: false }).click();
    await page.waitForTimeout(300);
    const likedCount = await page.getByText(/^\d+ songs$/).textContent();
    console.log(`[INFO] Liked tab songs: "${likedCount}"`);
    expect(parseInt(likedCount || '0')).toBe(2);

    // BUG CHECK: Unreviewed tab
    await page.getByRole('button', { name: /^Unreviewed \(/, exact: false }).click();
    await page.waitForTimeout(300);
    const unreviewedCount = await page.getByText(/^\d+ songs$/).textContent();
    console.log(`[INFO] Unreviewed tab songs: "${unreviewedCount}"`);

    // Back to All
    await page.getByRole('button', { name: /^All \(/, exact: false }).click();
    await page.waitForTimeout(300);

    // ──────────── STATS / SETTINGS PAGE ────────────
    await page.getByRole('navigation').getByText('Settings').click();
    await page.waitForTimeout(800);

    // CHECK: Settings rendered
    await expect(page.getByText('Settings', { exact: true }).first()).toBeVisible();

    // CHECK: Stats visible (since we have songs loaded)
    await expect(page.getByText('Statistics')).toBeVisible();
    await expect(page.getByText('Total Songs')).toBeVisible();
    await expect(page.getByText('Review Completion')).toBeVisible();

    // BUG CHECK: Stats card values
    const totalCard = page.locator('text="Total Songs"').locator('..');
    const totalValue = await totalCard.locator('p.text-2xl').textContent();
    console.log(`[INFO] Total Songs stat card value: "${totalValue}"`);
    expect(parseInt(totalValue || '0')).toBeGreaterThan(1000);

    // BUG CHECK: Completion % bar
    const completionPercent = await page.locator('text="Review Completion"').locator('..').locator('.text-sm.font-bold').textContent();
    console.log(`[INFO] Completion: "${completionPercent}"`);

    // BUG CHECK: Distribution bar (should exist since we have reviewed songs)
    await expect(page.getByText('Review Distribution')).toBeVisible();

    // BUG CHECK: Toggle autoplay
    const autoplayRow = page.getByText('Autoplay').locator('..');
    await autoplayRow.click();
    await page.waitForTimeout(200);
    // Click again to restore
    await autoplayRow.click();
    await page.waitForTimeout(200);

    // BUG CHECK: Theme toggle
    await page.getByRole('button', { name: 'Light' }).click();
    await page.waitForTimeout(400);
    let htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log(`[INFO] After Light theme: html class="${htmlClass}"`);
    expect(htmlClass).toContain('light');

    await page.getByRole('button', { name: 'Dark' }).click();
    await page.waitForTimeout(400);
    htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log(`[INFO] After Dark theme: html class="${htmlClass}"`);
    expect(htmlClass).toContain('dark');

    // BUG CHECK: Export buttons exist
    await expect(page.getByText('Export & Data')).toBeVisible();
    await expect(page.getByText('Export Liked Songs (CSV)')).toBeVisible();
    await expect(page.getByText('Export All Songs (CSV)')).toBeVisible();
    await expect(page.getByText('Backup (JSON)')).toBeVisible();
    await expect(page.getByText('Restore from Backup')).toBeVisible();
    await expect(page.getByText('Reset All Data')).toBeVisible();

    // BUG CHECK: Reset modal workflow
    await page.getByText('Reset All Data').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Reset All Data?')).toBeVisible();
    // Escape key should close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(page.getByText('Reset All Data?')).not.toBeVisible();
    console.log('[INFO] Escape key closes confirm modal ✓');

    // ──────────── GO BACK TO HOME ────────────
    await page.getByRole('navigation').getByText('Upload').click();
    await page.waitForTimeout(500);

    // BUG CHECK: Resume card still shows after navigating around
    await expect(page.getByText('Continue Session')).toBeVisible();

    // BUG CHECK: How To Use modal
    await page.getByText('How To Use').click();
    await page.waitForTimeout(400);
    await expect(page.getByText(/Step 1: Get Your Songs/i)).toBeVisible();
    await expect(page.getByText(/Swipe right/i)).toBeVisible();
    await expect(page.getByText(/Tips/i)).toBeVisible();

    // BUG CHECK: Scroll modal content
    const modalContent = page.locator('.overflow-y-auto').first();
    if (await modalContent.isVisible()) {
      await modalContent.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(200);
      console.log('[INFO] Modal scrolled to bottom ✓');
    }

    // Close modal
    await page.getByLabel('Close').click();
    await page.waitForTimeout(300);

    // ──────────── EDGE CASE: Rapid swipes ────────────
    await page.getByRole('navigation').getByText('Swipe').click();
    await page.waitForTimeout(500);

    // Rapid-fire 5 likes quickly
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(500);

    // BUG CHECK: Progress should show 4 + 5 = 9 reviewed
    const progressAfterRapid = await page.getByText(/of .* reviewed/i).textContent();
    console.log(`[INFO] After rapid swipes: "${progressAfterRapid}"`);
    expect(progressAfterRapid).toContain('9 of');

    // ──────────── EDGE CASE: Multiple undos ────────────
    await page.keyboard.press('z');
    await page.waitForTimeout(300);
    await page.keyboard.press('z');
    await page.waitForTimeout(300);
    await page.keyboard.press('z');
    await page.waitForTimeout(300);
    const progressAfterUndos = await page.getByText(/of .* reviewed/i).textContent();
    console.log(`[INFO] After 3 undos: "${progressAfterUndos}"`);
    expect(progressAfterUndos).toContain('6 of');

    // ──────────── FINAL: Check for console errors ────────────
    console.log(`\n[SUMMARY] Total console errors collected: ${CONSOLE_ERRORS.length}`);
    for (const err of CONSOLE_ERRORS) {
      console.log(err);
    }

    // Filter out known non-critical errors (CSP reports, SW registration in dev)
    const criticalErrors = CONSOLE_ERRORS.filter(e =>
      !e.includes('Content-Security-Policy') &&
      !e.includes('service-worker') &&
      !e.includes('favicon') &&
      !e.includes('Manifest') &&
      !e.includes('icon-192') &&
      !e.includes('icon-512') &&
      !e.includes('screenshot') &&
      !e.includes('splash') &&
      !e.includes('googleads') &&
      !e.includes('doubleclick') &&
      !e.includes('CORS policy') &&
      !e.includes('net::ERR_FAILED') &&
      !e.includes('pagead')
    );

    console.log(`[SUMMARY] Critical errors: ${criticalErrors.length}`);
    for (const err of criticalErrors) {
      console.log(`  CRITICAL: ${err}`);
    }

    // No critical JS errors should exist
    expect(criticalErrors.length).toBe(0);
  });
});
