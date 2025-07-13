// src/pages/Preview.tsx
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();
  const html = sessionStorage.getItem("lastHtml") ?? "<p>No drawing generated.</p>";
  const yaml = sessionStorage.getItem("lastYaml") ?? "# No YAML available";

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => navigate("/edit")}>Back to Edit</button>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ marginTop: "1rem" }}
      />
      <h3>YAML Source</h3>
      <pre
        style={{
          background: "#f4f4f4",
          color: "#222",
          padding: "1em",
          borderRadius: "4px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
        }}
      >
        {yaml}
      </pre>
    </div>
  );
}
