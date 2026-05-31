import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

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
    await axios.delete(`${API}/memos/${id}`);
    fetchMemos();
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>📝 メモ帳</h1>

      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        <textarea
          placeholder="内容"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        <button onClick={handleSubmit}>
          {editingId ? '更新' : '追加'}
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setTitle(''); setContent(''); }} style={{ marginLeft: 8 }}>
            キャンセル
          </button>
        )}
      </div>

      {memos.map(memo => (
        <div key={memo.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 8px' }}>{memo.title}</h3>
          <p style={{ margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{memo.content}</p>
          <button onClick={() => handleEdit(memo)} style={{ marginRight: 8 }}>編集</button>
          <button onClick={() => handleDelete(memo.id)}>削除</button>
        </div>
      ))}
    </div>
  );
}

export default App;
