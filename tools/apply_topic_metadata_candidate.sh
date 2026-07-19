#!/data/data/com.termux/files/usr/bin/bash
# DEPRECATED — לא בשימוש ואינו מקור כללים.
# הכלי נכתב לסביבת Termux (נתיב /data/data/com.termux/...) ומפנה אל PROJECT_RULES.md ואל STATE/
# שאינם קיימים בריפו. הוא אינו יכול לרוץ, ואין לקרוא את הטענות שבו ככללי עבודה.
# מקור הכללים היחיד הוא CLAUDE.md.
set -euo pipefail
cd "/data/data/com.termux/files/home/parabula-next"
cp "meta/topics.json" "STATE/topics.apply.backup.20260426_090302.json"
cp "STATE/TOPIC_METADATA_FIXED_CANDIDATE.json" "meta/topics.json"
git add meta/topics.json STATE/topics.apply.backup.20260426_090302.json STATE/TOPIC_METADATA_FIXED_CANDIDATE.json STATE/TOPIC_METADATA_PROTECTED_AUDIT.md STATE/TOPIC_METADATA_PROPOSED_FIX.md STATE/RULES_SYNC_GAPS.md STATE/MEGA_REPO_AUDIT.md
git commit -m "fix(metadata): protected topic separation repair candidate apply"
echo "APPLY COMPLETE"
