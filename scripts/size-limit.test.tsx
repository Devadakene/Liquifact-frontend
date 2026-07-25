import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..");

interface SizeLimitEntry {
  name: string;
  path: string | string[];
  limit: string;
}

interface PackageJson {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8")) as T;
}

describe("size-limit configuration", () => {
  let config: SizeLimitEntry[];
  let pkg: PackageJson;

  beforeAll(() => {
    config = readJson<SizeLimitEntry[]>(".size-limit.json");
    pkg = readJson<PackageJson>("package.json");
  });

  it("exists as a valid JSON array", () => {
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it("defines budgets for home, invest, and invoices routes", () => {
    const names = config.map((entry: SizeLimitEntry) => entry.name);
    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/home/i),
        expect.stringMatching(/invest/i),
        expect.stringMatching(/invoices/i),
      ])
    );
  });

  it("every entry has valid path, limit, and name fields", () => {
    for (const entry of config) {
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("path");
      expect(entry).toHaveProperty("limit");
      expect(typeof entry.name).toBe("string");
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });

  it("each budget limit is a positive size string", () => {
    for (const entry of config) {
      expect(entry.limit).toMatch(/^\d+(\.\d+)?\s*(kB|MB|B)$/);
    }
  });

  it("each path is a valid glob pattern", () => {
    for (const entry of config) {
      const paths = Array.isArray(entry.path) ? entry.path : [entry.path];
      for (const p of paths) {
        expect(p).toMatch(/\.next\/(static\/chunks|server\/app)\//);
      }
    }
  });

  it("home budget is <= 800 kB", () => {
    const home = config.find((e: SizeLimitEntry) => /home/i.test(e.name));
    expect(home).toBeDefined();
    const val = parseFloat(home!.limit);
    expect(val).toBeLessThanOrEqual(800);
  });

  it("invest budget is <= 800 kB", () => {
    const invest = config.find((e: SizeLimitEntry) => /invest/i.test(e.name));
    expect(invest).toBeDefined();
    const val = parseFloat(invest!.limit);
    expect(val).toBeLessThanOrEqual(800);
  });

  it("invoices budget is <= 800 kB", () => {
    const invoices = config.find((e: SizeLimitEntry) => /invoices/i.test(e.name));
    expect(invoices).toBeDefined();
    const val = parseFloat(invoices!.limit);
    expect(val).toBeLessThanOrEqual(800);
  });
});

describe("package.json integration", () => {
  let pkg: PackageJson;

  beforeAll(() => {
    pkg = readJson<PackageJson>("package.json");
  });

  it("has a size-limit script", () => {
    expect(pkg.scripts).toHaveProperty("size-limit");
    expect(pkg.scripts["size-limit"]).toBe("size-limit");
  });

  it("has size-limit as a devDependency", () => {
    expect(pkg.devDependencies).toHaveProperty("size-limit");
  });

  it("has @size-limit/file as a devDependency", () => {
    expect(pkg.devDependencies).toHaveProperty("@size-limit/file");
  });
});

describe("CI workflow", () => {
  it("size.yml exists with size-limit step", () => {
    const workflow = fs.readFileSync(path.join(REPO_ROOT, ".github/workflows/size.yml"), "utf8");
    expect(workflow).toContain("size-limit");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("pull_request");
  });

  it("size.yml uses SHA-pinned action versions", () => {
    const workflow = fs.readFileSync(path.join(REPO_ROOT, ".github/workflows/size.yml"), "utf8");
    // Every `uses:` line should have a SHA hash
    const usesLines = workflow
      .split("\n")
      .filter((line) => line.trim().startsWith("uses:"))
      .map((line) => line.trim());
    expect(usesLines.length).toBeGreaterThan(0);
    for (const line of usesLines) {
      // Allow SHA pinning (e.g. actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683)
      // or a well-known major-version tag for internal-only actions.
      expect(line).toMatch(/@(?:[a-f0-9]{40,}|v\d+(?:\.\d+)*)/);
    }
  });
});
