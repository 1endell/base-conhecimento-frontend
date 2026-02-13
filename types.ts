
export enum NoteType {
  FLEETING = 'fleeting',
  LITERATURE = 'literature',
  PERMANENT = 'permanent',
  HUB = 'hub'
}

export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagBrief {
  id: number;
  name: string;
  full_path: string | null;
}

export interface LinkBrief {
  id: number;
  source_id: string;
  target_id: string;
  link_type: string;
  description: string | null;
  created_at: string;
}

export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  note_type: NoteType;
  source_ref: string | null;
  is_pinned: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  tags: TagBrief[];
}

export interface NoteDetail extends NoteResponse {
  outgoing_links: LinkBrief[];
  incoming_links: LinkBrief[];
}

export interface GraphStats {
  total_notes: number;
  total_links: number;
  total_tags: number;
  orphan_count: number;
  notes_by_type: { note_type: NoteType; count: number }[];
  density: number;
  hub_notes: {
    id: string;
    title: string;
    note_type: NoteType;
    incoming_count: number;
    outgoing_count: number;
    total_connections: number;
  }[];
  avg_links_per_note: number;
}

export interface JobStatusResponse {
  id: string;
  filename: string;
  document_type: 'pdf' | 'epub';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at: string | null;
}
