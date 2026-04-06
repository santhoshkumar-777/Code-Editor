export interface GithubPushParams {
  token: string;
  repoName: string;
  commitMessage: string;
  files: { path: string; content: string }[];
}

export const pushWorkspaceToGithub = async ({
  token,
  repoName,
  commitMessage,
  files,
}: GithubPushParams): Promise<string> => {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const get = async (endpoint: string) => {
    const res = await fetch(`https://api.github.com${endpoint}`, { headers });
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
    return res.json();
  };

  const post = async (endpoint: string, body: any) => {
    const res = await fetch(`https://api.github.com${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`POST ${endpoint} failed: ${err.message || res.statusText}`);
    }
    return res.json();
  };

  const patch = async (endpoint: string, body: any) => {
    const res = await fetch(`https://api.github.com${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${res.statusText}`);
    return res.json();
  };

  // 1. Get authenticated user
  const user = await get('/user');
  const owner = user.login;

  // 2. Check if repo exists, create if not
  let repoExists = true;
  try {
    await get(`/repos/${owner}/${repoName}`);
  } catch {
    repoExists = false;
  }

  if (!repoExists) {
    await post('/user/repos', {
      name: repoName,
      private: false,
      auto_init: true,
    });
    // Wait for auto_init to finish
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 3. Get the default branch
  const repoData = await get(`/repos/${owner}/${repoName}`);
  const defaultBranch = repoData.default_branch || 'main';
  
  let refData;
  try {
    refData = await get(`/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`);
  } catch (error) {
    throw new Error(`Could not find branch '${defaultBranch}'. Make sure the repository is initialized.`);
  }
  
  const baseCommitSha = refData.object.sha;
  const branchName = refData.ref;

  // 4. Create blobs for all files
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const blobData = await post(`/repos/${owner}/${repoName}/git/blobs`, {
        content: file.content,
        encoding: 'utf-8',
      });
      return {
        path: file.path,
        mode: '100644', // File mode
        type: 'blob',
        sha: blobData.sha,
      };
    })
  );

  // 5. Create a new tree
  const baseTreeData = await get(`/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseTreeData.tree.sha;

  const newTreeData = await post(`/repos/${owner}/${repoName}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  // 6. Create a commit
  const newCommitData = await post(`/repos/${owner}/${repoName}/git/commits`, {
    message: commitMessage,
    tree: newTreeData.sha,
    parents: [baseCommitSha],
  });

  // 7. Update branch reference
  await patch(`/repos/${owner}/${repoName}/git/${branchName.replace('refs/', '')}`, {
    sha: newCommitData.sha,
    force: true,
  });

  return `https://github.com/${owner}/${repoName}`;
};
