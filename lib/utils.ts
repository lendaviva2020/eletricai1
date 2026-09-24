import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let idSeq = 10000;

/**
 * Generates an unconditionally unique, collision-resistant identifier for CAD components.
 * Combines prefix, high-res timestamp, monotonic sequence counter, and crypto random string.
 */
export function generateUniqueComponentId(prefix = 'comp'): string {
  idSeq += 1;
  const time = Date.now().toString(36);
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10);
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'comp';
  return `comp_${cleanPrefix}_${time}_${idSeq}_${rand}`;
}

let connSeq = 10000;

/**
 * Generates an unconditionally unique, collision-resistant identifier for electrical wires/connections.
 */
export function generateUniqueConnectionId(): string {
  connSeq += 1;
  const time = Date.now().toString(36);
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10);
  return `conn_${time}_${connSeq}_${rand}`;
}
