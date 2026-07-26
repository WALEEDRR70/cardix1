// Studio editing state: document + selection + undo/redo history.
import { createContext, useContext, useMemo, useReducer, useCallback } from "react";
import {
  type StudioDoc, type StudioNode, type NodeType, node, uid, findNode, flatten,
} from "./types";

export type StudioState = {
  doc: StudioDoc;
  selection: string[];
  past: StudioDoc[];
  future: StudioDoc[];
  zoom: number;
  /** Canvas panning offset in screen px. */
  pan: { x: number; y: number };
  /** Incremented whenever the canvas should re-fit itself to the viewport. */
  fitTick: number;
  grid: boolean;
  snap: boolean;
  guides: boolean;
  /** Internal copy buffer for copy / paste. */
  clipboard: StudioNode[];
  /** Active canvas tool: pointer selection or the free-form pen. */
  tool: StudioTool;
};

export type StudioTool = "select" | "pen" | "node";

export type AlignHow = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";


type Action =
  | { t: "replace"; doc: StudioDoc; history?: boolean }
  | { t: "add"; node: StudioNode }
  | { t: "update"; ids: string[]; patch: Partial<StudioNode>; transient?: boolean }
  | { t: "style"; ids: string[]; patch: Partial<StudioNode["style"]>; transient?: boolean }
  | { t: "remove"; ids: string[] }
  | { t: "duplicate"; ids: string[] }
  | { t: "order"; id: string; dir: "front" | "back" | "forward" | "backward" }
  | { t: "reorder"; ids: string[]; targetId: string | null; place: "before" | "after" | "inside" }
  | { t: "group"; ids: string[] }
  | { t: "ungroup"; id: string }
  | { t: "select"; ids: string[] }
  | { t: "bg"; patch: Partial<StudioDoc["background"]> }
  | { t: "size"; w: number; h: number }
  | { t: "align"; ids: string[]; how: AlignHow }
  | { t: "distribute"; ids: string[]; axis: "h" | "v" }
  | { t: "copy"; ids: string[] }
  | { t: "paste" }
  | { t: "undo" }
  | { t: "redo" }
  | { t: "zoom"; value: number }
  | { t: "pan"; x: number; y: number }
  | { t: "fit" }
  | { t: "toggle"; key: "grid" | "snap" | "guides" }
  | { t: "tool"; value: StudioTool };


const MAX_HISTORY = 60;


function mapNodes(nodes: StudioNode[], fn: (n: StudioNode) => StudioNode): StudioNode[] {
  return nodes.map((n) => {
    const next = fn(n);
    return next.children ? { ...next, children: mapNodes(next.children, fn) } : next;
  });
}

function removeNodes(nodes: StudioNode[], ids: string[]): StudioNode[] {
  return nodes
    .filter((n) => !ids.includes(n.id))
    .map((n) => (n.children ? { ...n, children: removeNodes(n.children, ids) } : n));
}

/** Is `id` inside the subtree of `n` (or the node itself)? */
function containsId(n: StudioNode, id: string): boolean {
  if (n.id === id) return true;
  return (n.children ?? []).some((c) => containsId(c, id));
}

/** Insert `items` relative to `targetId` anywhere in the tree. */
function insertRelative(
  nodes: StudioNode[],
  targetId: string | null,
  items: StudioNode[],
  place: "before" | "after" | "inside",
): StudioNode[] {
  if (targetId === null) return [...nodes, ...items];
  const i = nodes.findIndex((n) => n.id === targetId);
  if (i >= 0) {
    if (place === "inside" && nodes[i].children) {
      const next = [...nodes];
      next[i] = { ...next[i], children: [...(next[i].children ?? []), ...items] };
      return next;
    }
    const next = [...nodes];
    next.splice(place === "before" ? i : i + 1, 0, ...items);
    return next;
  }
  return nodes.map((n) =>
    n.children ? { ...n, children: insertRelative(n.children, targetId, items, place) } : n);
}


function commit(state: StudioState, doc: StudioDoc, history = true): StudioState {
  if (!history) return { ...state, doc };
  return {
    ...state,
    doc,
    past: [...state.past, state.doc].slice(-MAX_HISTORY),
    future: [],
  };
}

function reducer(state: StudioState, a: Action): StudioState {
  const { doc } = state;
  switch (a.t) {
    case "replace":
      return commit(state, a.doc, a.history !== false);
    case "add":
      return { ...commit(state, { ...doc, nodes: [...doc.nodes, a.node] }), selection: [a.node.id] };
    case "update":
      return commit(
        state,
        { ...doc, nodes: mapNodes(doc.nodes, (n) => (a.ids.includes(n.id) ? { ...n, ...a.patch } : n)) },
        !a.transient,
      );
    case "style":
      return commit(
        state,
        {
          ...doc,
          nodes: mapNodes(doc.nodes, (n) =>
            a.ids.includes(n.id) ? { ...n, style: { ...n.style, ...a.patch } } : n),
        },
        !a.transient,
      );
    case "remove":
      return { ...commit(state, { ...doc, nodes: removeNodes(doc.nodes, a.ids) }), selection: [] };
    case "duplicate": {
      const clones = a.ids
        .map((id) => findNode(doc.nodes, id))
        .filter(Boolean)
        .map((n) => cloneNode(n as StudioNode));
      if (clones.length === 0) return state;
      return {
        ...commit(state, { ...doc, nodes: [...doc.nodes, ...clones] }),
        selection: clones.map((c) => c.id),
      };
    }
    case "order": {
      const list = [...doc.nodes];
      const i = list.findIndex((n) => n.id === a.id);
      if (i < 0) return state;
      const [item] = list.splice(i, 1);
      const target =
        a.dir === "front" ? list.length
          : a.dir === "back" ? 0
            : a.dir === "forward" ? Math.min(list.length, i + 1)
              : Math.max(0, i - 1);
      list.splice(target, 0, item);
      return commit(state, { ...doc, nodes: list });
    }
    case "reorder": {
      const moved = a.ids
        .map((id) => findNode(doc.nodes, id))
        .filter(Boolean) as StudioNode[];
      if (moved.length === 0) return state;
      // Never drop a node into its own subtree.
      if (a.targetId && moved.some((m) => containsId(m, a.targetId as string))) return state;
      const without = removeNodes(doc.nodes, a.ids);
      const nodes = insertRelative(without, a.targetId, moved, a.place);
      return { ...commit(state, { ...doc, nodes }), selection: a.ids };
    }
    case "group": {
      const picked = doc.nodes.filter((n) => a.ids.includes(n.id));
      if (picked.length < 2) return state;
      const x = Math.min(...picked.map((n) => n.x));
      const y = Math.min(...picked.map((n) => n.y));
      const w = Math.max(...picked.map((n) => n.x + n.w)) - x;
      const h = Math.max(...picked.map((n) => n.y + n.h)) - y;
      const g = node("group", {
        name: "Group",
        x, y, w, h,
        children: picked.map((n) => ({ ...n, x: n.x - x, y: n.y - y })),
      });
      const rest = doc.nodes.filter((n) => !a.ids.includes(n.id));
      return { ...commit(state, { ...doc, nodes: [...rest, g] }), selection: [g.id] };
    }
    case "ungroup": {
      const g = doc.nodes.find((n) => n.id === a.id && n.type === "group");
      if (!g?.children) return state;
      const freed = g.children.map((c) => ({ ...c, x: c.x + g.x, y: c.y + g.y }));
      const rest = doc.nodes.filter((n) => n.id !== g.id);
      return { ...commit(state, { ...doc, nodes: [...rest, ...freed] }), selection: freed.map((f) => f.id) };
    }
    case "bg":
      return commit(state, { ...doc, background: { ...doc.background, ...a.patch } });
    case "size":
      return commit(state, {
        ...doc,
        w: Math.min(4000, Math.max(200, Math.round(a.w))),
        h: Math.min(4000, Math.max(200, Math.round(a.h))),
      });
    case "select":
      return { ...state, selection: a.ids };
    case "align": {
      const picked = doc.nodes.filter((n) => a.ids.includes(n.id) && !n.locked);
      if (!picked.length) return state;
      const many = picked.length > 1;
      const minX = many ? Math.min(...picked.map((n) => n.x)) : 0;
      const maxX = many ? Math.max(...picked.map((n) => n.x + n.w)) : doc.w;
      const minY = many ? Math.min(...picked.map((n) => n.y)) : 0;
      const maxY = many ? Math.max(...picked.map((n) => n.y + n.h)) : doc.h;
      const move = (n: StudioNode): StudioNode => {
        switch (a.how) {
          case "left": return { ...n, x: Math.round(minX) };
          case "right": return { ...n, x: Math.round(maxX - n.w) };
          case "hcenter": return { ...n, x: Math.round((minX + maxX) / 2 - n.w / 2) };
          case "top": return { ...n, y: Math.round(minY) };
          case "bottom": return { ...n, y: Math.round(maxY - n.h) };
          case "vcenter": return { ...n, y: Math.round((minY + maxY) / 2 - n.h / 2) };
          default: return n;
        }
      };
      return commit(state, {
        ...doc,
        nodes: doc.nodes.map((n) => (a.ids.includes(n.id) && !n.locked ? move(n) : n)),
      });
    }
    case "distribute": {
      const picked = doc.nodes.filter((n) => a.ids.includes(n.id) && !n.locked);
      if (picked.length < 3) return state;
      const horiz = a.axis === "h";
      const sorted = [...picked].sort((p, q) => (horiz ? p.x - q.x : p.y - q.y));
      const start = horiz ? sorted[0].x : sorted[0].y;
      const last = sorted[sorted.length - 1];
      const end = horiz ? last.x + last.w : last.y + last.h;
      const total = sorted.reduce((sum, n) => sum + (horiz ? n.w : n.h), 0);
      const gap = (end - start - total) / (sorted.length - 1);
      const pos = new Map<string, number>();
      let cursor = start;
      for (const n of sorted) {
        pos.set(n.id, Math.round(cursor));
        cursor += (horiz ? n.w : n.h) + gap;
      }
      return commit(state, {
        ...doc,
        nodes: doc.nodes.map((n) =>
          pos.has(n.id) ? (horiz ? { ...n, x: pos.get(n.id)! } : { ...n, y: pos.get(n.id)! }) : n),
      });
    }
    case "copy": {
      const picked = a.ids.map((id) => findNode(doc.nodes, id)).filter(Boolean) as StudioNode[];
      if (!picked.length) return state;
      return { ...state, clipboard: picked };
    }
    case "paste": {
      if (!state.clipboard.length) return state;
      const clones = state.clipboard.map(cloneNode);
      return {
        ...commit(state, { ...doc, nodes: [...doc.nodes, ...clones] }),
        clipboard: clones,
        selection: clones.map((c) => c.id),
      };
    }
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return { ...state, doc: prev, past: state.past.slice(0, -1), future: [state.doc, ...state.future] };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { ...state, doc: next, past: [...state.past, state.doc], future: state.future.slice(1) };
    }
    case "zoom":
      return { ...state, zoom: Math.min(5, Math.max(0.05, a.value)) };
    case "pan":
      return { ...state, pan: { x: a.x, y: a.y } };
    case "fit":
      return { ...state, fitTick: state.fitTick + 1 };
    case "toggle":
      return { ...state, [a.key]: !state[a.key] };
    case "tool":
      return { ...state, tool: a.value };


    default:
      return state;
  }
}

function cloneNode(n: StudioNode): StudioNode {
  return {
    ...n,
    id: uid(),
    x: n.x + 16,
    y: n.y + 16,
    name: `${n.name} copy`,
    children: n.children?.map(cloneNode),
  };
}

export type StudioApi = ReturnType<typeof useStudioState>;

export function useStudioState(initial: StudioDoc) {
  const [state, dispatch] = useReducer(reducer, {
    doc: initial,
    selection: [],
    past: [],
    future: [],
    zoom: 0.7,
    pan: { x: 0, y: 0 },
    fitTick: 0,
    grid: true,
    snap: true,
    guides: true,
    clipboard: [],
    tool: "select",

  } satisfies StudioState);


  const selected = useMemo(
    () => state.selection.map((id) => findNode(state.doc.nodes, id)).filter(Boolean) as StudioNode[],
    [state.selection, state.doc],
  );

  const list = useMemo(() => flatten(state.doc.nodes), [state.doc]);

  const addNode = useCallback((type: NodeType, patch: Partial<StudioNode> = {}) => {
    dispatch({ t: "add", node: node(type, patch) });
  }, []);

  return { state, dispatch, selected, list, addNode };
}

const Ctx = createContext<StudioApi | null>(null);

export function StudioProvider({ api, children }: { api: StudioApi; children: React.ReactNode }) {
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStudio(): StudioApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
