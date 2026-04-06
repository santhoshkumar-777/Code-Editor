import React, { useState } from 'react';
import { CodeFolder, FileSystemItem, CodeFile } from '../types';
import { pushWorkspaceToGithub } from '../services/githubService';

interface DeployManagerProps {
  workspace: CodeFolder;
  fileContents: Record<string, string>;
  onStartCreatingItem: (parentId: string | null, type: 'file' | 'folder') => void;
  onCreateItemConfirm: (name: string, parentId: string | null, type: 'file' | 'folder') => void;
  onUpdateFileContent: (id: string, content: string) => void;
  onSelectFile: (id: string) => void;
}

const DeployManager: React.FC<DeployManagerProps> = ({ 
  workspace, 
  fileContents, 
  onStartCreatingItem, 
  onCreateItemConfirm, 
  onUpdateFileContent, 
  onSelectFile 
}) => {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState(workspace.name || 'my-workspace');
  const [commitMessage, setCommitMessage] = useState('Initial commit from Web Editor');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message: string } | null>(null);

  // Helper to extract flat list of files with their relative paths
  const extractFiles = (items: FileSystemItem[], currentPath = ''): { path: string; content: string }[] => {
    let files: { path: string; content: string }[] = [];
    for (const item of items) {
      const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      if (item.type === 'file') {
        files.push({ 
          path: fullPath, 
          content: fileContents[item.id] || '' 
        });
      } else if (item.type === 'folder') {
        files = files.concat(extractFiles(item.children, fullPath));
      }
    }
    return files;
  };

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !repoName) {
      setDeployResult({ success: false, message: 'Token and Repo Name are required.' });
      return;
    }

    setIsDeploying(true);
    setDeployResult(null);

    try {
      const allFiles = extractFiles(workspace.children);
      if (allFiles.length === 0) {
        throw new Error('Workspace is empty. Nothing to push.');
      }

      const repoUrl = await pushWorkspaceToGithub({
        token,
        repoName,
        commitMessage,
        files: allFiles,
      });

      setDeployResult({ success: true, message: `Successfully pushed to ${repoUrl}` });
    } catch (error: any) {
      console.error(error);
      setDeployResult({ success: false, message: error.message || 'An unknown error occurred.' });
    } finally {
      setIsDeploying(false);
    }
  };

  const currentFiles = extractFiles(workspace.children);
  const hasDockerfile = currentFiles.some(f => f.path.toLowerCase() === 'dockerfile');

  const addDockerFiles = () => {
    // Basic Dockerfile for Node/Nginx
    const dockerfileContent = `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    // Wait, the Editor's creation logic expects an async way to create files, 
    // or we can just update the tree. Wait, we don't have direct access to generateId() here easily
    // unless we lift it, but since we have \`onCreateItemConfirm\`, it creates random IDs!
    // However, onCreateItemConfirm adds the item but doesn't instantly give us the ID back.
    // So we can just create a file manually if we emit a custom event or let the user do it.
    // A simpler way: we just trigger \`onStartCreatingItem(null, 'file')\` with "Dockerfile".
    // Wait, we can't seed the content with standard App.js structure easily because it's a synchronous tree update.
    // Let's implement it carefully.
  };

  return (
    <div className="h-full bg-surface flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-1">
          Deploy & Cloud Integrations
        </h2>
        <p className="text-xs text-text-secondary">Push to GitHub or generate Docker configs.</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-8">
        {/* Docker Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <span className="text-xl">🐳</span> Docker Configuration
          </h3>
          <div className="bg-background border border-border rounded-md p-3">
            <p className="text-xs text-text-secondary mb-3">
              {hasDockerfile 
                ? 'Your workspace already contains a Dockerfile.' 
                : 'Generate a standard Dockerfile and docker-compose.yml to instantly containerize your app.'}
            </p>
            {/* We will implement Docker Config Generator manually in App.js or through custom event */}
            <button
               onClick={() => document.dispatchEvent(new CustomEvent('generate-docker-files'))}
               className="w-full bg-surface border border-primary text-primary hover:bg-primary/10 text-xs font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
               disabled={hasDockerfile}
            >
              Generate Docker Configs
            </button>
          </div>
        </div>

        {/* GitHub Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <span className="text-xl">🐙</span> Push to GitHub
          </h3>
          
          <form onSubmit={handlePush} className="bg-background border border-border rounded-md p-3 space-y-3">
            <div>
               <label className="block text-xs font-medium text-text-secondary mb-1">GitHub PAT (Token)</label>
               <input 
                  type="password" 
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="ghp_xxxxxxxxxxxx"
                  required
               />
               <p className="text-[10px] text-text-secondary mt-1">Needs `repo` scope.</p>
            </div>

            <div>
               <label className="block text-xs font-medium text-text-secondary mb-1">Repository Name</label>
               <input 
                  type="text" 
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="my-cool-project"
                  required
               />
            </div>

            <div>
               <label className="block text-xs font-medium text-text-secondary mb-1">Commit Message</label>
               <input 
                  type="text" 
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  required
               />
            </div>

            {deployResult && (
              <div className={`text-xs p-2 rounded border ${deployResult.success ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                {deployResult.message}
              </div>
            )}

            <button
               type="submit"
               disabled={isDeploying || currentFiles.length === 0}
               className="w-full mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeploying ? (
                 <>
                   <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                   <span>Pushing...</span>
                 </>
              ) : 'Commit & Push'}
            </button>
          </form>
        </div>

        {/* Hosting Platforms */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <span className="text-xl">🚀</span> Cloud Hosting
          </h3>
          <div className="bg-background border border-border rounded-md p-3 space-y-3">
            <p className="text-xs text-text-secondary">
              Once your code is pushed to GitHub, you can instantly deploy it for free using these platforms:
            </p>
            
            <a 
               href="https://vercel.com/new" 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full bg-black hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
              Deploy to Vercel
            </a>

            <a 
               href="https://app.netlify.com/start" 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full bg-[#00C7B7] hover:bg-[#00B2A4] text-white text-xs font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              Deploy to Netlify
            </a>

            <a 
               href="https://console.firebase.google.com/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full bg-[#FFCA28] hover:bg-[#FFB300] text-black text-xs font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              Deploy to Firebase
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployManager;
