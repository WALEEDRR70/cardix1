// Parse / serialize the pen-tool path data (0..100 grid) into editable anchors.
export type Anchor = {
  x: number;
  y: number;
  /** Incoming control point (from the previous anchor). */
  ix: number;
  iy: number;
  /** Outgoing control point (towards the next anchor). */
  ox: number;
  oy: number;
  /** Handles stay mirrored (smooth) when true. */
  smooth: boolean;
};

export type ParsedPath = { anchors: Anchor[]; closed: boolean };

const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function nearlyMirrored(a: Anchor): boolean {
  const dx = a.ox - a.x + (a.ix - a.x);
  const dy = a.oy - a.y + (a.iy - a.y);
  return Math.hypot(dx, dy) < 0.4;
}

/** Parses M / L / C / Z commands (the shapes the pen tool and AI emit). */
export function parsePath(d: string): ParsedPath {
  const anchors: Anchor[] = [];
  let closed = false;
  const cmds = d.match(/[MLCZmlcz][^MLCZmlcz]*/g) ?? [];
  let cur = { x: 0, y: 0 };

  for (const cmd of cmds) {
    const type = cmd[0];
    const rel = type === type.toLowerCase();
    const nums = (cmd.slice(1).match(NUM) ?? []).map(Number);
    const t = type.toUpperCase();

    if (t === "Z") { closed = true; continue; }
    if (t === "M") {
      const x = (rel ? cur.x : 0) + nums[0];
      const y = (rel ? cur.y : 0) + nums[1];
      anchors.push({ x, y, ix: x, iy: y, ox: x, oy: y, smooth: true });
      cur = { x, y };
      continue;
    }
    if (t === "L") {
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = (rel ? cur.x : 0) + nums[i];
        const y = (rel ? cur.y : 0) + nums[i + 1];
        anchors.push({ x, y, ix: x, iy: y, ox: x, oy: y, smooth: false });
        cur = { x, y };
      }
      continue;
    }
    if (t === "C") {
      for (let i = 0; i + 5 < nums.length; i += 6) {
        const base = rel ? cur : { x: 0, y: 0 };
        const c1 = { x: base.x + nums[i], y: base.y + nums[i + 1] };
        const c2 = { x: base.x + nums[i + 2], y: base.y + nums[i + 3] };
        const p = { x: base.x + nums[i + 4], y: base.y + nums[i + 5] };
        const prev = anchors[anchors.length - 1];
        if (prev) { prev.ox = c1.x; prev.oy = c1.y; }
        anchors.push({ x: p.x, y: p.y, ix: c2.x, iy: c2.y, ox: p.x, oy: p.y, smooth: true });
        cur = p;
      }
    }
  }

  // A closing curve lands back on the first anchor: fold it away.
  if (closed && anchors.length > 1) {
    const last = anchors[anchors.length - 1];
    const first = anchors[0];
    if (Math.hypot(last.x - first.x, last.y - first.y) < 0.5) {
      first.ix = last.ix;
      first.iy = last.iy;
      anchors.pop();
      const newLast = anchors[anchors.length - 1];
      if (newLast) { newLast.ox = last.ox === last.x ? newLast.ox : last.ox; }
    }
  }

  for (const a of anchors) {
    const hasOut = Math.hypot(a.ox - a.x, a.oy - a.y) > 0.01;
    const hasIn = Math.hypot(a.ix - a.x, a.iy - a.y) > 0.01;
    a.smooth = hasOut && hasIn ? nearlyMirrored(a) : false;
  }

  return { anchors, closed };
}

export function serializePath(anchors: Anchor[], closed: boolean): string {
  if (!anchors.length) return "";
  const f = (v: number) => v.toFixed(2);
  let d = `M ${f(anchors[0].x)} ${f(anchors[0].y)}`;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    d += ` C ${f(a.ox)} ${f(a.oy)}, ${f(b.ix)} ${f(b.iy)}, ${f(b.x)} ${f(b.y)}`;
  }
  if (closed && anchors.length > 1) {
    const a = anchors[anchors.length - 1];
    const b = anchors[0];
    d += ` C ${f(a.ox)} ${f(a.oy)}, ${f(b.ix)} ${f(b.iy)}, ${f(b.x)} ${f(b.y)} Z`;
  }
  return d;
}

/** Moves one handle and mirrors the opposite one when the anchor is smooth. */
export function moveHandle(a: Anchor, which: "in" | "out", x: number, y: number, breakSmooth: boolean): Anchor {
  const next: Anchor = { ...a, smooth: breakSmooth ? false : a.smooth };
  if (which === "out") {
    next.ox = x; next.oy = y;
    if (next.smooth) { next.ix = 2 * a.x - x; next.iy = 2 * a.y - y; }
  } else {
    next.ix = x; next.iy = y;
    if (next.smooth) { next.ox = 2 * a.x - x; next.oy = 2 * a.y - y; }
  }
  return next;
}

/** Corner <-> smooth toggle: mirrors handles around the anchor or collapses them. */
export function toggleSmooth(a: Anchor): Anchor {
  if (a.smooth) return { ...a, smooth: false };
  const hasOut = Math.hypot(a.ox - a.x, a.oy - a.y) > 0.01;
  const src = hasOut ? { x: a.ox, y: a.oy } : { x: a.ix, y: a.iy };
  const len = Math.hypot(src.x - a.x, src.y - a.y);
  if (len < 0.01) return { ...a, smooth: true, ox: a.x + 8, oy: a.y, ix: a.x - 8, iy: a.y };
  return hasOut
    ? { ...a, smooth: true, ix: 2 * a.x - a.ox, iy: 2 * a.y - a.oy }
    : { ...a, smooth: true, ox: 2 * a.x - a.ix, oy: 2 * a.y - a.iy };
}

/** Flips both handles 180° around the anchor (reverses handle direction). */
export function flipHandles(a: Anchor): Anchor {
  return { ...a, ix: 2 * a.x - a.ix, iy: 2 * a.y - a.iy, ox: 2 * a.x - a.ox, oy: 2 * a.y - a.oy };
}

export function moveAnchor(a: Anchor, x: number, y: number): Anchor {
  const dx = x - a.x;
  const dy = y - a.y;
  return { ...a, x, y, ix: a.ix + dx, iy: a.iy + dy, ox: a.ox + dx, oy: a.oy + dy };
}
