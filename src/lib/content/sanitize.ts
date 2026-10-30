import { listTemplates } from "./templates";

/**
 * Makes saved content safe to render by checking it against the shape of the
 * built-in defaults:
 *  - strings, numbers and booleans must keep their type (otherwise the default
 *    is used); fields that default to null accept text, numbers or null;
 *  - objects keep only known keys, and missing keys are filled from the
 *    defaults so new fields added in code always have a value;
 *  - list items are checked against the combined shape of the default items;
 *    unknown keys are dropped and missing keys are left out.
 */

const MAX_STRING = 20_000;
const MAX_ITEMS = 300;
const MAX_DEPTH = 14;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Merged shape of all items in a default list. */
function itemTemplate(list: unknown[], key: string | undefined): unknown {
  if (list.length === 0) return key ? listTemplates[key] : undefined;
  if (!list.every(isObj)) return list.find((v) => v !== null && v !== undefined) ?? list[0];
  const merged: Obj = {};
  for (const item of list as Obj[]) {
    for (const [k, v] of Object.entries(item)) {
      if (!(k in merged) || merged[k] === null || merged[k] === undefined) merged[k] = v;
      else if (Array.isArray(merged[k]) && Array.isArray(v) && (merged[k] as unknown[]).length === 0) merged[k] = v;
    }
  }
  // A template from listTemplates can contribute keys no default item has.
  const extra = key ? listTemplates[key] : undefined;
  if (isObj(extra)) for (const [k, v] of Object.entries(extra)) if (!(k in merged)) merged[k] = v;
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
  if (depth > MAX_DEPTH) return def;
  if (def === null || def === undefined) return loose(val, depth);
  if (typeof def === "string") return typeof val === "string" ? val.slice(0, MAX_STRING) : def;
  if (typeof def === "number") {
    if (typeof val === "number" && Number.isFinite(val)) return val;
    return val === null ? null : def;
  }
  if (typeof def === "boolean") return typeof val === "boolean" ? val : def;
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return def;
    const template = itemTemplate(def, key);
    return val
      .slice(0, MAX_ITEMS)
      .map((item) => (template === undefined ? loose(item, depth + 1) : sanitize(template, item, key, false, depth + 1)));
  }
  if (isObj(def)) {
    if (!isObj(val)) return fill ? def : undefined;
    const out: Obj = {};
    if (fill) {
      for (const [k, d] of Object.entries(def)) out[k] = k in val ? sanitize(d, val[k], k, true, depth + 1) : d;
    } else {
      for (const [k, v] of Object.entries(val)) {
        if (k in def) out[k] = sanitize(def[k], v, k, true, depth + 1);
      }
    }
    return out;
  }
  return def;
}
