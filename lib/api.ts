const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    // CRITICAL: This sends the HttpOnly session cookie
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // If the response is a 401 (Unauthorized),
  // return a standard object that our auth store can check.
  if (res.status === 401) {
    return { ok: false, error: "Not authenticated" };
  }

  // If the response is not 'ok' but also not a 401,
  // try to parse the error message from the backend.
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { error: `HTTP error! status: ${res.status}` };
    }
    // Throw an error to be caught by the store's try/catch block
    throw new Error(errorData.error || "An unknown API error occurred");
  }

  // If we're here, the request was successful
  return res.json();
}

export interface CompilerRequest {
  version?: string;
  sources: Record<string, string>;
  settings?: {
    optimizer?: { enabled: boolean; runs: number };
    outputSelection?: Record<string, any>;
  };
  artifactId?: string;
}

export interface CompilerError {
  component?: string;
  errorCode?: string;
  formattedMessage?: string;
  message?: string;
  severity: "error" | "warning" | "info";
  sourceLocation?: {
    file: string;
    start?: number;
    end?: number;
    line?: number;
  };
  type?: string;
}

export interface CompilerResponse {
  errors?: CompilerError[];
  contracts?: Record<string, Record<string, {
    abi?: any[];
    evm?: {
      bytecode?: { object: string };
      deployedBytecode?: { object: string };
    };
  }>>;
}

export async function compileContract(request: CompilerRequest): Promise<CompilerResponse> {
  return fetchWithAuth("/compiler", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export interface ArtifactFile {
  path: string;
  content: string;
  sha256?: string;
  isSolidity?: boolean;
  compilation?: {
    status: string;
    compiledAt?: Date;
    error?: string;
  };
}

export interface ArtifactMetadata {
  solidity_version?: string;
  license?: string;
  test_framework?: string;
  main_contracts?: string[];
  vulnerabilities_to_check?: string[];
  recommended_compile_cmds?: string[];
  dependencies?: {
    solidity?: string[];
    javascript?: string[];
  };
  notes?: string;
}

export interface ArtifactResponse {
  ok: boolean;
  artifact: {
    _id: string;
    files: ArtifactFile[];
    metadata: ArtifactMetadata;
    [key: string]: any;
  };
}

export async function getArtifact(artifactId: string): Promise<ArtifactResponse> {
  return fetchWithAuth(`/api/ai/artifacts/${artifactId}`, {
    method: "GET",
  });
}

export interface AddFileRequest {
  artifactId: string;
  fileName: string;
  content?: string;
}

export interface AddFileResponse {
  message: string;
  file: {
    path: string;
    content: string;
    sha256: string;
    isSolidity: boolean;
    compilation: {
      status: string;
      compiledAt: Date;
      error: string | null;
    };
    deployedContracts: any[];
  };
  totalFiles: number;
}

export async function addFileToArtifact(request: AddFileRequest): Promise<AddFileResponse> {
  return fetchWithAuth("/api/ai/add-file", {
    method: "POST",
    body: JSON.stringify({
      artifactId: request.artifactId,
      fileName: request.fileName,
      content: request.content || "",
    }),
  });
}
