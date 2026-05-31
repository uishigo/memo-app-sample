import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Pencil, Trash2, Plus, Check, X } from 'lucide-react';

const API = 'http://localhost:3001/api';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function Modal({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: 32,
          width: '90%', maxWidth: 700, maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>{memo.title}</h2>
        <div style={{ fontSize: 12, color: '#888' }}>{formatDate(memo.created_at)}</div>
        <div style={{ overflowY: 'auto', whiteSpace: 'pre-wrap', flex: 1, lineHeight: 1.7 }}>{memo.content}</div>
        <button onClick={onClose} title="閉じる" style={{ alignSelf: 'flex-end', padding: '6px 14px', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
      </div>
    </div>
  );
}

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailMemo, setDetailMemo] = useState<Memo | null>(null);

  useEffect(() => {
    axios.get<Memo[]>(`${API}/memos`).then(res => setMemos(res.data));
  }, []);

  const fetchMemos = async () => {
    const res = await axios.get<Memo[]>(`${API}/memos`);
    setMemos(res.data);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (editingId) {
      await axios.put(`${API}/memos/${editingId}`, { title, content });
      setEditingId(null);
    } else {
      await axios.post(`${API}/memos`, { title, content });
    }
    setTitle('');
    setContent('');
    fetchMemos();
  };

  const handleEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('このメモを削除しますか？')) return;
    await axios.delete(`${API}/memos/${id}`);
    fetchMemos();
  };

  return (
    <div style={{ padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <h1>📝 メモ帳</h1>

      <div style={{ marginBottom: 32 }}>
        <input
          placeholder="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: '10px 12px', fontSize: 16, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="内容"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button onClick={handleSubmit} title={editingId ? 'メモを更新する' : 'メモを追加する'} style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center' }}>
          {editingId ? <Check size={18} /> : <Plus size={18} />}
        </button>
        {editingId && (
          <button
            onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
            title="編集をキャンセルする"
            style={{ marginLeft: 10, padding: '8px 16px', display: 'inline-flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {memos.map(memo => (
          <div
            key={memo.id}
            style={{
              border: '1px solid #ddd', borderRadius: 10, padding: 16,
              height: 180, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: '#fafafa',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {memo.title}
              </h3>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{formatDate(memo.created_at)}</div>
              <p style={{
                margin: 0, fontSize: 13, color: '#444',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                whiteSpace: 'pre-wrap',
              }}>
                {memo.content}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexShrink: 0 }}>
              <button onClick={() => setDetailMemo(memo)} title="詳細を表示する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Search size={16} /></button>
              <button onClick={() => handleEdit(memo)} title="編集する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(memo.id)} title="削除する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {detailMemo && <Modal memo={detailMemo} onClose={() => setDetailMemo(null)} />}
    </div>
  );
}

export default App;
