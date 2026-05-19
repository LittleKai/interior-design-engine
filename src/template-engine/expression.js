import { resolveToken } from "./color-tokens.js";

const DISALLOWED = /\b(eval|Function|new)\b|=>|;|`|\[|\]|(?<![=!<>])=(?!=)/;
const FUNCTIONS = new Set(["min", "max", "round", "abs", "floor", "ceil"]);

function stripExpr(input) {
  const text = String(input == null ? "" : input).trim();
  const match = text.match(/^\{\{\s*([\s\S]*?)\s*\}\}$/);
  return match ? match[1].trim() : text;
}

function tokenize(input) {
  const source = stripExpr(input);
  if (DISALLOWED.test(source)) {
    const error = new Error("Disallowed syntax in expression.");
    error.name = "DisallowedSyntax";
    throw error;
  }
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    const two = source.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      tokens.push({ type: "op", value: two });
      i += 2;
      continue;
    }
    if ("+-*/%(),!<>".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch === "'") {
      let value = "";
      i += 1;
      while (i < source.length) {
        if (source[i] === "\\" && source[i + 1] === "'") {
          value += "'";
          i += 2;
          continue;
        }
        if (source[i] === "'") break;
        value += source[i];
        i += 1;
      }
      if (source[i] !== "'") throw new Error("Unterminated string literal.");
      tokens.push({ type: "string", value });
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || (ch === "." && /\d/.test(source[i + 1]))) {
      const match = source.slice(i).match(/^\d+(?:\.\d+)?|^\.\d+/);
      tokens.push({ type: "number", value: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      const match = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$.]*/);
      tokens.push({ type: "id", value: match[0] });
      i += match[0].length;
      continue;
    }
    throw new Error(`Unexpected token "${ch}".`);
  }
  tokens.push({ type: "eof", value: "" });
  return tokens;
}

function parser(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = (value) => {
    if (value && peek().value !== value) throw new Error(`Expected "${value}".`);
    return tokens[pos++];
  };
  const precedence = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, "<=": 4, ">": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
  function primary() {
    const token = peek();
    if (token.type === "number" || token.type === "string") return { type: token.type, value: take().value };
    if (token.type === "id") {
      const name = take().value;
      if (peek().value === "(") {
        if (!FUNCTIONS.has(name)) {
          const error = new Error(`Unknown function: ${name}`);
          error.name = "UnknownIdentifier";
          throw error;
        }
        take("(");
        const args = [];
        if (peek().value !== ")") {
          do {
            args.push(expr(0));
            if (peek().value !== ",") break;
            take(",");
          } while (true);
        }
        take(")");
        return { type: "call", name, args };
      }
      return { type: "id", name };
    }
    if (token.value === "(") {
      take("(");
      const node = expr(0);
      take(")");
      return node;
    }
    if (token.value === "-" || token.value === "!") {
      return { type: "unary", op: take().value, arg: primary() };
    }
    throw new Error(`Unexpected expression token "${token.value}".`);
  }
  function expr(min) {
    let left = primary();
    while (precedence[peek().value] && precedence[peek().value] >= min) {
      const op = take().value;
      const right = expr(precedence[op] + 1);
      left = { type: "binary", op, left, right };
    }
    return left;
  }
  const ast = expr(0);
  if (peek().type !== "eof") throw new Error(`Unexpected trailing token "${peek().value}".`);
  return ast;
}

function readIdentifier(name, ctx) {
  if (name[0] === "$") return resolveToken(ctx.palette, name.slice(1));
  const parts = name.split(".");
  let root;
  if (Object.prototype.hasOwnProperty.call(ctx.params || {}, parts[0])) root = ctx.params;
  else if (parts[0] === "style") root = ctx.style || {};
  else if (parts[0] === "palette") root = ctx.palette || {};
  else {
    const error = new Error(`Unknown identifier: ${name}`);
    error.name = "UnknownIdentifier";
    throw error;
  }
  let value = parts[0] === "style" || parts[0] === "palette" ? root : root[parts[0]];
  const start = parts[0] === "style" || parts[0] === "palette" ? 1 : 1;
  for (let i = start; i < parts.length; i += 1) value = value == null ? undefined : value[parts[i]];
  if (value === undefined) {
    const error = new Error(`Unknown identifier: ${name}`);
    error.name = "UnknownIdentifier";
    throw error;
  }
  return value;
}

function evaluate(node, ctx) {
  if (node.type === "number" || node.type === "string") return node.value;
  if (node.type === "id") return readIdentifier(node.name, ctx);
  if (node.type === "unary") {
    const value = evaluate(node.arg, ctx);
    return node.op === "!" ? !value : -Number(value);
  }
  if (node.type === "call") {
    const args = node.args.map((arg) => Number(evaluate(arg, ctx)));
    return Math[node.name](...args);
  }
  const a = evaluate(node.left, ctx);
  const b = evaluate(node.right, ctx);
  if (node.op === "+") return a + b;
  if (node.op === "-") return Number(a) - Number(b);
  if (node.op === "*") return Number(a) * Number(b);
  if (node.op === "/") return Number(a) / Number(b);
  if (node.op === "%") return Number(a) % Number(b);
  if (node.op === "==") return a === b;
  if (node.op === "!=") return a !== b;
  if (node.op === "<") return a < b;
  if (node.op === "<=") return a <= b;
  if (node.op === ">") return a > b;
  if (node.op === ">=") return a >= b;
  if (node.op === "&&") return Boolean(a) && Boolean(b);
  if (node.op === "||") return Boolean(a) || Boolean(b);
  throw new Error(`Unsupported operator "${node.op}".`);
}

export function evalExpr(input, ctx = {}) {
  return evaluate(parser(tokenize(input)), ctx);
}

export function evalIfExpr(input, ctx = {}) {
  return Boolean(evalExpr(input, ctx));
}
