import { readFileSync } from "fs";
import path from "path";
import { StatusCard } from "@/components/cards/status-card";
import { ActionButton } from "@/components/actions/action-button";

function getState() {
  const statePath = path.join(process.cwd(), "storage", "system-state.json");
  return JSON.parse(readFileSync(statePath, "utf8"));
}

export default function HomePage() {
  const state = getState();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section>
        <h2>מרכז הבקרה</h2>
        <p>תמונת מצב מהירה, אמיתית וללא סימולציה.</p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        <StatusCard title="מצב כללי" value={state.overallStatus} hint="מבוסס על נתונים ידועים בלבד" />
        <StatusCard title="מכשירים" value={String(state.devices.length)} hint="מכשירים במפת המערכת" />
        <StatusCard title="ריפוזיטוריז" value={String(state.repositories.length)} hint="כולל n8n ו-server-core" />
        <StatusCard title="אינטגרציות" value={String(state.integrations.length)} hint="GitHub, OpenAI, Google, Microsoft" />
      </section>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ActionButton label="עדכן מצב" explanation="מרענן מידע זמין בצורה חסכונית וללא בדיקות עמוקות" />
        <ActionButton label="רענן מצב מכשירים" explanation="מבצע איסוף מצב בסיסי אם קיים מקור נתונים זמין" />
        <ActionButton label="פתח אבחון" explanation="מציג חסימות, מידע חסר והמלצות להמשך" />
      </section>

      <section>
        <h3>חסימות עיקריות</h3>
        <ul>
          {state.mainBlockers.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
