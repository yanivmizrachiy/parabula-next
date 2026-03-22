type Props = {
  title: string;
  value: string;
  hint?: string;
};

export function StatusCard({ title, value, hint }: Props) {
  return (
    <div style={{
      border: "1px solid #24304d",
      borderRadius: 16,
      padding: 16,
      background: "#121933"
    }}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {hint ? <div style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}
