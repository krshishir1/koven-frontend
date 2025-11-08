// pages/preview.jsx
"use client";

import { useState } from "react";
import FileExplorer from "./FileExplorer";
import CodeViewer from "./CodeViewer";

const fileTree = {
  name: "src",
  type: "folder",
  children: [
    {
      name: "components",
      type: "folder",
      children: [
        {
          name: "Button.tsx",
          type: "file",
          content: "export const Button = () => <button>Click</button>;",
        },
      ],
    },
    {
      name: "App.tsx",
      type: "file",
      content:
        "import { Button } from './components/Button';\n\nexport default function App() {\n  return <Button />;\n}",
    },
  ],
} as const;

export default function Preview() {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  return (
    <div className="relative border border-gray-200 rounded-lg w-full h-full shadow-sm bg-white overflow-auto md:overflow-hidden">
      <div className="flex min-w-[800px] h-full">
        {/* Sidebar */}
        <div className="w-64 min-w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-3 text-sm">
          <FileExplorer node={fileTree as any} onSelect={(f: any) => setSelectedFile(f)} />
        </div>

        {/* Code View */}
        <div className="flex-1 p-3 overflow-auto">
          <CodeViewer file={selectedFile} />
        </div>
      </div>
    </div>
  );
}
