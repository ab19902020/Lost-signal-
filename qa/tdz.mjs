// A temporal-dead-zone hunter.
//
// Two shapes cause "Cannot access 'x' before initialization" in this codebase:
//   1. a plain reference to a let/const earlier in the same scope, and
//   2. a hoisted function declaration that reads a let/const, *called* from a
//      point in that scope above where the binding is initialised.
// The second is invisible to eye and to `node --check`, and is what a big
// factory function like createGameWorld makes easy to write.
import { parseAst } from 'rollup/parseAst';
import { readFileSync, readdirSync } from 'fs';

// Everything the game actually ships, plus the harnesses that drive it.
const listing = (dir, ext) => readdirSync(dir)
  .filter((name) => name.endsWith(ext))
  .map((name) => `${dir}/${name}`);
const files = process.argv.length > 2
  ? process.argv.slice(2)
  : [...listing('src', '.js'), ...listing('qa', '.mjs'), ...listing('tools', '.mjs')];

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
    const value = node[key];
    if (Array.isArray(value)) for (const child of value) walk(child, visit, node);
    else if (value && typeof value.type === 'string') walk(value, visit, node);
  }
}

function namesOf(pattern, out = []) {
  if (!pattern) return out;
  if (pattern.type === 'Identifier') out.push(pattern);
  else if (pattern.type === 'ObjectPattern') for (const p of pattern.properties) namesOf(p.value || p.argument, out);
  else if (pattern.type === 'ArrayPattern') for (const p of pattern.elements) namesOf(p, out);
  else if (pattern.type === 'AssignmentPattern') namesOf(pattern.left, out);
  else if (pattern.type === 'RestElement') namesOf(pattern.argument, out);
  return out;
}

/** Every statement list that forms a scope: the module body and each function body. */
function scopes(ast) {
  const found = [{ node: ast, body: ast.body, label: 'module' }];
  walk(ast, (node) => {
    if (!FUNCTIONS.has(node.type)) return;
    if (node.body?.type !== 'BlockStatement') return;
    found.push({ node, body: node.body.body, label: node.id?.name || '(anonymous)' });
  });
  return found;
}

/** Identifiers read inside a subtree, ignoring property keys and declarations. */
function readsIn(root) {
  const names = new Set();
  walk(root, (node, parent) => {
    if (node.type !== 'Identifier') return;
    if (parent?.type === 'MemberExpression' && parent.property === node && !parent.computed) return;
    if (parent?.type === 'Property' && parent.key === node && !parent.computed) return;
    if (parent && FUNCTIONS.has(parent.type) && parent.params?.includes(node)) return;
    if (parent?.type === 'VariableDeclarator' && parent.id === node) return;
    names.add(node.name);
  });
  return names;
}

let findings = 0;
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const ast = parseAst(source);
  const line = (pos) => source.slice(0, pos).split('\n').length;

  for (const scope of scopes(ast)) {
    // Bindings declared in this scope's statement list, with the position at
    // which they become usable.
    const bindings = new Map();
    for (const statement of scope.body) {
      const decl = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
      if (decl?.type !== 'VariableDeclaration' || decl.kind === 'var') continue;
      for (const d of decl.declarations) {
        // Usable only once its own declarator has finished evaluating.
        for (const id of namesOf(d.id)) bindings.set(id.name, { end: d.end, id });
      }
    }
    if (!bindings.size) continue;

    // Hoisted functions in this scope, and which of those bindings they read.
    const hoisted = new Map();
    for (const statement of scope.body) {
      if (statement.type !== 'FunctionDeclaration' || !statement.id) continue;
      const reads = readsIn(statement.body);
      const touched = [...bindings.keys()].filter((n) => reads.has(n));
      if (touched.length) hoisted.set(statement.id.name, touched);
    }

    // Only the scope's own statements run at scope-entry time; a reference
    // sitting inside a nested function runs whenever that function is called,
    // which is a different question and not one this can answer.
    const nestedFunctions = [];
    for (const statement of scope.body) {
      walk(statement, (n) => {
        if (FUNCTIONS.has(n.type) && n !== scope.node) nestedFunctions.push(n);
      });
    }
    // A nested block that declares the same name shadows the outer binding, so
    // a reference inside it is a different variable entirely.
    const shadows = [];
    for (const statement of scope.body) {
      walk(statement, (n) => {
        if (n.type !== 'BlockStatement' || n === scope.node?.body) return;
        const declared = new Set();
        for (const inner of n.body) {
          const d = inner.type === 'ExportNamedDeclaration' ? inner.declaration : inner;
          if (d?.type !== 'VariableDeclaration' || d.kind === 'var') continue;
          for (const decl of d.declarations) for (const id of namesOf(decl.id)) declared.add(id.name);
        }
        if (declared.size) shadows.push({ node: n, declared });
      });
    }
    const shadowed = (node, name) => shadows.some(
      (s) => s.declared.has(name) && s.node.start <= node.start && node.end <= s.node.end);

    const buried = (node) => nestedFunctions.some((f) => f.start <= node.start && node.end <= f.end);

    for (const statement of scope.body) {
      walk(statement, (node, parent) => {
        if (node.type !== 'Identifier') return;
        if (parent?.type === 'MemberExpression' && parent.property === node && !parent.computed) return;
        if (parent?.type === 'Property' && parent.key === node && !parent.computed) return;

        // The declared name itself is not a read of it.
        if (parent?.type === 'VariableDeclarator' && parent.id === node) return;
        if (parent && FUNCTIONS.has(parent.type) && parent.params?.includes(node)) return;

        // Shape 1: a direct read above the declaration, not nested in a function.
        const binding = bindings.get(node.name);
        const declEnd = binding?.end;
        if (binding && binding.id !== node && node.start < declEnd) {
          if (!buried(node) && !shadowed(node, node.name)) {
            console.log(`${file}:${line(node.start)}  reads '${node.name}' before its declaration on line ${line(declEnd)}`);
            findings++;
          }
        }

        // Shape 2: calling a hoisted function that reads a not-yet-initialised binding.
        if (parent?.type === 'CallExpression' && parent.callee === node
            && hoisted.has(node.name) && !buried(node)) {
          for (const name of hoisted.get(node.name)) {
            if (node.start < bindings.get(name).end) {
              console.log(`${file}:${line(node.start)}  calls ${node.name}(), which reads '${name}' — declared on line ${line(bindings.get(name).end)}`);
              findings++;
            }
          }
        }
      });
    }
  }
}
if (findings) {
  console.error(`\nTDZ QA failed: ${findings} reference(s) that run before their binding exists.`);
  process.exit(1);
}
console.log(`TDZ QA passed: ${files.length} modules, no reference runs before its binding exists.`);
