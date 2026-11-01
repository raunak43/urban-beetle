// Load order for a scroll-scrubbed frame sequence, for progressive quality: a coarse pass across the
// whole video first (so scrubbing works almost immediately), then the gaps filled in. `critical` is
// the length of that coarse pass.
export function buildLoadOrder(count: number) {
  const order: number[] = [];
  const seen = new Uint8Array(count);
  const push = (i: number) => {
    if (!seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  let critical = 0;
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) push(i);
    if (stride === 8) critical = order.length;
  }
  return { order, critical };
}
