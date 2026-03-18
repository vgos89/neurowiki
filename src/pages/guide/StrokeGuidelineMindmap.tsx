import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  mindmapRoot,
  flattenNodes,
  type MindmapNode,
  type GuidelineRec,
  type NodeColor,
} from '../../data/strokeGuidelineMindmapData';

// ─── COR helpers ──────────────────────────────────────────────────────────────

function corClass(cor: string): string {
  if (cor === '1') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (cor === '2a') return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (cor === '2b') return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (cor.startsWith('3')) return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

function corLabel(cor: string): string {
  if (cor === '1') return 'COR 1';
  if (cor === '2a') return 'COR 2a';
  if (cor === '2b') return 'COR 2b';
  if (cor === '3: No Benefit') return 'COR 3 — No Benefit';
  if (cor === '3: Harm') return 'COR 3 — Harm';
  return `COR ${cor}`;
}

// ─── Node color mapping ───────────────────────────────────────────────────────

const nodeColorMap: Record<NodeColor, { bg: string; border: string; text: string; dot: string }> = {
  neuro: {
    bg: 'bg-neuro-500',
    border: 'border-neuro-600',
    text: 'text-white',
    dot: 'bg-neuro-500',
  },
  emerald: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    dot: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    text: 'text-white',
    dot: 'bg-amber-500',
  },
  violet: {
    bg: 'bg-violet-500',
    border: 'border-violet-600',
    text: 'text-white',
    dot: 'bg-violet-500',
  },
  rose: {
    bg: 'bg-rose-500',
    border: 'border-rose-600',
    text: 'text-white',
    dot: 'bg-rose-500',
  },
  slate: {
    bg: 'bg-slate-600',
    border: 'border-slate-700',
    text: 'text-white',
    dot: 'bg-slate-600',
  },
};

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_W = 148;
const NODE_H = 52;
const H_GAP = 64;  // horizontal gap between levels
const V_GAP = 14;  // vertical gap between siblings

type LayoutNode = {
  node: MindmapNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
};

// Compute subtree height (in units) counting visible nodes only
function subtreeHeight(node: MindmapNode, expanded: Set<string>): number {
  const hasVisibleChildren = node.children && node.children.length > 0 && expanded.has(node.id);
  if (!hasVisibleChildren) return 1;
  return node.children!.reduce((sum, child) => sum + subtreeHeight(child, expanded), 0);
}

// Build positioned layout tree
function buildLayout(
  node: MindmapNode,
  depth: number,
  yOffset: number,
  expanded: Set<string>,
): LayoutNode {
  const x = depth * (NODE_W + H_GAP);
  const hasVisibleChildren = node.children && node.children.length > 0 && expanded.has(node.id);

  if (!hasVisibleChildren) {
    return {
      node,
      x,
      y: yOffset,
      width: NODE_W,
      height: NODE_H,
      children: [],
    };
  }

  const childLayouts: LayoutNode[] = [];
  let curY = yOffset;
  for (const child of node.children!) {
    const h = subtreeHeight(child, expanded);
    const layout = buildLayout(child, depth + 1, curY, expanded);
    childLayouts.push(layout);
    curY += h * (NODE_H + V_GAP);
  }

  // Center the parent vertically among its children
  const firstChild = childLayouts[0];
  const lastChild = childLayouts[childLayouts.length - 1];
  const parentY = (firstChild.y + lastChild.y) / 2;

  return {
    node,
    x,
    y: parentY,
    width: NODE_W,
    height: NODE_H,
    children: childLayouts,
  };
}

// Flatten layout tree to a list for rendering
function flattenLayout(layout: LayoutNode, result: LayoutNode[] = []): LayoutNode[] {
  result.push(layout);
  layout.children.forEach((c) => flattenLayout(c, result));
  return result;
}

// ─── SVG Bezier edge ─────────────────────────────────────────────────────────

function BezierEdge({
  parent,
  child,
}: {
  parent: LayoutNode;
  child: LayoutNode;
}) {
  const x1 = parent.x + NODE_W;
  const y1 = parent.y + NODE_H / 2;
  const x2 = child.x;
  const y2 = child.y + NODE_H / 2;
  const cx = (x1 + x2) / 2;
  return (
    <path
      d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
      stroke="#cbd5e1"
      strokeWidth="1.5"
      fill="none"
    />
  );
}

// ─── SVG Node ────────────────────────────────────────────────────────────────

function SVGNode({
  layout,
  selected,
  highlighted,
  onSelect,
  onToggle,
  expanded,
}: {
  layout: LayoutNode;
  selected: boolean;
  highlighted: boolean;
  onSelect: (node: MindmapNode) => void;
  onToggle: (id: string) => void;
  expanded: boolean;
}) {
  const { node, x, y } = layout;
  const colors = nodeColorMap[node.color];
  const hasChildren = !!node.children?.length;
  const lines = node.label.split('\n');

  return (
    <g>
      {/* Node rect via foreignObject */}
      <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
        <div
          className={[
            'w-full h-full rounded-lg flex flex-col items-center justify-center cursor-pointer select-none',
            'transition-all duration-150',
            colors.bg,
            selected ? 'ring-2 ring-offset-1 ring-white shadow-lg scale-105' : 'shadow-sm hover:shadow-md hover:brightness-110',
            highlighted ? 'ring-2 ring-offset-1 ring-yellow-400' : '',
          ].join(' ')}
          onClick={() => onSelect(node)}
          title={node.description}
        >
          <span className={`${colors.text} text-center leading-tight font-semibold`} style={{ fontSize: '10px', padding: '4px 6px' }}>
            {lines.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </span>
        </div>
      </foreignObject>

      {/* Expand/collapse button */}
      {hasChildren && (
        <foreignObject x={x + NODE_W - 14} y={y + NODE_H / 2 - 10} width={20} height={20}>
          <button
            className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        </foreignObject>
      )}
    </g>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function CORBadge({ cor }: { cor: string }) {
  if (cor === '★') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap bg-neuro-100 text-neuro-700 border border-neuro-200">
        Key Message
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${corClass(cor)}`}>
      {corLabel(cor)}
    </span>
  );
}

function LOEBadge({ loe }: { loe: string }) {
  // Key 2026 Updates use numbers as message indices — don't show as "LOE N"
  if (/^\d+$/.test(loe)) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
      LOE {loe}
    </span>
  );
}

function DetailPanel({
  node,
  onClose,
  onSelect,
  corFilter,
}: {
  node: MindmapNode | null;
  onClose: () => void;
  onSelect: (node: MindmapNode) => void;
  corFilter: string | null;
}) {
  if (!node) return null;

  const recs: GuidelineRec[] = (node.recommendations ?? []).filter(
    (r) => !corFilter || r.cor === corFilter || r.cor.startsWith(corFilter + ':'),
  );

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="min-w-0 pr-2">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Guideline Section</p>
          <h2 className="text-sm font-bold text-slate-900 leading-snug">
            {node.label.replace(/\n/g, ' ')}
          </h2>
          {node.description && (
            <p className="mt-1 text-xs text-slate-500 leading-snug">{node.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* No recommendations? Show children as clickable sub-topics */}
      {recs.length === 0 && !node.recommendations?.length && node.children?.length ? (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-slate-500 mb-3">This section contains sub-topics. Click a sub-topic to view its recommendations.</p>
          <div className="space-y-2">
            {node.children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelect(child)}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-neuro-50 hover:border-neuro-200 transition-colors text-left group"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${nodeColorMap[child.color].dot}`} />
                <span className="flex-1 text-xs font-medium text-slate-700 group-hover:text-neuro-700">{child.label.replace(/\n/g, ' ')}</span>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-neuro-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : recs.length === 0 && corFilter ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No {corFilter} recommendations in this section.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {recs.map((rec, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <CORBadge cor={rec.cor} />
                  <LOEBadge loe={rec.loe} />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer citation */}
      <div className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
        <p className="text-[10px] text-slate-400">
          Source: 2026 AHA/ASA Guideline for Early Management of AIS · DOI: 10.1161/STR.0000000000000513
        </p>
      </div>
    </div>
  );
}

// ─── Mobile Accordion ─────────────────────────────────────────────────────────

function MobileAccordionNode({
  node,
  depth,
  expanded,
  selected,
  highlighted,
  onToggle,
  onSelect,
}: {
  node: MindmapNode;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  highlighted: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: MindmapNode) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const isHighlighted = highlighted.has(node.id);
  const colors = nodeColorMap[node.color];
  const hasRecs = !!node.recommendations?.length;

  return (
    <div className={depth > 0 ? 'border-l-2 border-slate-200 ml-4' : ''}>
      <button
        className={[
          'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
          isHighlighted ? 'bg-yellow-100 border-l-2 border-l-yellow-400' : isSelected ? 'bg-neuro-50' : 'hover:bg-slate-50',
        ].join(' ')}
        style={{ minHeight: 44 }}
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          if (hasRecs) onSelect(node);
        }}
      >
        {/* Color dot */}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />

        {/* Label */}
        <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-neuro-700' : 'text-slate-800'}`}>
          {node.label.replace(/\n/g, ' ')}
        </span>

        {/* Rec count badge */}
        {hasRecs && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
            {node.recommendations!.length}
          </span>
        )}

        {/* Expand icon */}
        {hasChildren && (
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <MobileAccordionNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              highlighted={highlighted}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

function BottomSheet({
  node,
  onClose,
  onSelect,
  corFilter,
}: {
  node: MindmapNode | null;
  onClose: () => void;
  onSelect: (node: MindmapNode) => void;
  corFilter: string | null;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (node) {
      setTranslateY(0);
    }
  }, [node]);

  if (!node) return null;

  const recs: GuidelineRec[] = (node.recommendations ?? []).filter(
    (r) => !corFilter || r.cor === corFilter || r.cor.startsWith(corFilter + ':'),
  );

  return (
    <>
      {/* Backdrop — above nav bar (z-50) */}
      <div
        className="fixed inset-0 bg-black/30 z-[80]"
        onClick={onClose}
      />
      {/* Sheet — above backdrop and nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{
          maxHeight: '80vh',
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          setDragStart(e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          const delta = e.touches[0].clientY - dragStart;
          if (delta > 0) setTranslateY(delta);
        }}
        onTouchEnd={() => {
          setIsDragging(false);
          if (translateY > 100) {
            onClose();
          } else {
            setTranslateY(0);
          }
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Guideline Section</p>
              <h2 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                {node.label.replace(/\n/g, ' ')}
              </h2>
              {node.description && (
                <p className="text-xs text-slate-500 mt-1 leading-snug">{node.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-2"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content — pb-20 ensures last item stays above mobile nav bar */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
          {recs.length === 0 && corFilter && !node.children?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No {corFilter === '1' ? 'COR 1' : corFilter === '2a' ? 'COR 2a' : corFilter === '2b' ? 'COR 2b' : 'COR 3'} recommendations</p>
              <p className="text-xs text-slate-400 mt-1">in this section</p>
            </div>
          ) : recs.length === 0 && node.children?.length ? (
            <div>
              <p className="text-xs text-slate-500 mb-3">Sub-topics in this section:</p>
              <div className="space-y-2">
                {node.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => { onSelect(child); }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-neuro-50 hover:border-neuro-200 transition-colors text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${nodeColorMap[child.color].dot}`} />
                    <span className="flex-1 text-xs font-medium text-slate-700 group-hover:text-neuro-700">{child.label.replace(/\n/g, ' ')}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-neuro-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : recs.map((rec, i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <CORBadge cor={rec.cor} />
                <LOEBadge loe={rec.loe} />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
          <p className="text-[10px] text-slate-400">
            2026 AHA/ASA Guideline · DOI: 10.1161/STR.0000000000000513
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const COR_FILTERS = [
  { label: 'COR 1', value: '1', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'COR 2a', value: '2a', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'COR 2b', value: '2b', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'COR 3', value: '3', cls: 'bg-red-100 text-red-700 border-red-200' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_EXPANDED = new Set(['root', 'systems', 'evaluation', 'management', 'special', 'quality']);

export default function StrokeGuidelineMindmap() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(INITIAL_EXPANDED));
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [corFilter, setCorFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [transform, setTransform] = useState({ x: 24, y: 40, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Build layout
  const layout = useMemo(() => buildLayout(mindmapRoot, 0, 0, expandedIds), [expandedIds]);
  const allLayouts = useMemo(() => flattenLayout(layout), [layout]);
  const allNodes = useMemo(() => flattenNodes(mindmapRoot), []);

  // Highlighted nodes from search
  const highlightedIds = useMemo<Set<string>>(() => {
    if (!search.trim()) return new Set();
    const q = search.toLowerCase();
    return new Set(
      allNodes
        .filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            n.description?.toLowerCase().includes(q) ||
            n.recommendations?.some((r) => r.text.toLowerCase().includes(q)),
        )
        .map((n) => n.id),
    );
  }, [search, allNodes]);

  // SVG bounding box
  const svgBounds = useMemo(() => {
    if (allLayouts.length === 0) return { width: 800, height: 600 };
    const maxX = Math.max(...allLayouts.map((l) => l.x + l.width));
    const maxY = Math.max(...allLayouts.map((l) => l.y + l.height));
    return { width: maxX + 32, height: maxY + 64 };
  }, [allLayouts]);

  // Handlers
  const toggleNode = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectNode = useCallback((node: MindmapNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  // Mouse pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((t) => ({ ...t, x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y }));
  }, [isDragging, dragOrigin]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setTransform((t) => ({
      ...t,
      scale: Math.min(1.8, Math.max(0.35, t.scale + delta)),
    }));
  }, []);

  // Touch pan
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchRef.current) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);
  const onTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  const resetView = () => setTransform({ x: 24, y: 40, scale: 1 });

  // Collect all edges for the visible tree
  const edges: Array<{ parent: LayoutNode; child: LayoutNode }> = [];
  allLayouts.forEach((pl) => {
    pl.children.forEach((cl) => {
      edges.push({ parent: pl, child: cl });
    });
  });

  const mobileHighlightedSet = useMemo<Set<string>>(() => highlightedIds, [highlightedIds]);

  return (
    <div className="flex flex-col bg-slate-50" style={{ minHeight: '100vh' }}>
      {/* ── Page Header — sticky so search/filter stay on screen while scrolling ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0 sticky top-0 z-40 -mx-4 md:-mx-8">
        <div className="max-w-screen-xl mx-auto">
          <Link
            to="/guide"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-neuro-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Resident Guide
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                2026 AHA/ASA Stroke Guideline
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive mindmap · Acute Ischemic Stroke · Prabhakaran et al.
              </p>
            </div>
            <a
              href="https://doi.org/10.1161/STR.0000000000000513"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 text-xs text-neuro-600 hover:text-neuro-700 font-medium p-2.5 -mr-2.5 rounded-lg hover:bg-neuro-50 transition-colors"
              aria-label="View source guideline"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </div>

          {/* Controls row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guidelines…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-neuro-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* COR filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Filter:</span>
              {COR_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setCorFilter((prev) => (prev === f.value ? null : f.value))}
                  className={[
                    'px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all min-h-[32px]',
                    f.cls,
                    corFilter === f.value ? 'ring-2 ring-offset-1 ring-slate-400' : 'opacity-70 hover:opacity-100',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
              {corFilter && (
                <button
                  onClick={() => setCorFilter(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Zoom controls (desktop only) */}
            {!isMobile && (
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setTransform((t) => ({ ...t, scale: Math.min(1.8, t.scale + 0.1) }))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.35, t.scale - 0.1) }))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={resetView}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  title="Reset view"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <span className="text-[10px] text-slate-400 w-8 text-center">
                  {Math.round(transform.scale * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {isMobile ? (
        // ── MOBILE: Accordion tree ──
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white mx-4 my-3 rounded-xl border border-slate-200 overflow-hidden">
            {mindmapRoot.children?.map((child) => (
              <MobileAccordionNode
                key={child.id}
                node={child}
                depth={0}
                expanded={expandedIds}
                selected={selectedNode?.id ?? null}
                highlighted={mobileHighlightedSet}
                onToggle={toggleNode}
                onSelect={selectNode}
              />
            ))}
          </div>
          {/* Hint */}
          <p className="text-center text-[10px] text-slate-400 pb-4">
            Tap any item to view its recommendations
          </p>
        </div>
      ) : (
        // ── DESKTOP/TABLET: SVG canvas ──
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div
            ref={svgContainerRef}
            className={[
              'flex-1 overflow-hidden relative select-none bg-slate-50',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            ].join(' ')}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Dot pattern background */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            {/* Mindmap SVG */}
            <svg
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease',
                width: svgBounds.width,
                height: svgBounds.height,
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'visible',
              }}
            >
              {/* Edges */}
              {edges.map((e, i) => (
                <BezierEdge key={i} parent={e.parent} child={e.child} />
              ))}

              {/* Nodes */}
              {allLayouts.map((l) => (
                <SVGNode
                  key={l.node.id}
                  layout={l}
                  selected={selectedNode?.id === l.node.id}
                  highlighted={highlightedIds.has(l.node.id)}
                  onSelect={selectNode}
                  onToggle={toggleNode}
                  expanded={expandedIds.has(l.node.id)}
                />
              ))}
            </svg>

            {/* Hint overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 pointer-events-none">
              <span className="text-[10px] text-slate-400 bg-white/80 px-2 py-1 rounded-lg border border-slate-100">
                Scroll to zoom · Drag to pan · Click node to view recs
              </span>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedNode && (
            <div className="w-80 shrink-0 flex flex-col overflow-hidden border-l border-slate-200">
              <DetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onSelect={selectNode}
                corFilter={corFilter}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Mobile bottom sheet ── */}
      {isMobile && selectedNode && (
        <BottomSheet
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSelect={selectNode}
          corFilter={corFilter}
        />
      )}

      {/* ── Legend row ── */}
      <div className="bg-white border-t border-slate-100 px-4 py-2 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">COR Legend:</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> COR 1 — Recommended
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> COR 2a — Reasonable
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> COR 2b — May be considered
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> COR 3 — Not recommended / Harmful
          </span>
        </div>
      </div>
    </div>
  );
}
