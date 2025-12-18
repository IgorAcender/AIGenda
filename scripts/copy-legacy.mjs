import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const WEB_PUBLIC = path.join(ROOT, 'apps', 'web', 'public');
const DEST_ROOT = path.join(WEB_PUBLIC, 'legacy');

const CANDIDATES = [
  'Cadastro',
  'Controle',
  'Compras',
  'Relatórios',
  'Financeiro',
  'Marketing',
  'Principal',
  'Configurações'
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function rimraf(p) {
  if (!(await exists(p))) return;
  const stat = await fs.lstat(p);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(p);
    await Promise.all(entries.map((e) => rimraf(path.join(p, e))));
    await fs.rmdir(p);
  } else {
    await fs.unlink(p);
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.lstat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const e of entries) {
      await copyRecursive(path.join(src, e), path.join(dest, e));
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }
}

async function main() {
  try {
    await fs.mkdir(DEST_ROOT, { recursive: true });

    for (const name of CANDIDATES) {
      const src = path.join(ROOT, name);
      if (!(await exists(src))) continue;
      const dest = path.join(DEST_ROOT, name);
      // remove existing dest
      await rimraf(dest);
      // copy
      await copyRecursive(src, dest);
      console.log(`Copied legacy folder: ${name} -> ${path.relative(ROOT, dest)}`);
    }

    console.log('Legacy copy finished.');
  } catch (err) {
    console.error('Error copying legacy files:', err);
    process.exitCode = 1;
  }
}

main();
