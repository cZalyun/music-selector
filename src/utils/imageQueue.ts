import { IMAGE_QUEUE_MAX_CONCURRENT, IMAGE_QUEUE_DELAY_MS } from '@/constants';

let active = 0;
const queue: Array<() => void> = [];

function release(): void {
  active--;
  setTimeout(() => {
    if (queue.length > 0) {
      const next = queue.shift();
      if (next) {
        active++;
        next();
      }
    }
  }, IMAGE_QUEUE_DELAY_MS);
}

export function acquireSlot(): Promise<() => void> {
  return new Promise<() => void>((resolve) => {
    const start = () => resolve(release);

    if (active < IMAGE_QUEUE_MAX_CONCURRENT) {
      active++;
      start();
    } else {
      queue.push(start);
    }
  });
}
