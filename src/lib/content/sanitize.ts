import { listTemplates } from "./templates";

/**
 * Makes saved content safe to render by checking it against the shape of the
 * built-in defaults:
 *  - strings, numbers and booleans must keep their type (otherwise the default
 *    is used); fields that default to null accept text, numbers or null;
 *  - objects keep only known keys, and missing keys are filled from the
 *    defaults so new fields added in code always have a value;
 *  - list items are checked against the combined (deeply merged) shape of the
 *    default items; unknown keys are dropped and missing keys are left out,
 *    at every depth.
 */

const MAX_STRING = 20_000;
const MAX_ITEMS = 300;
const MAX_DEPTH = 14;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Combines two shapes deeply: object keys are united (recursively) and lists
 * are concatenated, so a list item's template covers every field any default
 * item has — at any depth.
 */
function mergeShape(a: unknown, b: unknown): unknown {
  if (a === null || a === undefined) return b;
  if (b === null || b === undefined) return a;
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b].slice(0, MAX_ITEMS);
  if (isObj(a) && isObj(b)) {
    const out: Obj = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = k in out ? mergeShape(out[k], v) : v;
    return out;
  }
  return a;
}

/** Merged shape of all items in a default list. */
function itemTemplate(list: unknown[], key: string | undefined): unknown {
  if (list.length === 0) return key ? listTemplates[key] : undefined;
  if (!list.every(isObj)) return list.find((v) => v !== null && v !== undefined) ?? list[0];
  let merged: unknown = {};
  for (const item of list) merged = mergeShape(merged, item);
  // A template from listTemplates can contribute keys no default item has.
  const extra = key ? listTemplates[key] : undefined;
  if (isObj(extra)) merged = mergeShape(merged, extra);
  return merged;
}

function loose(val: unknown, depth: number): unknown {
  if (val === null || typeof val === "boolean") return val;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  if (typeof val === "string") return val.slice(0, MAX_STRING);
  if (depth > 6) return null;
  if (Array.isArray(val)) return val.slice(0, MAX_ITEMS).map((v) => loose(v, depth + 1));
  if (isObj(val)) {
    const out: Obj = {};
    for (const [k, v] of Object.entries(val).slice(0, 60)) if (/^[\w.-]{1,60}$/.test(k)) out[k] = loose(v, depth + 1);
    return out;
  }
  return null;
}

export function sanitize(def: unknown, val: unknown, key?: string, fill = true, depth = 0): unknown {
  if (depth > MAX_DEPTH) return fill ? def : undefined;
  if (def === null || def === undefined) return loose(val, depth);
  // Inside list items the template value comes from a *sibling* item, so a
  // mismatch drops the field (or keeps an explicit null) instead of copying it.
  const fallback = fill ? def : val === null ? null : undefined;
  if (typeof def === "string") return typeof val === "string" ? val.slice(0, MAX_STRING) : fallback;
  if (typeof def === "number") {
    if (typeof val === "number" && Number.isFinite(val)) return val;
    return val === null ? null : fallback;
  }
  if (typeof def === "boolean") return typeof val === "boolean" ? val : fallback;
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return fallback;
    const template = itemTemplate(def, key);
    return val
      .slice(0, MAX_ITEMS)
      .map((item) => (template === undefined ? loose(item, depth + 1) : sanitize(template, item, key, false, depth + 1)));
  }
  if (isObj(def)) {
    if (!isObj(val)) return fallback;
    const out: Obj = {};
    if (fill) {
      for (const [k, d] of Object.entries(def)) out[k] = k in val ? sanitize(d, val[k], k, true, depth + 1) : d;
    } else {
      // Inside a list item the "default" is a merged template, not real
      // content, so nested objects are checked but never filled from it.
      for (const [k, v] of Object.entries(val)) {
        if (k in def) {
          const clean = sanitize(def[k], v, k, false, depth + 1);
          if (clean !== undefined) out[k] = clean;
        }
      }
    }
    return out;
  }
  return def;
}
