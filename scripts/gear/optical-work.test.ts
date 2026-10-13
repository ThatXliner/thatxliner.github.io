import { afterEach, expect, test } from 'bun:test';
import { createOpticalWorkQueue } from '../../src/classic/lib/gear/optical-work';
const originalRequest = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;
afterEach(() => {
  globalThis.requestAnimationFrame = originalRequest;
  globalThis.cancelAnimationFrame = originalCancel;
});
function harness() {
  const frames = new Map<number, FrameRequestCallback>();
  let next = 0, ready = false, deleted = 0, lost = false;
  globalThis.requestAnimationFrame = (cb) => { frames.set(++next, cb); return next; };
  globalThis.cancelAnimationFrame = (id) => { frames.delete(id); };
  const gl = {
    SYNC_GPU_COMMANDS_COMPLETE: 1, WAIT_FAILED: 2, ALREADY_SIGNALED: 3,
    CONDITION_SATISFIED: 4, TIMEOUT_EXPIRED: 5,
    isContextLost: () => lost,
    fenceSync: () => ({}), flush: () => {}, deleteSync: () => { deleted++; },
    clientWaitSync: (_f: unknown, flags: number, timeout: number) => {
      expect(flags).toBe(0); expect(timeout).toBe(0);
      return ready ? 4 : 5;
    },
  } as unknown as WebGL2RenderingContext;
  return {
    queue: createOpticalWorkQueue(gl),
    ready() { ready = true; }, lost() { lost = true; },
    deleted: () => deleted, pending: () => frames.size,
    async tick() { const callbacks = [...frames.values()]; frames.clear(); for (const cb of callbacks) cb(0); await new Promise(resolve => setTimeout(resolve, 0)); },
  };
}
test('serializes GPU submissions and suppresses invalidated results', async () => {
  const h = harness(), abort = new AbortController(), calls: string[] = [];
  const first = h.queue.run(() => calls.push('first'), abort.signal);
  const second = h.queue.run(() => calls.push('second'));
  await h.tick(); expect(calls).toEqual(['first']);
  abort.abort(); await h.tick(); expect(calls).toEqual(['first']);
  h.ready(); await h.tick(); expect(await first).toBe(false);
  expect(calls).toEqual(['first', 'second']);
  await h.tick(); expect(await second).toBe(true);
  expect(h.deleted()).toBe(2); h.queue.dispose();
});
test('disposal settles active and queued work and releases its fence', async () => {
  const h = harness(); let calls = 0;
  const first = h.queue.run(() => calls++), second = h.queue.run(() => calls++);
  await h.tick(); h.queue.dispose(); h.queue.dispose();
  expect(await first).toBe(false); expect(await second).toBe(false);
  expect(calls).toBe(1); expect(h.deleted()).toBe(1); expect(h.pending()).toBe(0);
});
test('queued cancellation never submits work', async () => {
  const h = harness(), abort = new AbortController(); let called = false;
  abort.abort(); expect(await h.queue.run(() => { called = true; }, abort.signal)).toBe(false);
  expect(called).toBe(false); expect(h.deleted()).toBe(0); h.queue.dispose();
});
test('context loss rejects and cleans up its outstanding fence', async () => {
  const h = harness(); const job = h.queue.run(() => {});
  const result = job.catch(error => error);
  await h.tick(); h.lost(); await h.tick(); expect((await result).message).toContain('context lost');
  expect(h.deleted()).toBe(1); expect(h.pending()).toBe(0); h.queue.dispose();
});
