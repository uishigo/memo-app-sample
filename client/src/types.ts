export interface Memo {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  author?: string | null;
  created_at: string;
  updated_at?: string;
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
