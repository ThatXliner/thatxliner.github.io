/** One optical GPU submission at a time; refinement never waits on the CPU. */
export function createOpticalWorkQueue(gl: WebGL2RenderingContext) {
  let disposed = false;
  let tail: Promise<unknown> = Promise.resolve();
  let releasePending: (() => void) | undefined;

  function run(draw: () => void, signal?: AbortSignal): Promise<boolean> {
    const job = tail.then(async () => {
      if (disposed || signal?.aborted) return false;
      if (gl.isContextLost()) throw new Error("Optical WebGL context lost");
      draw();
      const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!fence) throw new Error("Optical GPU fence unavailable");
      gl.flush();
      await new Promise<void>((resolve, reject) => {
        let frame = 0;
        const finish = (error?: Error) => {
          cancelAnimationFrame(frame);
          gl.deleteSync(fence);
          releasePending = undefined;
          if (error) reject(error);
          else resolve();
        };
        releasePending = () => finish();
        const poll = () => {
          if (gl.isContextLost()) {
            finish(new Error("Optical WebGL context lost"));
            return;
          }
          const state = gl.clientWaitSync(fence, 0, 0);
          if (state === gl.WAIT_FAILED) {
            finish(new Error("Optical GPU fence failed"));
          } else if (
            state === gl.ALREADY_SIGNALED ||
            state === gl.CONDITION_SATISFIED
          ) {
            finish();
          } else {
            frame = requestAnimationFrame(poll);
          }
        };
        frame = requestAnimationFrame(poll);
      });
      // Submitted work cannot be cancelled on the GPU. Wait for its fence even
      // after invalidation so the next view cannot pile up GPU submissions.
      return !disposed && !signal?.aborted;
    });
    tail = job.catch(() => {});
    return job;
  }

  return {
    run,
    dispose() {
      if (disposed) return;
      disposed = true;
      releasePending?.();
    },
  };
}
