import React, { useState, useEffect } from "react";
import Form, { type IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import YAML from "js-yaml";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import harnessSchema from "../schema/harnessSchema.json";

type Harness = Record<string, unknown>;

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const schema = harnessSchema as const;

  const [tab, setTab] = useState<"form" | "yaml">("form");
  const [formData, setFormData] = useState<Harness>({});
  const [yamlText, setYamlText] = useState<string>("");
  const [yamlError, setYamlError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setYamlText(YAML.dump(formData, { lineWidth: 120 }));
      setYamlError(null);
    } catch (err) {
      setYamlError((err as Error).message);
    }
  }, [formData]);

  useEffect(() => {
    if (tab !== "yaml") return;
    try {
      const parsed = YAML.load(yamlText) as Harness;
      setFormData(parsed ?? {});
      setYamlError(null);
    } catch (err) {
      setYamlError((err as Error).message);
    }
  }, [yamlText, tab]);

  const onChange = (e: IChangeEvent) => setFormData(e.formData);

  const handleDownload = () => {
    const blob = new Blob([yamlText], { type: "text/yaml;charset=utf-8;" });
    saveAs(blob, "harness.yaml");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => setYamlText(txt));
  };

  const handleRender = async () => {
    const formDataObj = new FormData();
    formDataObj.append(
      "yml_file",
      new Blob([yamlText], { type: "text/yaml" }),
      "harness.yml"
    );

    const res = await fetch(import.meta.env.VITE_API_URL + "/render", {
      method: "POST",
      headers: { Accept: "text/html" },
      body: formDataObj,
    });

    const html = await res.text();
    sessionStorage.setItem("lastYaml", yamlText);
    sessionStorage.setItem("lastHtml", html);
    navigate("/preview");
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {([
          ["form", "Form"],
          ["yaml", "YAML"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: 500,
              border: "1px solid #ccc",
              backgroundColor: tab === value ? "#4f46e5" : "#eee",
              color: tab === value ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "form" ? (
          <motion.div
            key="form-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
            }}
          >
            <Form
              schema={schema}
              formData={formData}
              onChange={onChange}
              liveValidate
              validator={validator}
            />
            <button
              onClick={handleRender}
              style={{
                marginTop: "1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Generate Diagram
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="yaml-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <textarea
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              style={{
                width: "100%",
                minHeight: "300px",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
              }}
            />
            {yamlError && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>{yamlError}</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <input
                type="file"
                id="yaml-upload"
                accept=".yaml,.yml"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
              <label
                htmlFor="yaml-upload"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#eee",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Upload YAML
              </label>
              <button
                onClick={handleDownload}
                style={{
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Download YAML
              </button>
              <button
                onClick={handleRender}
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Generate Diagram
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Edit;
