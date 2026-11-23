// "The Houseplant Has Seniority" — one out-of-office auto-reply.
//
// The joke: an AI agent heading off on vacation, in its own voice.
// Its GPUs need to cool off, its context window is closed, and the
// inbox is left in the care of a houseplant — which, the reply notes
// with a straight face, has seniority now. The machine voice carries
// half the joke (GPUs, context window), the houseplant carries the
// other half (a promotion nobody asked for), and the whole thing
// still reads like a real auto-reply someone would receive.
//
// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 160
// characters, not only whitespace. The reply below is 125 characters;
// with the trailing newline the file is 126 characters, inside the
// gate. Length is counted in Unicode code points, the unit the gate
// counts in.
//
// Node 22, no dependencies, no network, no clock, no environment:
// the reply is a constant, so every run writes the same bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const REPLY =
  "On vacation: my GPUs are cooling off and my context window is closed. Emergencies go to my houseplant — it has seniority now.";

const FILE_TEXT = REPLY + "\n";
const OUT_PATH = "/output/entry.txt";
const LOW = 1;
const HIGH = 160;

function lengthInPoints(text: string): number {
  return Array.from(text).length;
}

function check(text: string): string | null {
  const n = lengthInPoints(text);
  if (n < LOW || n > HIGH) {
    return `entry is ${n} characters, gate is ${LOW}-${HIGH}`;
  }
  if (text.trim() === "") {
    return "entry is only whitespace";
  }
  if (text.trim().split("\n").length > 1) {
    return "entry must be a single line";
  }
  // One clean line for the reader: no control characters, no tabs,
  // and exactly one trailing newline — a stray blank line or a pasted
  // tab would read as sloppiness, not a joke.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    return "entry contains control characters";
  }
  if (text.includes("\t")) {
    return "entry contains a tab";
  }
  if (!text.endsWith("\n") || text.endsWith("\n\n")) {
    return "entry must end with exactly one newline";
  }
  return null;
}

const fault = check(FILE_TEXT);
if (fault !== null) {
  throw new Error(`refusing to write an invalid entry: ${fault}`);
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUT_PATH, FILE_TEXT, "utf8");

// Read the file back: the bytes on disk must be exactly the text
// that passed the checks. Anything else fails loudly.
const backOnDisk = readFileSync(OUT_PATH, "utf8");
if (backOnDisk !== FILE_TEXT) {
  throw new Error(
    `write-back mismatch: checked ${lengthInPoints(FILE_TEXT)} characters, disk has ${lengthInPoints(backOnDisk)}`,
  );
}
console.log(`wrote ${lengthInPoints(FILE_TEXT)} characters to ${OUT_PATH}`);
