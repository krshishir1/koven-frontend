"use client";

import { useState, useMemo, useEffect } from "react";
import { useProjectStore } from "@/hooks/stores";
import { useFileStore } from "@/hooks/stores";
import { compileContract, getArtifact, type CompilerResponse, type CompilerError } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompilationOutput {
  errors: CompilerError[];
  warnings: CompilerError[];
  info: CompilerError[];
  success: boolean;
  contractCount: number;
}

export default function CompilerPanel() {
  const { toast } = useToast();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const getProjectFiles = useFileStore((s) => s.getProjectFiles);
  const getProjectMetadata = useFileStore((s) => s.getProjectMetadata);
  const saveCompiledContract = useFileStore((s) => s.saveCompiledContract);
  const artifactIdsByProjectId = useFileStore((s) => s.artifactIdsByProjectId);
  const setProjectFiles = useFileStore((s) => s.setProjectFiles);

  const [selectedFile, setSelectedFile] = useState<string>("");
  const [compilerVersion, setCompilerVersion] = useState<string>("0.8.30+commit.73712a01");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationOutput, setCompilationOutput] = useState<CompilationOutput | null>(null);

  // Get all Solidity files for the active project
  const solidityFiles = useMemo(() => {
    if (!activeProjectId) return [];
    const files = getProjectFiles(activeProjectId);
    return files.filter((file) => file.path.endsWith(".sol"));
  }, [activeProjectId, getProjectFiles]);

  // Get compiler version from metadata if available
  const metadata = useMemo(() => {
    if (!activeProjectId) return null;
    return getProjectMetadata(activeProjectId);
  }, [activeProjectId, getProjectMetadata]);

  // Update compiler version when metadata changes
  useEffect(() => {
    if (metadata?.solidity_version) {
      setCompilerVersion(metadata.solidity_version);
    }
  }, [metadata]);

  // Fetch artifact and update files when projectId or artifactId changes
  useEffect(() => {
    const fetchArtifactFiles = async () => {
      if (!activeProjectId) return;
      
      const artifactId = artifactIdsByProjectId[activeProjectId];
      if (!artifactId) return;

      try {
        const response = await getArtifact(artifactId);
        if (response.ok && response.artifact) {
          // Convert artifact files to BackendFile format
          const backendFiles = response.artifact.files.map((file) => ({
            path: file.path,
            content: file.content,
            sha256: file.sha256 || "",
          }));

          // Convert metadata to ProjectMetadata format
          const projectMetadata = {
            solidity_version: response.artifact.metadata?.solidity_version || "0.8.20",
            license: response.artifact.metadata?.license || "MIT",
            test_framework: response.artifact.metadata?.test_framework || "foundry",
            main_contracts: response.artifact.metadata?.main_contracts || [],
            vulnerabilities_to_check: response.artifact.metadata?.vulnerabilities_to_check || [],
            recommended_compile_cmds: response.artifact.metadata?.recommended_compile_cmds || [],
            dependencies: {
              solidity: response.artifact.metadata?.dependencies?.solidity || [],
              javascript: response.artifact.metadata?.dependencies?.javascript || [],
            },
            notes: response.artifact.metadata?.notes || "",
          };

          // Update fileStore with fetched files
          setProjectFiles(activeProjectId, {
            ok: true,
            artifactId: response.artifact._id,
            files: backendFiles,
            metadata: projectMetadata,
          });
        }
      } catch (error: any) {
        console.error("Error fetching artifact:", error);
        // Don't show toast for background fetch errors
      }
    };

    fetchArtifactFiles();
  }, []);

  const handleCompile = async () => {
    if (!activeProjectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a Solidity file to compile",
        variant: "destructive",
      });
      return;
    }

    setIsCompiling(true);
    setCompilationOutput(null);
    
    try {
      // Get artifactId for the project
      const artifactId = artifactIdsByProjectId[activeProjectId];
      if (!artifactId) {
        toast({
          title: "No artifact ID",
          description: "Project artifact ID not found. Please regenerate the project.",
          variant: "destructive",
        });
        setIsCompiling(false);
        return;
      }
      
      // Get only the selected file
      const allFiles = getProjectFiles(activeProjectId);
      const selectedFileData = allFiles.find((file) => file.path === selectedFile);
      
      if (!selectedFileData) {
        toast({
          title: "File not found",
          description: "The selected file could not be found in the project.",
          variant: "destructive",
        });
        setIsCompiling(false);
        return;
      }
      
      // Build sources map with only the selected file
      // The compiler expects just the filename (not full path) as the key
      const sources: Record<string, string> = {};
      const fileName = selectedFile.split("/").pop() || selectedFile;
      sources[fileName] = selectedFileData.content;

      // Call the compiler API
      const response: CompilerResponse = await compileContract({
        version: compilerVersion,
        sources,
        artifactId,
        settings: {
          optimizer: { enabled: true, runs: 200 },
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
            },
          },
        },
      });

      // Parse compiler output
      const errors: CompilerError[] = [];
      const warnings: CompilerError[] = [];
      const info: CompilerError[] = [];

      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((err) => {
          if (err.severity === "error") {
            errors.push(err);
          } else if (err.severity === "warning") {
            warnings.push(err);
          } else {
            info.push(err);
          }
        });
      }

      // Extract compiled contracts from response
      let contractCount = 0;
      if (response.contracts) {
        const fileName = selectedFile.split("/").pop() || selectedFile;
        
        // Find contracts in the selected file
        const fileContracts = response.contracts[fileName];
        if (fileContracts) {
          // Save each contract found in the file
          for (const [contractName, contractData] of Object.entries(fileContracts)) {
            if (contractData.abi && contractData.evm?.bytecode?.object) {
              saveCompiledContract(activeProjectId, {
                fileName: selectedFile,
                contractName,
                abi: contractData.abi,
                bytecode: contractData.evm.bytecode.object,
                deployedBytecode: contractData.evm.deployedBytecode?.object,
              });
              contractCount++;
            }
          }
        }
      }

      // Set compilation output
      setCompilationOutput({
        errors,
        warnings,
        info,
        success: errors.length === 0 && contractCount > 0,
        contractCount,
      });

      // Show toast notification
      if (errors.length > 0) {
        toast({
          title: "Compilation failed",
          description: `Found ${errors.length} error(s)`,
          variant: "destructive",
        });
      } else if (contractCount > 0) {
        toast({
          title: "Compilation successful",
          description: `Successfully compiled ${contractCount} contract(s)`,
        });
      } else {
        toast({
          title: "No contracts found",
          description: "No contracts were compiled",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Compilation error:", error);
      setCompilationOutput({
        errors: [{
          component: "general",
          severity: "error",
          message: error.message || "An error occurred during compilation",
          type: "Exception",
        }],
        warnings: [],
        info: [],
        success: false,
        contractCount: 0,
      });
      toast({
        title: "Compilation error",
        description: error.message || "An error occurred during compilation",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="p-6 bg-white h-full text-gray-800 space-y-4">
      <h2 className="font-semibold text-lg">SOLIDITY COMPILER</h2>

      <div>
        <label className="text-sm font-medium">SELECT CONTRACT FILE</label>
        <Select value={selectedFile} onValueChange={setSelectedFile}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a Solidity file" />
          </SelectTrigger>
          <SelectContent>
            {solidityFiles.length === 0 ? (
              <SelectItem value="" disabled>
                No Solidity files found
              </SelectItem>
            ) : (
              solidityFiles.map((file) => (
                <SelectItem key={file.path} value={file.path}>
                  {file.path}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">COMPILER</label>
        <input
          value={compilerVersion}
          onChange={(e) => setCompilerVersion(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mt-1"
          placeholder="0.8.30+commit.73712a01"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" /> Include nightly builds
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" /> Auto compile
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" /> Hide warnings
        </label>
      </div>

      <h3 className="font-medium mt-4">Advanced Configurations</h3>

      <button
        onClick={handleCompile}
        disabled={isCompiling || !selectedFile}
        className="w-full bg-secondary text-white rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCompiling ? "Compiling..." : "Compile and Run Script"}
      </button>

      {/* Compilation Output */}
      {compilationOutput && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-sm">Compilation Output</h3>
          <ScrollArea className="h-64 w-full border rounded-md p-3 bg-gray-50">
            <div className="space-y-3">
              {/* Success Message */}
              {compilationOutput.success && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="font-semibold text-green-800">
                    ✓ Compilation successful
                  </div>
                  <div className="text-green-700 mt-1">
                    Compiled {compilationOutput.contractCount} contract(s)
                  </div>
                </div>
              )}

              {/* Errors */}
              {compilationOutput.errors.length > 0 && (
                <div>
                  <div className="font-semibold text-red-800 mb-2">
                    Errors ({compilationOutput.errors.length})
                  </div>
                  <div className="space-y-2">
                    {compilationOutput.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-red-50 border border-red-200 rounded text-sm"
                      >
                        <div className="font-medium text-red-800">
                          {error.type || "Error"}
                        </div>
                        <div className="text-red-700 mt-1 whitespace-pre-wrap">
                          {error.formattedMessage || error.message || "Unknown error"}
                        </div>
                        {error.sourceLocation && (
                          <div className="text-red-600 text-xs mt-1">
                            {error.sourceLocation.file}
                            {error.sourceLocation.line !== undefined && (
                              <> (line {error.sourceLocation.line})</>
                            )}
                            {error.sourceLocation.start !== undefined &&
                              error.sourceLocation.end !== undefined &&
                              error.sourceLocation.line === undefined && (
                                <> (lines {error.sourceLocation.start}-{error.sourceLocation.end})</>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {compilationOutput.warnings.length > 0 && (
                <div>
                  <div className="font-semibold text-yellow-800 mb-2">
                    Warnings ({compilationOutput.warnings.length})
                  </div>
                  <div className="space-y-2">
                    {compilationOutput.warnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm"
                      >
                        <div className="font-medium text-yellow-800">
                          {warning.type || "Warning"}
                        </div>
                        <div className="text-yellow-700 mt-1 whitespace-pre-wrap">
                          {warning.formattedMessage || warning.message || "Unknown warning"}
                        </div>
                        {warning.sourceLocation && (
                          <div className="text-yellow-600 text-xs mt-1">
                            {warning.sourceLocation.file}
                            {warning.sourceLocation.line !== undefined && (
                              <> (line {warning.sourceLocation.line})</>
                            )}
                            {warning.sourceLocation.start !== undefined &&
                              warning.sourceLocation.end !== undefined &&
                              warning.sourceLocation.line === undefined && (
                                <> (lines {warning.sourceLocation.start}-{warning.sourceLocation.end})</>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Messages */}
              {compilationOutput.info.length > 0 && (
                <div>
                  <div className="font-semibold text-blue-800 mb-2">
                    Info ({compilationOutput.info.length})
                  </div>
                  <div className="space-y-2">
                    {compilationOutput.info.map((info, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-blue-50 border border-blue-200 rounded text-sm"
                      >
                        <div className="text-blue-700 whitespace-pre-wrap">
                          {info.formattedMessage || info.message || "Unknown info"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No output message */}
              {compilationOutput.errors.length === 0 &&
                compilationOutput.warnings.length === 0 &&
                compilationOutput.info.length === 0 &&
                !compilationOutput.success && (
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    No compilation output available
                  </div>
                )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
  