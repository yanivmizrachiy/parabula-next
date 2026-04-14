# CHANGELOG — 2026-04-14

## כלל ברזל

כל שינוי תשתיתי בריפו חייב להיות מתועד כך ש-AI עתידי יוכל להבין:
- מה כבר נעשה
- מה נוסף היום
- מה עדיין פתוח
- מה הצעד הבא

אין להציג יכולת כאילו הושלמה אם היא לא הושלמה בפועל.
אין לערבב בין נושאי דפי העבודה.
אין לגעת בדפי העבודה עצמם במסגרת עבודות סדר, מובייל, הדפסה או שחזור, אלא אם המשתמש ביקש במפורש.

## מה נוסף בפועל

### שכבת טלפון / מובייל
- preview/phone.html
- preview/phone.js
- preview/mobile.css
- preview/manifest.webmanifest
- preview/icon.svg
- preview/sw.js

### שכבת בטיחות / recovery audit
- scripts/recovery-audit.mjs
- .github/workflows/recovery-audit.yml

### שכבת רצף ותיעוד
- STATE/PROJECT_CONTINUITY.md

### התחלת מרכז הדפסה
- preview/print.html

## מה עדיין פתוח
- סנכרון מלא של PROJECT_RULES.md
- השלמת preview/print.js
- חיזוק installability/cache של שכבת הטלפון
- הוספת restore בטוח מעבר ל-audit

## הצעד הבא
להמשיך בשכבת תצוגה/הדפסה ותיעוד, בלי לגעת בדפי העבודה עצמם.
