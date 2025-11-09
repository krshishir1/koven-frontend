// CodeEditor.tsx
"use client";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, language }: any) {

  console.log(code, language);

  return (
    <div className="flex-1 h-full pt-3">
      <Editor
        height="100%"
        defaultLanguage={language || "solidity"}
        theme="vs-light"
        value={code}
        onChange={(val) => onChange(val || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
