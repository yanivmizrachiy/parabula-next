// מקור תשובות מאוחד לבנייה ולבדיקות.
// פיצול ליחידות מונע קובץ ענק ומאפשר להרחיב כל יחידה באופן עצמאי.

import { answers as coreAnswers, glossary } from './answers.mjs';
import { unit03Answers } from './answers-unit-03.mjs';
import { page36Answers } from './answers-page36.mjs';
import { pages37to38Answers } from './answers-pages37-38.mjs';
import { pages39to45Answers } from './answers-pages39-45.mjs';
import { pages39to44EnrichmentAnswers } from './answers-pages39-44-enrichment.mjs';
import { page46Answers } from './answers-page46.mjs';
import { unit04Answers } from './answers-unit-04.mjs';
import { unit05Answers } from './answers-unit-05.mjs';
import { unit06Answers } from './answers-unit-06.mjs';
import { unit07Answers } from './answers-unit-07.mjs';
import { unit08Answers } from './answers-unit-08.mjs';

export const answers = [
  ...coreAnswers,
  ...unit03Answers,
  ...page36Answers,
  ...pages37to38Answers,
  ...pages39to45Answers,
  ...pages39to44EnrichmentAnswers,
  ...page46Answers,
  ...unit04Answers,
  ...unit05Answers,
  ...unit06Answers,
  ...unit07Answers,
  ...unit08Answers
];
export { glossary };
