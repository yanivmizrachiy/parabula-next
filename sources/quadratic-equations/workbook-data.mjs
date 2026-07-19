// מאגר מקורי ומדורג למשוואות ריבועיות לכיתה ט'.
// הכותרות וספירות המקור מופו מה-PDF של יניב; כל התרגילים כאן חדשים.

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

const F = (n, d = 1) => {
  if (d === 0) throw new Error('zero denominator');
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};

const fAdd = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const fMul = (a, b) => F(a.n * b.n, a.d * b.d);

const texF = ({ n, d }) => {
  if (d === 1) return `${n}`;
  if (n < 0) return `-\\frac{${Math.abs(n)}}{${d}}`;
  return `\\frac{${n}}{${d}}`;
};

const asF = value => typeof value === 'number' ? F(value) : value;

const answerRoots = values => {
  const roots = values.map(asF);
  const unique = [...new Map(roots.map(root => [`${root.n}/${root.d}`, root])).values()];
  if (unique.length === 1) return `x=${texF(unique[0])}`;
  return `x_1=${texF(unique[0])},\\quad x_2=${texF(unique[1])}`;
};

const perfectSquareRoot = value => {
  if (value < 0) return null;
  const root = Math.round(Math.sqrt(value));
  return root * root === value ? root : null;
};

const simplifiedRadical = value => {
  let square = 1;
  for (let k = 2; k * k <= value; k += 1) {
    if (value % (k * k) === 0) square = k;
  }
  return { outside: square, inside: value / (square * square) };
};

const solveStandard = (a, b, c) => {
  if (a < 0) [a, b, c] = [-a, -b, -c];
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return '\\text{אין פתרון ממשי}';
  const root = perfectSquareRoot(discriminant);
  if (root !== null) {
    return answerRoots([F(-b + root, 2 * a), F(-b - root, 2 * a)]);
  }
  const { outside, inside } = simplifiedRadical(discriminant);
  const radical = `${outside === 1 ? '' : outside}\\sqrt{${inside}}`;
  const numerator = -b === 0 ? `\\pm ${radical}` : `${-b} \\pm ${radical}`;
  return `x_{1,2}=\\frac{${numerator}}{${2 * a}}`;
};

const solveSquare = q => {
  q = asF(q);
  if (q.n < 0) return '\\text{אין פתרון ממשי}';
  if (q.n === 0) return 'x=0';
  const rn = perfectSquareRoot(q.n);
  const rd = perfectSquareRoot(q.d);
  if (rn !== null && rd !== null) return answerRoots([F(rn, rd), F(-rn, rd)]);
  if (q.d === 1) {
    const { outside, inside } = simplifiedRadical(q.n);
    return `x=\\pm ${outside === 1 ? '' : outside}\\sqrt{${inside}}`;
  }
  return `x=\\pm\\sqrt{\\frac{${q.n}}{${q.d}}}`;
};

const variableTerm = (coefficient, power = 1) => {
  const abs = Math.abs(coefficient);
  const variable = power === 2 ? 'x^2' : 'x';
  return `${abs === 1 ? '' : abs}${variable}`;
};

const polynomialTex = (a, b, c) => {
  const entries = [[a, 2], [b, 1], [c, 0]].filter(([coefficient]) => coefficient !== 0);
  return entries.map(([coefficient, power], index) => {
    const abs = Math.abs(coefficient);
    const core = power === 0 ? `${abs}` : variableTerm(coefficient, power);
    if (index === 0) return coefficient < 0 ? `-${core}` : core;
    return `${coefficient < 0 ? ' - ' : ' + '}${core}`;
  }).join('') + ' = 0';
};

const signedLinearTex = (coefficient, constant) => {
  const parts = [];
  if (coefficient !== 0) parts.push(`${coefficient === -1 ? '-' : coefficient === 1 ? '' : coefficient}x`);
  if (constant !== 0) {
    if (parts.length === 0) parts.push(`${constant}`);
    else parts.push(`${constant < 0 ? ' - ' : ' + '}${Math.abs(constant)}`);
  }
  return parts.join('') || '0';
};

const parenX = shift => shift === 0 ? 'x' : `(x ${shift < 0 ? '-' : '+'} ${Math.abs(shift)})`;

const make = ({ equation, answer, restriction = '', method = '', level }) => ({
  equation,
  answer,
  restriction,
  method,
  level,
});

const known = (equation, roots, method, restriction = '') => make({
  equation,
  answer: answerRoots(roots),
  restriction,
  method,
});

const symbolic = (equation, answer, method, restriction = '') => make({ equation, answer, method, restriction });

const cZero = (equation, a, b) => known(equation, [F(0), F(-b, a)], 'הוצאת גורם משותף');

const squareEq = (equation, q) => make({
  equation,
  answer: solveSquare(q),
  method: 'בידוד \\(x^2\\) והוצאת שורש',
});

const standard = (a, b, c, equation = polynomialTex(a, b, c), method = 'בחירת דרך פתרון יעילה') => make({
  equation,
  answer: solveStandard(a, b, c),
  method,
});

const bracketFromRoots = (r1, r2, a, p, q) => {
  const sum = r1 + r2;
  const product = r1 * r2;
  const b = -a * sum;
  const c = a * product;
  const rightX = a * (p + q) - b;
  const rightC = a * p * q - c;
  const leftPrefix = a === 1 ? '' : `${a}`;
  const equation = `${leftPrefix}${parenX(p)}${parenX(q)} = ${signedLinearTex(rightX, rightC)}`;
  return known(equation, [r1, r2], 'פתיחת סוגריים וכינוס איברים');
};

const bracketFromCoefficients = (a, b, c, p, q) => {
  const rightX = a * (p + q) - b;
  const rightC = a * p * q - c;
  const leftPrefix = a === 1 ? '' : `${a}`;
  return standard(a, b, c, `${leftPrefix}${parenX(p)}${parenX(q)} = ${signedLinearTex(rightX, rightC)}`, 'פתיחת סוגריים ואז נוסחת השורשים');
};

const vertex = (a, k, b, c) => {
  const prefix = a === 1 ? '' : `${a}`;
  const inside = k === 1 ? parenX(b) : `(${k}x ${b < 0 ? '-' : '+'} ${Math.abs(b)})`;
  return standard(a * k * k, 2 * a * k * b, a * b * b - c, `${prefix}${inside}^2 = ${c}`, 'בידוד הריבוע ושני סימני שורש');
};

const rationalTerm = (fraction, power) => {
  const { n, d } = fraction;
  const abs = Math.abs(n);
  if (power === 0) return d === 1 ? `${abs}` : `\\frac{${abs}}{${d}}`;
  const variable = power === 2 ? 'x^2' : 'x';
  if (d === 1) return `${abs === 1 ? '' : abs}${variable}`;
  return `\\frac{${abs === 1 ? '' : abs}${variable}}{${d}}`;
};

const rationalPolynomialTex = (a, b, c, divisor) => {
  const entries = [[F(a, divisor), 2], [F(b, divisor), 1], [F(c, divisor), 0]].filter(([fraction]) => fraction.n !== 0);
  return entries.map(([fraction, power], index) => {
    const core = rationalTerm(fraction, power);
    if (index === 0) return fraction.n < 0 ? `-${core}` : core;
    return `${fraction.n < 0 ? ' - ' : ' + '}${core}`;
  }).join('') + ' = 0';
};

const numericDenominator = (a, b, c, divisor) => standard(
  a,
  b,
  c,
  rationalPolynomialTex(a, b, c, divisor),
  'כפל במכנה מספרי וכינוס איברים',
);

const xDenominator = (a, b, c) => {
  const left = `${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} \\frac{${Math.abs(b)}}{x}`;
  return make({
    equation: `${left} = ${c}`,
    answer: solveStandard(a, -c, b),
    restriction: 'x\\ne 0',
    method: 'תחום הצבה וכפל ב-\\(x\\)',
  });
};

const shiftedDenominator = (r1, r2, h) => {
  const sum = r1 + r2;
  const product = r1 * r2;
  const b = sum - h;
  const a = b * h - product;
  const denominator = parenX(-h);
  const fraction = `\\frac{${Math.abs(a)}}{${denominator}}`;
  const left = `${a < 0 ? '-' : ''}${fraction}${b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}`;
  return known(`${left} = x`, [r1, r2], 'תחום הצבה, כפל במכנה ופתרון', `x\\ne ${h}`);
};

const factorDenominator = (r1, r2, h, k) => {
  const sum = r1 + r2;
  const product = r1 * r2;
  const a = k + sum;
  const b = -product;
  const leftNumerator = signedLinearTex(a, b);
  const leftDenominator = `x${parenX(h)}`;
  const rightNumerator = signedLinearTex(1, k);
  const rightDenominator = parenX(h);
  return known(
    `\\frac{${leftNumerator}}{${leftDenominator}} = \\frac{${rightNumerator}}{${rightDenominator}}`,
    [r1, r2],
    'פירוק המכנה וצמצום מבוקר',
    `x\\ne 0,\\quad x\\ne ${-h}`,
  );
};

const differenceSquares = (r1, r2, h) => {
  const sum = r1 + r2;
  const product = r1 * r2;
  const b = -product - sum * h - h * h;
  const first = `${sum < 0 ? '-' : ''}\\frac{${Math.abs(sum)}}{${parenX(-h)}}`;
  const second = `${b < 0 ? '-' : '+'} \\frac{${Math.abs(b)}}{x^2-${h * h}}`;
  return known(
    `${first} ${second} = 1`,
    [r1, r2],
    'פירוק הפרש ריבועים ומכנה משותף',
    `x\\ne ${h},\\quad x\\ne ${-h}`,
  );
};

const perfectSquareDenominator = (u, v, h) => {
  const sum = u + v;
  const b = -u * v;
  const denominator = parenX(-h);
  const first = `${sum < 0 ? '-' : ''}\\frac{${Math.abs(sum)}}{${denominator}}`;
  const second = `${b < 0 ? '-' : '+'} \\frac{${Math.abs(b)}}{${denominator}^2}`;
  return known(
    `${first} ${second} = 1`,
    [h + u, h + v],
    'זיהוי ריבוע מושלם ומכנה משותף',
    `x\\ne ${h}`,
  );
};

const s1 = [
  cZero('x^2 - 3x = 0', 1, -3),
  cZero('x^2 + 4x = 0', 1, 4),
  cZero('2x^2 - 14x = 0', 2, -14),
  cZero('3x^2 + 18x = 0', 3, 18),
  cZero('5x^2 = 20x', 5, -20),
  cZero('2x^2 + 8x = 0', 2, 8),
  cZero('6x^2 + 15x = 0', 6, 15),
  cZero('14x^2 - 21x = 0', 14, -21),
  cZero('-9x^2 + 12x = 0', -9, 12),
  cZero('0.5x^2 - 3x = 0', 1, -6),
  cZero('1.2x^2 + 3x = 0', 2, 5),
  cZero('\\frac{3}{4}x^2 - 6x = 0', 3, -24),
  cZero('4x(x-5)=3x^2', 1, -20),
  cZero('2x(3x+7)=5x^2', 1, 14),
  cZero('x(5x-8)=2x(2x+1)', 1, -10),
  cZero('3x(x-4)+2x=0', 3, -10),
  cZero('2x(x+5)=7x', 2, 3),
  cZero('5x(x-2)-3x(x+1)=0', 2, -13),
];

const s2 = [
  cZero('y^2 - 8y = 0', 1, -8),
  cZero('t^2 + 11t = 0', 1, 11),
  cZero('3z^2 = z', 3, -1),
  cZero('\\frac{5}{2}x^2 = 10x', 5, -20),
  cZero('0.2x^2 + x = 0', 1, 5),
  cZero('\\frac{7}{3}x^2-\\frac{14}{9}x=0', 21, -14),
  cZero('3y(y-2)=y^2', 2, -6),
  cZero('4t(t+1)=6t^2', -2, 4),
  cZero('z(2z-5)+3z=z^2', 1, -2),
  cZero('5x^2-2x=3x^2+7x', 2, -9),
  cZero('\\frac{x}{3}(x-6)=2x', 1, -12),
  cZero('0.4x(x+5)=x', 2, 5),
];

const s3 = [
  squareEq('x^2-16=0', 16), squareEq('x^2=49', 49), squareEq('4x^2=36', 9),
  squareEq('25x^2-4=0', F(4, 25)), squareEq('81-9x^2=0', 9), squareEq('16x^2=25', F(25, 16)),
  squareEq('49x^2-121=0', F(121, 49)), squareEq('0.25x^2=9', 36), squareEq('1.44x^2-0.81=0', F(9, 16)),
  squareEq('\\frac{9}{16}x^2=\\frac{36}{25}', F(64, 25)), squareEq('3x^2+12=39', 9), squareEq('7-2x^2=-25', 16),
  squareEq('5(x^2-2)=70', 16), squareEq('\\frac{2x^2}{3}-5=7', 18), squareEq('4-3x^2=-23', 9),
  squareEq('5x^2+20=0', -4), squareEq('-2x^2-18=0', -9), squareEq('4x^2+7=3', -1),
  squareEq('3x^2=11', F(11, 3)), squareEq('0.5x^2=7', 14),
];

const s4 = [
  squareEq('7x^2+5=3x^2+41', 9), squareEq('9x^2-13=5x^2+23', 9),
  squareEq('2(3x^2-4)=46', 9), squareEq('5(x^2+1)=2x^2+53', 16),
  squareEq('3(2x^2-5)=x^2+30', 9), squareEq('(x-4)(x+4)=20', 36),
  squareEq('(2x-3)(2x+3)=55', 16), squareEq('(3x+2)(3x-2)=77', 9),
  squareEq('2(x-5)(x+5)=14', 32), squareEq('5(x+1)(x-1)=37', F(42, 5)),
  squareEq('(x-6)(x+6)+40=0', -4), squareEq('3(x-2)(x+2)+15=0', -1),
];

const s5 = [
  squareEq('7x^2=0', 0), squareEq('3(x^2+4)=12', 0), squareEq('2x^2-50=0', 25),
  squareEq('18x^2=8', F(4, 9)), squareEq('0.04x^2=1', 25), squareEq('\\frac{x^2}{9}=4', 36),
  squareEq('(x-4)(x+4)=9', 25), squareEq('(2x-5)(2x+5)=11', 9), squareEq('(3x+1)(3x-1)=8', 1),
  squareEq('4(x-2)(x+2)=20', 9), squareEq('5(x-1)(x+1)=7', F(12, 5)), squareEq('2(x-3)(x+3)=5', F(23, 2)),
  squareEq('(x-8)(x+8)+70=0', -6), squareEq('3(x-2)(x+2)+18=0', -2), squareEq('0.5(x-6)(x+6)=10', 56),
  squareEq('\\frac{(x-3)(x+3)}{4}=5', 29), squareEq('12-2(x-1)(x+1)=0', 7), squareEq('5(x+2)(x-2)+3=0', F(17, 5)),
];

const s6 = [
  standard(1, -5, 4), standard(1, -1, -6), standard(1, -8, 12), standard(1, 6, 5), standard(1, 1, -12), standard(1, 4, -12),
  standard(2, -12, 10), standard(2, 2, -12), standard(3, -9, -12), standard(2, 14, 20), standard(3, -30, 63), standard(2, -4, -48),
  standard(2, -7, 3), standard(2, -7, -4), standard(3, 7, -6), standard(4, -4, -3), standard(4, -12, 9), standard(9, 12, 4),
  standard(3, -5, -1), standard(2, 4, 5), standard(5, -2, -3), standard(7, 1, -4), standard(3, -6, 7), standard(6, 1, -2),
];

const bracketParams = [
  [1, 3, 1, 1, 2], [-2, 4, 1, -1, 3], [2, 5, 1, 2, -1], [-4, 1, 1, -2, 4], [3, -2, 1, 1, -3], [-5, -1, 1, -2, -4],
  [1, 6, 2, 2, 1], [-3, 2, 2, -1, 2], [4, -1, 2, 3, -2], [-2, -5, 2, -3, 1], [3, 7, 2, 2, 5], [-4, 6, 2, -1, 4],
  [2, 8, 3, 1, 3], [-6, 1, 3, -2, 2], [5, -3, 3, 4, -1], [-7, -2, 3, -4, 1], [4, 9, 2, 3, 5], [-8, 3, 2, -5, 2],
  [1, 10, 4, 2, 6], [-9, -1, 4, -3, -5], [6, -5, 3, 4, -2], [-7, 4, 3, -4, 3],
];
const s7 = [
  ...bracketParams.map(params => bracketFromRoots(...params)),
  bracketFromCoefficients(2, 3, 5, 1, -2),
  bracketFromCoefficients(1, -6, 9, 2, 1),
  bracketFromCoefficients(3, 4, -2, -1, 3),
  bracketFromCoefficients(2, -4, 7, 2, -3),
];

const s8 = [
  vertex(1, 1, 2, 9), vertex(1, 1, -4, 16), vertex(2, 1, 1, 18), vertex(3, 1, -2, 27),
  vertex(1, 2, 5, 9), vertex(1, 3, -1, 25), vertex(4, 1, 3, 36), vertex(9, 1, -5, 81),
  vertex(2, 2, -3, 32), vertex(5, 3, 2, 45), vertex(1, 4, -1, 7), vertex(3, 2, 1, 15),
  vertex(2, 1, -6, 7), vertex(5, 1, 4, 11), vertex(3, 1, 2, 2), vertex(7, 2, -1, 5),
  vertex(1, 1, -8, 3), vertex(4, 3, -2, 7), vertex(1, 5, 1, 12), vertex(2, 4, -3, 5),
  vertex(1, 2, -7, 0), vertex(6, 3, 1, 0), vertex(1, 1, 1, -4), vertex(2, 2, -5, -3),
];

const s9 = [
  symbolic('(x-p)(x+2p)=0', 'x_1=p,\\quad x_2=-2p', 'פירוק לגורמים עם פרמטר'),
  symbolic('x^2-9m^2=0', 'x=\\pm 3m', 'הפרש ריבועים'),
  symbolic('(x+a)^2=0', 'x=-a', 'זיהוי שורש כפול'),
  symbolic('x^2+(k-4)x-4k=0', 'x_1=4,\\quad x_2=-k', 'זיהוי טרינום פרמטרי'),
  symbolic('(x-b)(2x+3b)=0', 'x_1=b,\\quad x_2=-\\frac{3b}{2}', 'מכפלה שווה לאפס'),
  symbolic('(x+3c)(x-c)=0', 'x_1=-3c,\\quad x_2=c', 'מכפלה שווה לאפס'),
  symbolic('x^2-(t+5)x+5t=0', 'x_1=t,\\quad x_2=5', 'פירוק טרינום פרמטרי'),
  symbolic('4x^2-4qx-3q^2=0', 'x_1=-\\frac{q}{2},\\quad x_2=\\frac{3q}{2}', 'פירוק לפי גורמים'),
  symbolic('(x-r)^2=s^2', 'x_1=r+s,\\quad x_2=r-s', 'שני סימני שורש'),
  symbolic('ax^2-4a=0', 'x=\\pm 2', 'הוצאת פרמטר משותף', 'a\\ne 0'),
  symbolic('mx^2+(m-n)x-n=0', 'x_1=-1,\\quad x_2=\\frac{n}{m}', 'פירוק לפי קבוצות', 'm\\ne 0'),
  symbolic('p^2x^2+3px-10=0', 'x_1=\\frac{2}{p},\\quad x_2=-\\frac{5}{p}', 'פירוק לפי גורמים', 'p\\ne 0'),
];

const s10 = [
  symbolic('x^2-(p+q)x+pq=0', 'x_1=p,\\quad x_2=q', 'זיהוי סכום ומכפלה'),
  symbolic('m^2x^2-16=0', 'x=\\pm\\frac{4}{m}', 'הפרש ריבועים', 'm\\ne 0'),
  symbolic('(x+2a)^2=9b^2', 'x_{1,2}=-2a\\pm 3b', 'שני סימני שורש'),
  symbolic('a^2x^2+2abx+b^2=0', 'x=-\\frac{b}{a}', 'זיהוי ריבוע מושלם', 'a\\ne 0'),
  symbolic('x^2-2px+p^2-q^2=0', 'x_{1,2}=p\\pm q', 'ריבוע מושלם והפרש ריבועים'),
  symbolic('4x^2+4mx+m^2-n^2=0', 'x_{1,2}=\\frac{-m\\pm n}{2}', 'שתי נוסחאות כפל מקוצר'),
  symbolic('(px-q)(qx-p)=0', 'x_1=\\frac{q}{p},\\quad x_2=\\frac{p}{q}', 'מכפלה שווה לאפס', 'p\\ne 0,\\quad q\\ne 0'),
  symbolic('ax^2-(a+b)x+b=0', 'x_1=1,\\quad x_2=\\frac{b}{a}', 'פירוק טרינום פרמטרי', 'a\\ne 0'),
];

const s11 = [
  numericDenominator(1, -5, 4, 2), numericDenominator(1, 3, -4, 3), numericDenominator(1, -3, -10, 4), numericDenominator(1, 1, -6, 5),
  numericDenominator(1, -5, -6, 6), numericDenominator(1, 7, 10, 8), numericDenominator(1, -10, 21, 10), numericDenominator(1, 2, -24, 12),
  numericDenominator(2, -11, 5, 6), numericDenominator(2, -5, -3, 9), numericDenominator(3, 10, -8, 12), numericDenominator(2, -1, -6, 15),
  numericDenominator(1, -6, 9, 4), numericDenominator(1, 4, 4, 6), numericDenominator(2, -3, -1, 8), numericDenominator(3, 2, 5, 10),
];

const s12 = [
  xDenominator(1, 10, 7), xDenominator(1, -6, 1), xDenominator(2, 16, 18), xDenominator(1, -6, 5),
  xDenominator(1, 8, -6), xDenominator(1, 21, 10), xDenominator(2, -20, -6), xDenominator(1, -15, 2),
  xDenominator(1, 16, 8), xDenominator(3, -18, -15), xDenominator(1, 5, 2), xDenominator(2, 9, 1),
];

const s13 = [
  shiftedDenominator(1, 5, -2), shiftedDenominator(-3, 4, 1), shiftedDenominator(2, 7, -1), shiftedDenominator(-4, -1, 2),
  shiftedDenominator(3, 6, 1), shiftedDenominator(-2, 5, -1), shiftedDenominator(4, 8, -3), shiftedDenominator(-5, 2, 3),
  shiftedDenominator(1, 9, 2), shiftedDenominator(-6, -2, 1), shiftedDenominator(5, 7, -2), shiftedDenominator(-7, 3, 4),
];

const s14 = [
  factorDenominator(-2, 5, 3, 1), factorDenominator(1, 4, 2, -1), factorDenominator(-3, 2, 4, 2), factorDenominator(-5, -2, 1, 3),
  factorDenominator(3, 6, -2, 1), factorDenominator(-4, 1, 5, -2), factorDenominator(2, 7, 3, 4), factorDenominator(-6, 3, -1, 2),
];

const s15 = [
  differenceSquares(1, 4, 2), differenceSquares(-3, 5, 1), differenceSquares(2, 7, 3), differenceSquares(-5, -2, 1),
  differenceSquares(3, 8, 2), differenceSquares(-4, 6, 3), differenceSquares(1, 9, 4), differenceSquares(-6, -1, 2),
  differenceSquares(5, 7, 3), differenceSquares(-7, 2, 4), differenceSquares(3, -8, 1), differenceSquares(-9, -2, 4),
];

const s16 = [
  perfectSquareDenominator(1, 3, 2), perfectSquareDenominator(-2, 4, -1), perfectSquareDenominator(2, 5, 3), perfectSquareDenominator(-4, -1, 2),
  perfectSquareDenominator(3, 6, -2), perfectSquareDenominator(-5, 2, 4), perfectSquareDenominator(1, 7, -3), perfectSquareDenominator(-6, -2, 1),
  perfectSquareDenominator(4, 9, 2), perfectSquareDenominator(-7, 3, -2), perfectSquareDenominator(5, -3, 4), perfectSquareDenominator(-8, -1, 3),
];

export const stageNames = ['ביסוס', 'שלב ביניים', 'שילוב כלים', 'אתגר'];

const curriculumIdForSection = number => {
  if (number <= 5) return 'g9.alg.quadratic.incomplete';
  if ([7, 8, 15, 16].includes(number)) return 'g9.alg.quadratic.factoring';
  return 'g9.alg.quadratic.formula';
};

const finalize = (number, title, sourceCount, pageSizes, prompt, exercises) => {
  if (exercises.length !== sourceCount * 2) throw new Error(`section ${number}: expected ${sourceCount * 2}, got ${exercises.length}`);
  if (pageSizes.reduce((sum, size) => sum + size, 0) !== exercises.length) throw new Error(`section ${number}: page sizes mismatch`);
  return {
    number,
    title,
    curriculumId: curriculumIdForSection(number),
    sourceCount,
    pageSizes,
    prompt,
    exercises: exercises.map((exercise, index) => ({
      ...exercise,
      id: `${number}-${index + 1}`,
      level: exercise.level ?? Math.min(4, Math.floor(index * 4 / exercises.length) + 1),
    })),
  };
};

export const sections = [
  finalize(1, 'משוואה ריבועית חסרה \\((c=0)\\)', 9, [6, 6, 6], 'פתרו באמצעות הוצאת גורם משותף.', s1),
  finalize(2, 'משוואה ריבועית חסרה \\((c=0)\\)', 6, [6, 6], 'פתרו. שימו לב למשתנה, לשברים ולסידור האגפים.', s2),
  finalize(3, 'משוואה ריבועית חסרה \\((b=0)\\)', 10, [5, 5, 5, 5], 'בודדו את \\(x^2\\) ופתרו במספרים הממשיים.', s3),
  finalize(4, 'משוואה ריבועית חסרה \\((b=0)\\)', 6, [6, 6], 'פשטו תחילה, אחר כך בודדו את \\(x^2\\).', s4),
  finalize(5, 'משוואה ריבועית חסרה \\((b=0)\\)', 9, [6, 6, 6], 'פתרו וקבעו גם מתי אין פתרון ממשי.', s5),
  finalize(6, 'משוואה ריבועית מלאה', 12, [6, 6, 6, 6], 'בחרו דרך יעילה: פירוק לגורמים, השלמה לריבוע או נוסחת השורשים.', s6),
  finalize(7, 'משוואות ריבועיות עם סוגריים', 13, [5, 5, 4, 4, 4, 4], 'פתחו סוגריים, כנסו איברים ורק אז פתרו.', s7),
  finalize(8, 'משוואות מהצורה: \\(a(x+b)^2=c\\)', 12, [6, 6, 6, 6], 'בודדו את הריבוע והקפידו על שני סימני השורש.', s8),
  finalize(9, 'משוואות ריבועיות עם פרמטרים:', 6, [6, 6], 'פתרו באמצעות הפרמטרים הנתונים.', s9),
  finalize(10, 'משוואות ריבועיות עם פרמטרים:', 4, [4, 4], 'פתרו וציינו את ההגבלות על הפרמטרים.', s10),
  finalize(11, 'משוואות ריבועיות עם מכנה מספרי', 8, [4, 4, 4, 4], 'כפלו במכנה משותף מספרי, כנסו איברים ופתרו.', s11),
  finalize(12, 'משוואות ריבועיות עם \\(X\\) במכנה', 6, [4, 4, 4], 'כתבו את תחום ההצבה ופתרו את המשוואות.', s12),
  finalize(13, 'משוואות ריבועיות עם \\(X\\) במכנה', 6, [4, 4, 4], 'כתבו את תחום ההצבה, נקו מכנים ובדקו את הפתרונות.', s13),
  finalize(14, 'משוואות ריבועיות עם שברים ופירוקים', 4, [4, 4], 'כתבו את תחום ההצבה, פרקו גורמים ופתרו.', s14),
  finalize(15, 'משוואות הכוללות שימוש בנוסחת הכפל המקוצר: \\(a^2-b^2=(a+b)(a-b)\\)', 6, [4, 4, 4], 'כתבו תחום הצבה והשתמשו בהפרש ריבועים.', s15),
  finalize(16, 'משוואות הכוללות שימוש בנוסחאות הכפל המקוצר: \\((a\\pm b)^2=a^2\\pm2ab+b^2\\)', 6, [4, 4, 4], 'כתבו תחום הצבה וזהו תחילה את הריבוע המושלם.', s16),
];

export const sourceExerciseCount = sections.reduce((sum, section) => sum + section.sourceCount, 0);
export const exerciseCount = sections.reduce((sum, section) => sum + section.exercises.length, 0);
export const pageCount = sections.reduce((sum, section) => sum + section.pageSizes.length, 0);
// 31-36 הם ששת עמודי הנושא הקיימים; הטווח 471-514 ממשיך אחרי העמוד האחרון ב-main.
export const pageNumbers = [31, 32, 33, 34, 35, 36, ...Array.from({ length: 44 }, (_, index) => 471 + index)];

if (sourceExerciseCount !== 123 || exerciseCount !== 246 || pageCount !== 50 || pageNumbers.length !== 50) {
  throw new Error(`workbook invariant failed: source=${sourceExerciseCount}, exercises=${exerciseCount}, pages=${pageCount}`);
}

export const pages = [];
let exerciseOffset = 0;
let pageOffset = 0;
for (const section of sections) {
  let sectionOffset = 0;
  for (let sectionPage = 0; sectionPage < section.pageSizes.length; sectionPage += 1) {
    const size = section.pageSizes[sectionPage];
    const exercises = section.exercises.slice(sectionOffset, sectionOffset + size);
    pages.push({
      globalNumber: pageNumbers[pageOffset],
      localNumber: pageOffset + 1,
      sectionPage: sectionPage + 1,
      sectionPageCount: section.pageSizes.length,
      exerciseStart: exerciseOffset + 1,
      exerciseEnd: exerciseOffset + size,
      ...section,
      exercises,
    });
    sectionOffset += size;
    exerciseOffset += size;
    pageOffset += 1;
  }
}
