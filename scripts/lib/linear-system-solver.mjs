// פותר מערכות לינאריות בשני נעלמים באריתמetiקה רציונלית מדויקת (BigInt).
// אין קירוב עשרוני ואין סובלנות מספרית: מקדם, פתרון וסיווג נגזרים בדיוק מלא.

const gcd = (a, b) => {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x;
};

export class Frac {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error('division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    this.n = n / g;
    this.d = d / g;
  }
  static of(value) { return value instanceof Frac ? value : new Frac(BigInt(value)); }
  add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
  div(o) { return new Frac(this.n * o.d, this.d * o.n); }
  neg() { return new Frac(-this.n, this.d); }
  isZero() { return this.n === 0n; }
  eq(o) { return this.n === o.n && this.d === o.d; }
  isInteger() { return this.d === 1n; }
  toString() { return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`; }
  toLatex() { return this.d === 1n ? `${this.n}` : (this.n < 0n ? `-\\frac{${-this.n}}{${this.d}}` : `\\frac{${this.n}}{${this.d}}`); }
  toNumber() { return Number(this.n) / Number(this.d); }
}

const ZERO = new Frac(0n);
const ONE = new Frac(1n);

// ---- LaTeX → תחביר חשבוני ----------------------------------------------

const stripFractions = (src) => {
  let out = src;
  for (let guard = 0; guard < 40; guard += 1) {
    const at = out.indexOf('\\frac');
    if (at < 0) break;
    let i = at + 5;
    const readGroup = () => {
      while (out[i] === ' ') i += 1;
      if (out[i] !== '{') { const ch = out[i]; i += 1; return ch; }
      let depth = 0;
      const start = i;
      for (; i < out.length; i += 1) {
        if (out[i] === '{') depth += 1;
        else if (out[i] === '}') { depth -= 1; if (depth === 0) { i += 1; return out.slice(start + 1, i - 1); } }
      }
      throw new Error('unbalanced \\frac group');
    };
    const num = readGroup();
    const den = readGroup();
    out = `${out.slice(0, at)}((${num})/(${den}))${out.slice(i)}`;
  }
  return out;
};

const normalize = (src) => {
  let s = stripFractions(src)
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\left|\\right/g, '')
    .replace(/\s+/g, '');
  // כפל מובלע: 2x, 3(, )(, )x, x( , 2( , )2
  s = s.replace(/([0-9a-zA-Z)])(?=[a-zA-Z(])/g, (m) => `${m}*`);
  s = s.replace(/(\))(?=[0-9])/g, '$1*');
  return s;
};

// ---- מפרש רקורסיבי מעל Frac --------------------------------------------

const evaluate = (expr, vars) => {
  let i = 0;
  const peek = () => expr[i];
  const parseExpr = () => {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = expr[i]; i += 1;
      const rhs = parseTerm();
      value = op === '+' ? value.add(rhs) : value.sub(rhs);
    }
    return value;
  };
  const parseTerm = () => {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const op = expr[i]; i += 1;
      const rhs = parseUnary();
      value = op === '*' ? value.mul(rhs) : value.div(rhs);
    }
    return value;
  };
  const parseUnary = () => {
    if (peek() === '-') { i += 1; return parseUnary().neg(); }
    if (peek() === '+') { i += 1; return parseUnary(); }
    return parsePower();
  };
  const parsePower = () => {
    let base = parseAtom();
    if (peek() === '^') {
      i += 1;
      let digits = '';
      if (peek() === '{') { i += 1; while (peek() !== '}') { digits += expr[i]; i += 1; } i += 1; }
      else { digits += expr[i]; i += 1; }
      const exp = Number(digits);
      let acc = ONE;
      for (let k = 0; k < exp; k += 1) acc = acc.mul(base);
      base = acc;
    }
    return base;
  };
  const parseAtom = () => {
    if (peek() === '(') {
      i += 1;
      const value = parseExpr();
      if (peek() !== ')') throw new Error(`expected ) at ${i} in ${expr}`);
      i += 1;
      return value;
    }
    if (/[0-9]/.test(peek() ?? '')) {
      let digits = '';
      while (/[0-9]/.test(expr[i] ?? '')) { digits += expr[i]; i += 1; }
      if (expr[i] === '.') {
        i += 1;
        let dec = '';
        while (/[0-9]/.test(expr[i] ?? '')) { dec += expr[i]; i += 1; }
        return new Frac(BigInt(digits + dec), 10n ** BigInt(dec.length));
      }
      return new Frac(BigInt(digits));
    }
    if (/[a-zA-Z]/.test(peek() ?? '')) {
      const name = expr[i]; i += 1;
      if (!(name in vars)) throw new Error(`unknown variable ${name} in ${expr}`);
      return vars[name];
    }
    throw new Error(`unexpected token '${peek()}' at ${i} in ${expr}`);
  };
  const result = parseExpr();
  if (i !== expr.length) throw new Error(`trailing input at ${i} in ${expr}`);
  return result;
};

// ---- משוואה בודדת -------------------------------------------------------

/** מחזיר {a,b,c} עבור a·x + b·y = c, או זורק אם הביטוי אינו לינארי. */
export const linearize = (latexEquation) => {
  const sides = latexEquation.split('=');
  if (sides.length !== 2) throw new Error(`equation must have exactly one '=': ${latexEquation}`);
  const lhs = normalize(sides[0]);
  const rhs = normalize(sides[1]);
  const f = (x, y) => {
    const vars = { x: Frac.of(x), y: Frac.of(y) };
    return evaluate(lhs, vars).sub(evaluate(rhs, vars));
  };
  const f00 = f(0, 0);
  const a = f(1, 0).sub(f00);
  const b = f(0, 1).sub(f00);
  const c = f00.neg();
  // אימות לינאריות בשתי נקודות בקרה נוספות (הלוך־חזור)
  for (const [px, py] of [[2, 3], [-1, 5], [7, -4]]) {
    const expected = a.mul(Frac.of(px)).add(b.mul(Frac.of(py))).sub(c);
    if (!f(px, py).eq(expected)) throw new Error(`non-linear equation: ${latexEquation}`);
  }
  return { a, b, c };
};

/** נרמול משוואה למחרוזת טביעת אצבע קנונית (מקדמים שלמים, ראשוניים, סימן מנורמל). */
export const fingerprintEquation = ({ a, b, c }) => {
  const dens = [a.d, b.d, c.d];
  let lcm = 1n;
  for (const d of dens) lcm = (lcm * d) / gcd(lcm, d);
  let na = a.n * (lcm / a.d);
  let nb = b.n * (lcm / b.d);
  let nc = c.n * (lcm / c.d);
  let g = gcd(gcd(na, nb), nc) || 1n;
  na /= g; nb /= g; nc /= g;
  const lead = na !== 0n ? na : nb;
  if (lead < 0n) { na = -na; nb = -nb; nc = -nc; }
  return `${na},${nb},${nc}`;
};

// ---- מערכת --------------------------------------------------------------

const CASES_RE = /\\begin\{cases\}([\s\S]*?)\\end\{cases\}/;

export const parseSystem = (latex) => {
  const match = latex.match(CASES_RE);
  if (!match) throw new Error('no \\begin{cases} block found');
  return match[1]
    .split('\\\\')
    .map((line) => line.trim())
    .filter(Boolean);
};

/**
 * פותר מערכת של שתי משוואות לינאריות.
 * מחזיר { kind: 'unique'|'none'|'infinite', x?, y?, equations, fingerprint }
 */
export const solveSystem = (latex) => {
  const raw = parseSystem(latex);
  if (raw.length !== 2) throw new Error(`expected 2 equations, found ${raw.length}`);
  const equations = raw.map(linearize);
  const [e1, e2] = equations;
  const det = e1.a.mul(e2.b).sub(e2.a.mul(e1.b));
  const fingerprints = equations.map(fingerprintEquation);
  const base = { equations, raw, fingerprint: [...fingerprints].sort().join(' | ') };
  if (!det.isZero()) {
    const x = e1.c.mul(e2.b).sub(e2.c.mul(e1.b)).div(det);
    const y = e1.a.mul(e2.c).sub(e2.a.mul(e1.c)).div(det);
    // אימות הלוך־חזור: הצבת הפתרון חייבת לאפס את שתי המשוואות בדיוק
    for (const eq of equations) {
      if (!eq.a.mul(x).add(eq.b.mul(y)).sub(eq.c).isZero()) {
        throw new Error(`round-trip verification failed for ${latex}`);
      }
    }
    return { ...base, kind: 'unique', x, y };
  }
  return { ...base, kind: fingerprints[0] === fingerprints[1] ? 'infinite' : 'none' };
};

export const formatPair = ({ x, y }) => `(${x.toString()}, ${y.toString()})`;
