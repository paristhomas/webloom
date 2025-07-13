/*
  Edit.tsx – complete rewrite (July 2025)
  -------------------------------------------------
  MVP GUI for WireViz harness editing.
  Technologies used:
    • React 18 + TypeScript
    • react-jsonschema-form (@rjsf/core) for auto-generated form UI
    • js-yaml to convert between JSON ⇄ YAML
    • file-saver to download YAML locally
    • Tailwind CSS for styling, Framer-Motion for subtle animations

  Installation hints (one-off):
    pnpm add @rjsf/core js-yaml file-saver framer-motion

  You’ll also need the JSON Schema we drafted earlier saved as
  `src/schema/harnessSchema.json` (or adjust the import path below).
*/

import React, { useState, useEffect } from "react";
import Form, { IChangeEvent } from "@rjsf/core";
import YAML from "js-yaml";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

import harnessSchema from "../schema/harnessSchema.json";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

type Harness = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const Edit: React.FC = () => {
  const schema = harnessSchema as const;

  const [tab, setTab] = useState<"form" | "yaml">("form");
  const [formData, setFormData] = useState<Harness>({});
  const [yamlText, setYamlText] = useState<string>("");
  const [yamlError, setYamlError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Synchronise -> YAML when form changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    try {
      setYamlText(YAML.dump(formData, { lineWidth: 120 }));
      setYamlError(null);
    } catch (err) {
      console.error("YAML dump error", err);
      setYamlError((err as Error).message);
    }
  }, [formData]);

  // -------------------------------------------------------------------------
  // Synchronise -> form when YAML textarea edited (only on YAML tab)
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Form change handler
  // -------------------------------------------------------------------------
  const onChange = (e: IChangeEvent) => setFormData(e.formData);

  // -------------------------------------------------------------------------
  // Helpers: download + upload YAML
  // -------------------------------------------------------------------------
  const handleDownload = () => {
    const blob = new Blob([yamlText], { type: "text/yaml;charset=utf-8;" });
    saveAs(blob, "harness.yaml");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => setYamlText(txt));
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div className="p-4 grid gap-4 max-w-screen-lg mx-auto">
      {/* Tabs */}
      <div className="flex gap-2">
        {([
          ["form", "Form"],
          ["yaml", "YAML"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium shadow transition-all
              ${
                tab === value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "form" ? (
          <motion.div
            key="form-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white p-4 rounded-2xl shadow"
          >
            <Form
              schema={schema}
              formData={formData}
              onChange={onChange}
              liveValidate
            />
          </motion.div>
        ) : (
          <motion.div
            key="yaml-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <textarea
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              className="font-mono text-sm p-3 min-h-[60vh] resize-vertical rounded-xl shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {yamlError && (
              <p className="mt-2 text-sm text-red-600">{yamlError}</p>
            )}

            <div className="flex gap-2 mt-4">
              <input
                type="file"
                id="yaml-upload"
                accept=".yaml,.yml"
                className="hidden"
                onChange={handleUpload}
              />
              <label
                htmlFor="yaml-upload"
                className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg shadow"
              >
                Upload YAML
              </label>

              <button
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Download YAML
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Edit;
