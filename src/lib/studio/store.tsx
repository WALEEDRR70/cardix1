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
  grid: boolean;
  snap: boolean;
  guides: boolean;
};

type Action =
  | { t: "replace"; doc: StudioDoc; history?: boolean }
  | { t: "add"; node: StudioNode }
  | { t: "update"; ids: string[]; patch: Partial<StudioNode>; transient?: boolean }
  | { t: "style"; ids: string[]; patch: Partial<StudioNode["style"]>; transient?: boolean }
  | { t: "remove"; ids: string[] }
  | { t: "duplicate"; ids: string[] }
  | { t: "order"; id: string; dir: "front" | "back" | "forward" | "backward" }
  | { t: "group"; ids: string[] }
  | { t: "ungroup"; id: string }
  | { t: "select"; ids: string[] }
  | { t: "bg"; patch: Partial<StudioDoc["background"]> }
  | { t: "undo" }
  | { t: "redo" }
  | { t: "zoom"; value: number }
  | { t: "toggle"; key: "grid" | "snap" | "guides" };

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
    case "select":
      return { ...state, selection: a.ids };
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
      return { ...state, zoom: Math.min(2, Math.max(0.25, a.value)) };
    case "toggle":
      return { ...state, [a.key]: !state[a.key] };
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
    grid: true,
    snap: true,
    guides: true,
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
