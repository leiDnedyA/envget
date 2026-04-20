#!/usr/bin/env node

const fs = require("fs");

const [,, file, key] = process.argv;

if (!file || !key) {
  console.error("Usage: envget <file.env> <VAR_NAME>");
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

for (let line of lines) {
  line = line.trim();
  if (!line || line.startsWith("#")) continue;

  // remove inline comments (outside quotes)
  let cleaned = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "#" && !inSingle && !inDouble) break;
    cleaned += c;
  }

  const match = cleaned.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!match) continue;

  const [, k, v] = match;
  if (k !== key) continue;

  let value = v.trim();

  // strip surrounding quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  console.log(value);
  process.exit(0);
}

// not found
process.exit(1);
