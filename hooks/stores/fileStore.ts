import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Backend response structure
export interface BackendFile {
  path: string
  content: string
  sha256: string
}

export interface ProjectMetadata {
  solidity_version: string
  license: string
  test_framework: string
  main_contracts: string[]
  vulnerabilities_to_check: string[]
  recommended_compile_cmds: string[]
  dependencies: {
    solidity: string[]
    javascript: string[]
  }
  notes: string
}

export interface BackendResponse {
  ok: boolean
  artifactId: string
  files: BackendFile[]
  metadata: ProjectMetadata
}

// File tree structure for UI
export interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  content?: string
  sha256?: string
  children?: FileNode[]
}

interface FileState {
  // Store files by project ID
  filesByProjectId: Record<string, BackendFile[]>
  metadataByProjectId: Record<string, ProjectMetadata>
  artifactIdsByProjectId: Record<string, string>
  
  // Selected file for viewing
  selectedFilePath: string | null
  selectedProjectId: string | null

  // Actions
  setProjectFiles: (projectId: string, response: BackendResponse) => void
  fetchProjectFiles: (projectId: string, idea: string) => Promise<void>
  updateFile: (projectId: string, filePath: string, content: string) => void
  addFile: (projectId: string, filePath: string, content: string) => void
  deleteFile: (projectId: string, filePath: string) => void
  getProjectFiles: (projectId: string) => BackendFile[]
  getProjectMetadata: (projectId: string) => ProjectMetadata | null
  getFileTree: (projectId: string) => FileNode | null
  getFileByPath: (projectId: string, filePath: string) => BackendFile | null
  setSelectedFile: (projectId: string | null, filePath: string | null) => void
  clearProjectFiles: (projectId: string) => void
  getSampleFileTree: () => FileNode | null
  getSampleFileByPath: (filePath: string) => BackendFile | null
}

// Helper function to convert flat file array to tree structure
function buildFileTree(files: BackendFile[]): FileNode | null {
  if (files.length === 0) return null

  const root: FileNode = {
    name: "root",
    type: "folder",
    path: "",
    children: [],
  }

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean)
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const currentPath = parts.slice(0, i + 1).join("/")

      if (isLast) {
        // It's a file
        const fileNode: FileNode = {
          name: part,
          type: "file",
          path: file.path,
          content: file.content,
          sha256: file.sha256,
        }
        if (!current.children) {
          current.children = []
        }
        current.children.push(fileNode)
      } else {
        // It's a folder
        let folder = current.children?.find(
          (child) => child.name === part && child.type === "folder"
        )

        if (!folder) {
          folder = {
            name: part,
            type: "folder",
            path: currentPath,
            children: [],
          }
          if (!current.children) {
            current.children = []
          }
          current.children.push(folder)
        }

        current = folder
      }
    }
  }

  // If root has only one child and it's a folder, return that instead
  if (root.children?.length === 1 && root.children[0].type === "folder") {
    return root.children[0]
  }

  return root
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      filesByProjectId: {},
      metadataByProjectId: {},
      artifactIdsByProjectId: {},
      selectedFilePath: null,
      selectedProjectId: null,

      setProjectFiles: (projectId, response) => {
        if (!response.ok || !response.files) {
          console.error("Invalid backend response:", response)
          return
        }

        set((state) => ({
          filesByProjectId: {
            ...state.filesByProjectId,
            [projectId]: response.files,
          },
          metadataByProjectId: {
            ...state.metadataByProjectId,
            [projectId]: response.metadata,
          },
          artifactIdsByProjectId: {
            ...state.artifactIdsByProjectId,
            [projectId]: response.artifactId,
          },
        }))
      },

      fetchProjectFiles: async (projectId, idea) => {
        try {
          // TODO: Replace with actual backend API endpoint
          // For now, using a mock implementation
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          
          const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idea }),
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch files: ${response.statusText}`)
          }

          const data: BackendResponse = await response.json()
          get().setProjectFiles(projectId, data)
        } catch (error) {
          console.error("Error fetching project files:", error)
          // For development, use sample data if API fails
          const sampleData: BackendResponse = {
            ok: true,
            artifactId: `artifact_${Date.now()}`,
            files: [
              {
                path: "contracts/MyToken.sol",
                content: "// Smart contract code will be generated here",
                sha256: "",
              },
            ],
            metadata: {
              solidity_version: "0.8.20",
              license: "MIT",
              test_framework: "hardhat",
              main_contracts: ["MyToken"],
              vulnerabilities_to_check: [
                "reentrancy",
                "access-control",
                "unchecked-call",
                "integer-overflow-underflow",
              ],
              recommended_compile_cmds: [
                "npm install",
                "npx hardhat compile",
                "npx hardhat test",
              ],
              dependencies: {
                solidity: ["@openzeppelin/contracts@>=5.0.0"],
                javascript: ["hardhat", "ethers", "chai"],
              },
              notes: "Project files will be generated based on your idea.",
            },
          }
          get().setProjectFiles(projectId, sampleData)
        }
      },

      updateFile: (projectId, filePath, content) => {
        set((state) => {
          const files = state.filesByProjectId[projectId] || []
          const updatedFiles = files.map((file) =>
            file.path === filePath
              ? { ...file, content, sha256: "" } // Clear sha256 when content changes
              : file
          )

          return {
            filesByProjectId: {
              ...state.filesByProjectId,
              [projectId]: updatedFiles,
            },
          }
        })
      },

      addFile: (projectId, filePath, content) => {
        set((state) => {
          const files = state.filesByProjectId[projectId] || []
          const newFile: BackendFile = {
            path: filePath,
            content,
            sha256: "",
          }

          // Check if file already exists
          if (files.some((f) => f.path === filePath)) {
            return state // File already exists, use updateFile instead
          }

          return {
            filesByProjectId: {
              ...state.filesByProjectId,
              [projectId]: [...files, newFile],
            },
          }
        })
      },

      deleteFile: (projectId, filePath) => {
        set((state) => {
          const files = state.filesByProjectId[projectId] || []
          const filteredFiles = files.filter((file) => file.path !== filePath)

          // Clear selected file if it was deleted
          const newSelectedPath =
            state.selectedFilePath === filePath ? null : state.selectedFilePath

          return {
            filesByProjectId: {
              ...state.filesByProjectId,
              [projectId]: filteredFiles,
            },
            selectedFilePath: newSelectedPath,
          }
        })
      },

      getProjectFiles: (projectId) => {
        return get().filesByProjectId[projectId] || []
      },

      getProjectMetadata: (projectId) => {
        return get().metadataByProjectId[projectId] || null
      },

      getFileTree: (projectId) => {
        const files = get().filesByProjectId[projectId] || []
        return buildFileTree(files)
      },

      getSampleFileTree: () => {
        // Sample data from sample.json for testing
        const sampleFiles: BackendFile[] = [
          {
            path: "contracts/MyToken.sol",
            content: "// SPDX-License-Identifier: MIT\npragma solidity 0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\nimport \"@openzeppelin/contracts/utils/Context.sol\";\n\n/**\n * @title MyToken\n * @dev An ERC20 token with minting and burning capabilities, controlled by an owner.\n * This token starts with a zero supply and tokens are minted by the owner.\n */\ncontract MyToken is ERC20, Ownable {\n    /**\n     * @dev Initializes the contract by setting a name and a symbol for the token,\n     * and assigning the `initialOwner` as the owner of the contract.\n     * The total supply starts at 0.\n     * @param name_ The name of the token.\n     * @param symbol_ The symbol of the token.\n     * @param initialOwner_ The address that will initially own the contract.\n     */\n    constructor(\n        string memory name_,\n        string memory symbol_,\n        address initialOwner_\n    ) ERC20(name_, symbol_) Ownable(initialOwner_) {}\n\n    /**\n     * @dev Mints `amount` tokens and sends them to `to`.\n     * Only the contract owner can call this function.\n     * @param to The address that will receive the minted tokens.\n     * @param amount The amount of tokens to mint.\n     */\n    function mint(address to, uint256 amount) public onlyOwner {\n        _mint(to, amount);\n    }\n\n    /**\n     * @dev Burns `amount` tokens from `account`.\n     * Only the contract owner can call this function.\n     * Requires that `account` has at least `amount` tokens.\n     * @param account The address from which tokens will be burned.\n     * @param amount The amount of tokens to burn.\n     */\n    function burn(address account, uint256 amount) public onlyOwner {\n        _burn(account, amount);\n    }\n\n    /**\n     * @dev See {ERC20-_update}.\n     * ERC20 _update hook for future upgrades or custom logic.\n     */\n    function _update(address from, address to, uint256 amount) internal virtual override {\n        super._update(from, to, amount);\n    }\n}\n",
            sha256: "f1bd3f3ee4b0353ff047d4cf204b0b51c4fea017d111e9395d23723fe26b342d",
          },
          {
            path: "scripts/deploy.js",
            content: "const { ethers } = require(\"hardhat\");\n\nasync function main() {\n  const [deployer] = await ethers.getSigners();\n\n  console.log(\"Deploying contracts with the account:\", deployer.address);\n\n  const initialSupply = ethers.parseUnits(\"1000\", 18); // Example: 1000 tokens with 18 decimals\n  const Token = await ethers.getContractFactory(\"MyToken\");\n  const myToken = await Token.deploy(\"MyAwesomeToken\", \"MAT\", deployer.address);\n\n  await myToken.waitForDeployment();\n\n  const tokenAddress = await myToken.getAddress();\n  console.log(\"MyToken deployed to:\", tokenAddress);\n\n  // Optionally mint some initial tokens to the deployer\n  // await myToken.mint(deployer.address, initialSupply);\n  // console.log(`Minted ${ethers.formatUnits(initialSupply, 18)} MAT to deployer (${deployer.address})`);\n  // console.log(\"Deployer balance after optional initial mint:\", ethers.formatUnits(await myToken.balanceOf(deployer.address), 18));\n}\n\nmain()\n  .then(() => process.exit(0))\n  .catch((error) => {\n    console.error(error);\n    process.exit(1);\n  });\n",
            sha256: "39642bf1d9b63887262f0f8587b0088664d45215aee072441913afcbc5232400",
          },
          {
            path: "test/MyToken.test.js",
            content: "const { expect } = require(\"chai\");\nconst { ethers } = require(\"hardhat\");\nconst { loadFixture } = require(\"@nomicfoundation/hardhat-network-helpers\");\n\ndescribe(\"MyToken\", function () {\n  async function deployTokenFixture() {\n    const [owner, addr1, addr2] = await ethers.getSigners();\n    const MyToken = await ethers.getContractFactory(\"MyToken\");\n    const myToken = await MyToken.deploy(\"MyAwesomeToken\", \"MAT\", owner.address);\n    await myToken.waitForDeployment();\n    return { myToken, owner, addr1, addr2 };\n  }\n\n  it(\"Should set the right owner\", async function () {\n    const { myToken, owner } = await loadFixture(deployTokenFixture);\n    expect(await myToken.owner()).to.equal(owner.address);\n  });\n\n  it(\"Should have an initial total supply of 0\", async function () {\n    const { myToken } = await loadFixture(deployTokenFixture);\n    expect(await myToken.totalSupply()).to.equal(0);\n  });\n\n  it(\"Owner should be able to mint tokens\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"100\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.totalSupply()).to.equal(mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n  });\n\n  it(\"Non-owner should not be able to mint tokens\", async function () {\n    const { myToken, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"50\", 18);\n    await expect(myToken.connect(addr1).mint(addr2.address, mintAmount))\n      .to.be.revertedWithCustomError(myToken, \"OwnableUnauthorizedAccount\")\n      .withArgs(addr1.address);\n  });\n\n  it(\"Owner should be able to burn tokens from an account\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"200\", 18);\n    const burnAmount = ethers.parseUnits(\"50\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n    await myToken.burn(addr1.address, burnAmount);\n    expect(await myToken.totalSupply()).to.equal(mintAmount - burnAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount - burnAmount);\n  });\n\n  it(\"Non-owner should not be able to burn tokens\", async function () {\n    const { myToken, addr1 } = await loadFixture(deployTokenFixture);\n    const burnAmount = ethers.parseUnits(\"10\", 18);\n    await expect(myToken.connect(addr1).burn(addr1.address, burnAmount))\n      .to.be.revertedWithCustomError(myToken, \"OwnableUnauthorizedAccount\")\n      .withArgs(addr1.address);\n  });\n\n  it(\"Should revert if burning more than account balance\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"100\", 18);\n    const excessiveBurnAmount = ethers.parseUnits(\"150\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    await expect(myToken.burn(addr1.address, excessiveBurnAmount))\n      .to.be.revertedWith(\"ERC20: burn amount exceeds balance\");\n  });\n\n  it(\"Should allow transfers between accounts\", async function () {\n    const { myToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"200\", 18);\n    const transferAmount = ethers.parseUnits(\"50\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n    await myToken.connect(addr1).transfer(addr2.address, transferAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount - transferAmount);\n    expect(await myToken.balanceOf(addr2.address)).to.equal(transferAmount);\n  });\n\n  it(\"Should revert if sender doesn't have enough tokens for transfer\", async function () {\n    const { myToken, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const initialBalance = ethers.parseUnits(\"10\", 18);\n    const excessiveTransferAmount = ethers.parseUnits(\"100\", 18);\n    await myToken.mint(addr1.address, initialBalance);\n    await expect(myToken.connect(addr1).transfer(addr2.address, excessiveTransferAmount))\n      .to.be.revertedWith(\"ERC20: transfer amount exceeds balance\");\n  });\n});\n",
            sha256: "dbb92695aeef2587203521188e0d44b49c01bd0ba2fd9b089259159222c2149e",
          },
          {
            path: "hardhat.config.js",
            content: "require(\"@nomicfoundation/hardhat-toolbox\");\n\n/** @type import('hardhat/config').HardhatUserConfig */\nmodule.exports = {\n  solidity: \"0.8.20\",\n  networks: {\n    hardhat: {\n      chainId: 31337\n    }\n  }\n};\n",
            sha256: "117f7483eb4a0f970d30db9b7e48e1a70d651b7c8b6b66105670f0cd9313643a",
          },
          {
            path: "package.json",
            content: "{\n  \"name\": \"my-erc20-token\",\n  \"version\": \"1.0.0\",\n  \"description\": \"An ERC20 token with mint and burn functionalities.\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"npx hardhat test\",\n    \"deploy\": \"npx hardhat run scripts/deploy.js --network localhost\",\n    \"compile\": \"npx hardhat compile\"\n  },\n  \"keywords\": [\"ERC20\", \"Solidity\", \"Hardhat\", \"OpenZeppelin\"],\n  \"author\": \"Your Name/Organization\",\n  \"license\": \"MIT\",\n  \"devDependencies\": {\n    \"@nomicfoundation/hardhat-toolbox\": \"^4.0.0\",\n    \"hardhat\": \"^2.19.1\"\n  },\n  \"dependencies\": {\n    \"@openzeppelin/contracts\": \"^5.0.0\"\n  }\n}\n",
            sha256: "a14adb40922e32ace81bd51e74f4b1c1a9f482123bd7a9bce7a5698dc6861fc7",
          },
        ]
        return buildFileTree(sampleFiles)
      },

      getSampleFileByPath: (filePath: string) => {
        const sampleFiles: BackendFile[] = [
          {
            path: "contracts/MyToken.sol",
            content: "// SPDX-License-Identifier: MIT\npragma solidity 0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\nimport \"@openzeppelin/contracts/utils/Context.sol\";\n\n/**\n * @title MyToken\n * @dev An ERC20 token with minting and burning capabilities, controlled by an owner.\n * This token starts with a zero supply and tokens are minted by the owner.\n */\ncontract MyToken is ERC20, Ownable {\n    /**\n     * @dev Initializes the contract by setting a name and a symbol for the token,\n     * and assigning the `initialOwner` as the owner of the contract.\n     * The total supply starts at 0.\n     * @param name_ The name of the token.\n     * @param symbol_ The symbol of the token.\n     * @param initialOwner_ The address that will initially own the contract.\n     */\n    constructor(\n        string memory name_,\n        string memory symbol_,\n        address initialOwner_\n    ) ERC20(name_, symbol_) Ownable(initialOwner_) {}\n\n    /**\n     * @dev Mints `amount` tokens and sends them to `to`.\n     * Only the contract owner can call this function.\n     * @param to The address that will receive the minted tokens.\n     * @param amount The amount of tokens to mint.\n     */\n    function mint(address to, uint256 amount) public onlyOwner {\n        _mint(to, amount);\n    }\n\n    /**\n     * @dev Burns `amount` tokens from `account`.\n     * Only the contract owner can call this function.\n     * Requires that `account` has at least `amount` tokens.\n     * @param account The address from which tokens will be burned.\n     * @param amount The amount of tokens to burn.\n     */\n    function burn(address account, uint256 amount) public onlyOwner {\n        _burn(account, amount);\n    }\n\n    /**\n     * @dev See {ERC20-_update}.\n     * ERC20 _update hook for future upgrades or custom logic.\n     */\n    function _update(address from, address to, uint256 amount) internal virtual override {\n        super._update(from, to, amount);\n    }\n}\n",
            sha256: "f1bd3f3ee4b0353ff047d4cf204b0b51c4fea017d111e9395d23723fe26b342d",
          },
          {
            path: "scripts/deploy.js",
            content: "const { ethers } = require(\"hardhat\");\n\nasync function main() {\n  const [deployer] = await ethers.getSigners();\n\n  console.log(\"Deploying contracts with the account:\", deployer.address);\n\n  const initialSupply = ethers.parseUnits(\"1000\", 18); // Example: 1000 tokens with 18 decimals\n  const Token = await ethers.getContractFactory(\"MyToken\");\n  const myToken = await Token.deploy(\"MyAwesomeToken\", \"MAT\", deployer.address);\n\n  await myToken.waitForDeployment();\n\n  const tokenAddress = await myToken.getAddress();\n  console.log(\"MyToken deployed to:\", tokenAddress);\n\n  // Optionally mint some initial tokens to the deployer\n  // await myToken.mint(deployer.address, initialSupply);\n  // console.log(`Minted ${ethers.formatUnits(initialSupply, 18)} MAT to deployer (${deployer.address})`);\n  // console.log(\"Deployer balance after optional initial mint:\", ethers.formatUnits(await myToken.balanceOf(deployer.address), 18));\n}\n\nmain()\n  .then(() => process.exit(0))\n  .catch((error) => {\n    console.error(error);\n    process.exit(1);\n  });\n",
            sha256: "39642bf1d9b63887262f0f8587b0088664d45215aee072441913afcbc5232400",
          },
          {
            path: "test/MyToken.test.js",
            content: "const { expect } = require(\"chai\");\nconst { ethers } = require(\"hardhat\");\nconst { loadFixture } = require(\"@nomicfoundation/hardhat-network-helpers\");\n\ndescribe(\"MyToken\", function () {\n  async function deployTokenFixture() {\n    const [owner, addr1, addr2] = await ethers.getSigners();\n    const MyToken = await ethers.getContractFactory(\"MyToken\");\n    const myToken = await MyToken.deploy(\"MyAwesomeToken\", \"MAT\", owner.address);\n    await myToken.waitForDeployment();\n    return { myToken, owner, addr1, addr2 };\n  }\n\n  it(\"Should set the right owner\", async function () {\n    const { myToken, owner } = await loadFixture(deployTokenFixture);\n    expect(await myToken.owner()).to.equal(owner.address);\n  });\n\n  it(\"Should have an initial total supply of 0\", async function () {\n    const { myToken } = await loadFixture(deployTokenFixture);\n    expect(await myToken.totalSupply()).to.equal(0);\n  });\n\n  it(\"Owner should be able to mint tokens\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"100\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.totalSupply()).to.equal(mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n  });\n\n  it(\"Non-owner should not be able to mint tokens\", async function () {\n    const { myToken, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"50\", 18);\n    await expect(myToken.connect(addr1).mint(addr2.address, mintAmount))\n      .to.be.revertedWithCustomError(myToken, \"OwnableUnauthorizedAccount\")\n      .withArgs(addr1.address);\n  });\n\n  it(\"Owner should be able to burn tokens from an account\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"200\", 18);\n    const burnAmount = ethers.parseUnits(\"50\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n    await myToken.burn(addr1.address, burnAmount);\n    expect(await myToken.totalSupply()).to.equal(mintAmount - burnAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount - burnAmount);\n  });\n\n  it(\"Non-owner should not be able to burn tokens\", async function () {\n    const { myToken, addr1 } = await loadFixture(deployTokenFixture);\n    const burnAmount = ethers.parseUnits(\"10\", 18);\n    await expect(myToken.connect(addr1).burn(addr1.address, burnAmount))\n      .to.be.revertedWithCustomError(myToken, \"OwnableUnauthorizedAccount\")\n      .withArgs(addr1.address);\n  });\n\n  it(\"Should revert if burning more than account balance\", async function () {\n    const { myToken, owner, addr1 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"100\", 18);\n    const excessiveBurnAmount = ethers.parseUnits(\"150\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    await expect(myToken.burn(addr1.address, excessiveBurnAmount))\n      .to.be.revertedWith(\"ERC20: burn amount exceeds balance\");\n  });\n\n  it(\"Should allow transfers between accounts\", async function () {\n    const { myToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const mintAmount = ethers.parseUnits(\"200\", 18);\n    const transferAmount = ethers.parseUnits(\"50\", 18);\n    await myToken.mint(addr1.address, mintAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);\n    await myToken.connect(addr1).transfer(addr2.address, transferAmount);\n    expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount - transferAmount);\n    expect(await myToken.balanceOf(addr2.address)).to.equal(transferAmount);\n  });\n\n  it(\"Should revert if sender doesn't have enough tokens for transfer\", async function () {\n    const { myToken, addr1, addr2 } = await loadFixture(deployTokenFixture);\n    const initialBalance = ethers.parseUnits(\"10\", 18);\n    const excessiveTransferAmount = ethers.parseUnits(\"100\", 18);\n    await myToken.mint(addr1.address, initialBalance);\n    await expect(myToken.connect(addr1).transfer(addr2.address, excessiveTransferAmount))\n      .to.be.revertedWith(\"ERC20: transfer amount exceeds balance\");\n  });\n});\n",
            sha256: "dbb92695aeef2587203521188e0d44b49c01bd0ba2fd9b089259159222c2149e",
          },
          {
            path: "hardhat.config.js",
            content: "require(\"@nomicfoundation/hardhat-toolbox\");\n\n/** @type import('hardhat/config').HardhatUserConfig */\nmodule.exports = {\n  solidity: \"0.8.20\",\n  networks: {\n    hardhat: {\n      chainId: 31337\n    }\n  }\n};\n",
            sha256: "117f7483eb4a0f970d30db9b7e48e1a70d651b7c8b6b66105670f0cd9313643a",
          },
          {
            path: "package.json",
            content: "{\n  \"name\": \"my-erc20-token\",\n  \"version\": \"1.0.0\",\n  \"description\": \"An ERC20 token with mint and burn functionalities.\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"npx hardhat test\",\n    \"deploy\": \"npx hardhat run scripts/deploy.js --network localhost\",\n    \"compile\": \"npx hardhat compile\"\n  },\n  \"keywords\": [\"ERC20\", \"Solidity\", \"Hardhat\", \"OpenZeppelin\"],\n  \"author\": \"Your Name/Organization\",\n  \"license\": \"MIT\",\n  \"devDependencies\": {\n    \"@nomicfoundation/hardhat-toolbox\": \"^4.0.0\",\n    \"hardhat\": \"^2.19.1\"\n  },\n  \"dependencies\": {\n    \"@openzeppelin/contracts\": \"^5.0.0\"\n  }\n}\n",
            sha256: "a14adb40922e32ace81bd51e74f4b1c1a9f482123bd7a9bce7a5698dc6861fc7",
          },
        ]
        return sampleFiles.find((f) => f.path === filePath) || null
      },

      getFileByPath: (projectId, filePath) => {
        const files = get().filesByProjectId[projectId] || []
        return files.find((file) => file.path === filePath) || null
      },

      setSelectedFile: (projectId: string | null, filePath: string | null) => {
        set({
          selectedProjectId: projectId,
          selectedFilePath: filePath,
        })
      },

      // Helper to set selected file without projectId (for sample data)
      setSelectedFilePath: (filePath) => {
        set({
          selectedFilePath: filePath,
          selectedProjectId: null,
        })
      },

      clearProjectFiles: (projectId) => {
        set((state) => {
          const {
            [projectId]: removedFiles,
            ...remainingFiles
          } = state.filesByProjectId
          const {
            [projectId]: removedMetadata,
            ...remainingMetadata
          } = state.metadataByProjectId
          const {
            [projectId]: removedArtifactId,
            ...remainingArtifactIds
          } = state.artifactIdsByProjectId

          return {
            filesByProjectId: remainingFiles,
            metadataByProjectId: remainingMetadata,
            artifactIdsByProjectId: remainingArtifactIds,
            selectedFilePath:
              state.selectedProjectId === projectId
                ? null
                : state.selectedFilePath,
            selectedProjectId:
              state.selectedProjectId === projectId
                ? null
                : state.selectedProjectId,
          }
        })
      },
    }),
    {
      name: "file-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filesByProjectId: state.filesByProjectId,
        metadataByProjectId: state.metadataByProjectId,
        artifactIdsByProjectId: state.artifactIdsByProjectId,
        selectedFilePath: state.selectedFilePath,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
)

