#!/usr/bin/env node
/**
 * Gera src/content/releases.generated.json a partir do histórico do git.
 *
 * Agrupa commits em "versões" delimitadas por commits significativos
 * (mensagem diferente de "Changes"), e para cada versão lista:
 *  - título (primeiro commit significativo)
 *  - data (data do commit mais recente do grupo)
 *  - mensagens de todos os commits do grupo
 *  - arquivos alterados desde a versão anterior (name-status)
 *  - hash curto do commit-topo
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "content", "releases.generated.json");

const SEP = "@@COMMIT@@";
const FSEP = "@@F@@";

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function loadCommits(limit = 200) {
  const fmt = ["%H", "%h", "%ct", "%s"].join(FSEP);
  const raw = git(`log -n ${limit} --pretty=format:"${fmt}${SEP}"`);
  return raw
    .split(SEP)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, short, ts, ...rest] = line.split(FSEP);
      return {
        hash,
        short,
        date: new Date(Number(ts) * 1000).toISOString().slice(0, 10),
        ts: Number(ts),
        subject: rest.join(FSEP).trim(),
      };
    });
}

function isPlaceholder(subject) {
  return /^(changes|update|wip)\.?$/i.test(subject.trim());
}

function filesBetween(from, to) {
  // from is older, to is newer. from can be undefined (initial).
  const range = from ? `${from}..${to}` : to;
  const raw = git(`diff --name-status ${range}`).trim();
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => {
      const [status, ...pathParts] = l.split(/\s+/);
      return { status, path: pathParts.join(" ") };
    })
    .filter((f) => f.path);
}

function main() {
  const commits = loadCommits(200); // newest first
  // Group: iterate newest -> oldest; each group starts with a significant
  // commit and swallows the "Changes" commits that follow (older) until the
  // next significant one.
  const groups = [];
  let current = null;
  for (const c of commits) {
    if (!isPlaceholder(c.subject)) {
      if (current) groups.push(current);
      current = { top: c, commits: [c] };
    } else if (current) {
      current.commits.push(c);
    } else {
      // trailing "Changes" at the top with no significant parent yet
      current = { top: c, commits: [c] };
    }
  }
  if (current) groups.push(current);

  // For each group, compute files changed against the previous group's top.
  const releases = groups.map((g, i) => {
    const prev = groups[i + 1];
    const prevHash = prev ? prev.top.hash : null;
    let files = [];
    try {
      const oldestInGroup = g.commits[g.commits.length - 1].hash;
      const base = prevHash ?? `${oldestInGroup}^`;
      files = filesBetween(base, g.top.hash);
    } catch {
      files = [];
    }
    return {
      commit: g.top.short,
      date: g.top.date,
      title: g.top.subject,
      messages: g.commits.map((c) => c.subject),
      files,
    };
  });

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), releases }, null, 2));
  console.log(`Wrote ${releases.length} releases to ${OUT}`);
}

main();