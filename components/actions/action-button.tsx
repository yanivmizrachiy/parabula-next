type Props = {
  label: string;
  explanation: string;
};

export function ActionButton({ label, explanation }: Props) {
  return (
    <button
      type="button"
      title={explanation}
      style={{
        background: "#1d4ed8",
        color: "white",
        border: "none",
        borderRadius: 12,
        padding: "12px 16px",
        cursor: "pointer",
        textAlign: "right"
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>{explanation}</div>
    </button>
  );
}
