import { supabase } from './supabaseClient';
import { CodeFolder } from '../types';

export const syncWorkspaces = async (workspaces: CodeFolder[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const workspace of workspaces) {
    const { data, error } = await supabase
      .from('workspaces')
      .upsert({
        id: workspace.id,
        user_id: user.id,
        name: workspace.name,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) console.error('Error syncing workspace:', error);
  }
};

export const fetchWorkspacesFromCloud = async (): Promise<CodeFolder[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }

  // Note: This only fetches meta-data. Real content needs file-by-file storage or JSON blob.
  // For the start, we'll store everything in a JSON blob or handle files separately.
  return data.map(ws => ({
    id: ws.id,
    name: ws.name,
    type: 'folder',
    children: [], // Files need separate fetching
  })) as CodeFolder[];
};
