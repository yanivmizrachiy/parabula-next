// מקור תשובות מאוחד לבנייה ולבדיקות.
// פיצול ליחידות מונע קובץ ענק ומאפשר להרחיב כל יחידה באופן עצמאי.

import { answers as coreAnswers, glossary } from './answers.mjs';
import { unit03Answers } from './answers-unit-03.mjs';

export const answers = [...coreAnswers, ...unit03Answers];
export { glossary };
