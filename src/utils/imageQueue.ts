// To prevent HTTP 429 rate limits from Google and YouTube CDNs
const MAX_CONCURRENT = 2;
const DELAY_MS = 300; // Delay between releasing slots

let activeCount = 0;
const queue: Array<() => void> = [];

export function acquireSlot(): Promise<() => void> {
  return new Promise((resolve) => {
    const startLoad = () => {
      activeCount++;
      // Return the release function
      resolve(() => {
        // When released, wait DELAY_MS before processing the next in queue
        setTimeout(() => {
          activeCount--;
          if (queue.length > 0) {
            const next = queue.shift();
            if (next) next();
          }
        }, DELAY_MS);
      });
    };

    if (activeCount < MAX_CONCURRENT) {
      startLoad();
    } else {
      queue.push(startLoad);
    }
  });
}
