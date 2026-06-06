// APIから取得・送信するメモの形。image_url/author は投稿時に省略可能なため optional
export interface Memo {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  author?: string | null;
  created_at: string;
  updated_at?: string; // 一度も更新されていない場合は undefined になる
}

// ISO 8601 文字列を "YYYY/MM/DD HH:mm" 形式に変換するユーティリティ
export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
