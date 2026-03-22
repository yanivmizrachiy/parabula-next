import fs from "fs";
import path from "path";

const statePath = path.join(process.cwd(), "storage", "system-state.json");

export function readSystemState() {
  const raw = fs.readFileSync(statePath, "utf8");
  return JSON.parse(raw);
}

export function writeSystemState(nextState: unknown) {
  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2), "utf8");
}
