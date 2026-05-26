import network from "./network.json" with { type: "json" };

export const GRAPH: Record<string, string[]> = {};

type LineName = "blue" | "green" | "orange" | "pink" | "purple" | "yellow";

type StationRange = {
  prefix: string;
  start: number;
  end: number;
  padCode?: boolean;
  cyclic?: boolean;
};

type NetworkLine = {
  name: LineName;
  prefixes?: string[];
  stations?: string[];
  ranges: StationRange[];
};

type NetworkData = {
  lines: NetworkLine[];
  edges: [string, string][];
  aliases: Record<string, string>;
};

const LINE_NAMES = new Set<LineName>([
  "blue",
  "green",
  "orange",
  "pink",
  "purple",
  "yellow",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLineName(value: unknown): value is LineName {
  return typeof value === "string" && LINE_NAMES.has(value as LineName);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStationRange(value: unknown): value is StationRange {
  if (!isRecord(value)) return false;

  return (
    typeof value.prefix === "string" &&
    typeof value.start === "number" &&
    typeof value.end === "number" &&
    (value.padCode === undefined || typeof value.padCode === "boolean") &&
    (value.cyclic === undefined || typeof value.cyclic === "boolean")
  );
}

function isNetworkLine(value: unknown): value is NetworkLine {
  if (!isRecord(value)) return false;

  return (
    isLineName(value.name) &&
    (value.prefixes === undefined || isStringArray(value.prefixes)) &&
    (value.stations === undefined || isStringArray(value.stations)) &&
    Array.isArray(value.ranges) &&
    value.ranges.every(isStationRange)
  );
}

function isEdge(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string"
  );
}

function isAliases(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function parseNetworkData(value: unknown): NetworkData {
  if (!isRecord(value)) {
    throw new Error("Invalid train fare network data");
  }

  const { aliases, edges, lines } = value;
  if (
    !Array.isArray(lines) ||
    !lines.every(isNetworkLine) ||
    !Array.isArray(edges) ||
    !edges.every(isEdge) ||
    !isAliases(aliases)
  ) {
    throw new Error("Invalid train fare network data");
  }

  return { aliases, edges, lines };
}

const networkData = parseNetworkData(network);
const stationLines: Record<string, LineName> = {};
const prefixLines: Record<string, LineName> = {};

function stationCode(prefix: string, index: number, padCode = true): string {
  const codeNumber = padCode ? String(index).padStart(2, "0") : String(index);
  return `${prefix}${codeNumber}`;
}

function ensureStation(code: string): void {
  GRAPH[code] ??= [];
}

function assignStationLine(code: string, line: LineName): void {
  stationLines[code] = line;
}

function assignPrefixLine(prefix: string, line: LineName): void {
  prefixLines[prefix] = line;
}

function connect(a: string, b: string): void {
  ensureStation(a);
  ensureStation(b);

  if (!GRAPH[a].includes(b)) GRAPH[a].push(b);
  if (!GRAPH[b].includes(a)) GRAPH[b].push(a);
}

function createStations({ prefix, start, end, padCode = true }: StationRange): void {
  for (let i = start; i <= end; i++) {
    ensureStation(stationCode(prefix, i, padCode));
  }
}

function connectStations({
  prefix,
  start,
  end,
  padCode = true,
  cyclic = false,
}: StationRange): void {
  for (let i = start; i < end; i++) {
    connect(
      stationCode(prefix, i, padCode),
      stationCode(prefix, i + 1, padCode)
    );
  }

  if (cyclic) {
    connect(
      stationCode(prefix, end, padCode),
      stationCode(prefix, start, padCode)
    );
  }
}

function createLine(range: StationRange): void {
  createStations(range);
  connectStations(range);
}

function registerLine(line: NetworkLine): void {
  for (const prefix of line.prefixes ?? []) {
    assignPrefixLine(prefix, line.name);
  }

  for (const station of line.stations ?? []) {
    ensureStation(station);
    assignStationLine(station, line.name);
  }

  for (const range of line.ranges) {
    assignPrefixLine(range.prefix, line.name);
    createLine(range);
    for (let i = range.start; i <= range.end; i++) {
      assignStationLine(stationCode(range.prefix, i, range.padCode), line.name);
    }
  }
}

for (const line of networkData.lines) {
  registerLine(line);
}

for (const [from, to] of networkData.edges) {
  connect(from, to);
}

function normalize(code: string): string {
  return networkData.aliases[code] ?? code;
}

function matchesLine(code: string, line: LineName): boolean {
  if (stationLines[code] === line) return true;

  return Object.entries(prefixLines).some(
    ([prefix, prefixLine]) => prefixLine === line && code.startsWith(prefix)
  );
}

function isBlue(code: string): boolean {
  return matchesLine(code, "blue");
}

function isPurple(code: string): boolean {
  return matchesLine(code, "purple");
}

function isPink(code: string): boolean {
  return matchesLine(code, "pink");
}

function isOrange(code: string): boolean {
  return matchesLine(code, "orange");
}

function isYellow(code: string): boolean {
  return matchesLine(code, "yellow");
}

function isGreen(code: string): boolean {
  return matchesLine(code, "green");
}

export function getLine(code: string): LineName {
  const line = stationLines[code];
  if (line) return line;

  const prefixLine = Object.entries(prefixLines).find(([prefix]) =>
    code.startsWith(prefix)
  )?.[1];
  if (prefixLine) return prefixLine;

  throw new Error("Unknown station code");
}

export function isExtendedGreen(code: string): boolean {
  if (code === "CEN" || code === "W1") return false;

  const stationNumber = Number.parseInt(code.slice(1), 10);
  if (Number.isNaN(stationNumber)) return false;

  if (code.startsWith("N") || code.startsWith("S")) return stationNumber >= 9;
  if (code.startsWith("E")) return stationNumber >= 10;
  return false;
}

export { isBlue, isPurple, isPink, isYellow, isOrange, isGreen, normalize };
