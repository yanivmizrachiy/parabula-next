// מקור תשובות מאוחד לבנייה ולבדיקות.
// פיצול ליחידות מונע קובץ ענק ומאפשר להרחיב כל יחידה באופן עצמאי.

import { answers as coreAnswers, glossary } from './answers.mjs';
import { unit03Answers } from './answers-unit-03.mjs';
import { page36Answers } from './answers-page36.mjs';
import { pages37to38Answers } from './answers-pages37-38.mjs';
import { pages39to45Answers } from './answers-pages39-45.mjs';

export const answers = [
  ...coreAnswers,
  ...unit03Answers,
  ...page36Answers,
  ...pages37to38Answers,
  ...pages39to45Answers
];
export { glossary };
