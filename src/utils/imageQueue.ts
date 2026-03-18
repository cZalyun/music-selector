const MAX_CONCURRENT = 2;
const DELAY_MS = 300; // ms between releasing a slot and starting the next
let active = 0;
const queue: Array<() => void> = [];

function processQueue() {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;
  const next = queue.shift();
  if (next) {
    active++;
    next();
  }
}

function release() {
  active--;
  // Stagger the next request to avoid 429s
  setTimeout(processQueue, DELAY_MS);
}

/**
 * Returns a promise that resolves when a slot is available.
 * Call the returned release function when the image finishes loading/erroring.
 */
export function acquireSlot(): Promise<() => void> {
  return new Promise<() => void>((resolve) => {
    const start = () => resolve(release);
    if (active < MAX_CONCURRENT) {
      active++;
      start();
    } else {
      queue.push(() => start());
    }
  });
}
