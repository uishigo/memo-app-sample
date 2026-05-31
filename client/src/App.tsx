import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { themes, themeList, getInputStyle, type ThemeColors, type ThemeName } from './styles';

const API = 'http://localhost:3001/api';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function Modal({ memo, onClose, colors }: { memo: Memo; onClose: () => void; colors: ThemeColors }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: colors.modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.modalBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 16, padding: 32,
          width: '90%', maxWidth: 700, maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
          boxShadow: colors.modalShadow,
        }}
      >
        <h2 style={{ margin: 0, color: colors.headerText, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{memo.title}</h2>
        <div style={{ fontSize: 12, color: colors.dateText, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span>作成: {formatDate(memo.created_at)}</span>
          {memo.updated_at && memo.updated_at !== memo.created_at && (
            <span>更新: {formatDate(memo.updated_at)}</span>
          )}
        </div>
        <div style={{ overflowY: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', flex: 1, lineHeight: 1.8, color: colors.bodyText }}>{memo.content}</div>
        <button
          onClick={onClose}
          title="閉じる"
          style={{
            alignSelf: 'flex-end', padding: '6px 16px',
            display: 'flex', alignItems: 'center', gap: 4,
            background: colors.btnSecondary, color: colors.btnSecondaryText,
            border: `1px solid ${colors.cardBorder}`, borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}
        >
          <X size={16} /> 閉じる
        </button>
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
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem('memo-theme') as ThemeName) || 'green'
  );

  const colors = themes[theme];
  const inputStyle = getInputStyle(colors);
  const activeThemeItem = themeList.find(t => t.key === theme)!;

  const handleThemeChange = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem('memo-theme', t);
  };

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
    <div style={{ minHeight: '100vh', background: colors.pageBg, padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ color: colors.headerText, margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
          {activeThemeItem.emoji} メモ帳
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: colors.dateText, marginRight: 2 }}>テーマ</span>
          {themeList.map(t => (
            <button
              key={t.key}
              title={t.label}
              onClick={() => handleThemeChange(t.key)}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: themes[t.key].btnPrimary,
                border: theme === t.key
                  ? `2px solid ${colors.headerText}`
                  : `2px solid transparent`,
                outline: theme === t.key ? `2px solid ${colors.cardBorder}` : 'none',
                outlineOffset: 1,
                cursor: 'pointer', padding: 0,
                transition: 'transform 0.1s',
                transform: theme === t.key ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      <p style={{ color: colors.dateText, marginBottom: 28, marginTop: 4, fontSize: 13 }}>あなたのメモを管理しましょう</p>

      <div style={{
        background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
        borderRadius: 14, padding: 24, marginBottom: 32,
        boxShadow: colors.shadow,
      }}>
        <div style={{ position: 'relative', marginBottom: inputStyle.marginBottom }}>
          <input
            placeholder="タイトル"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 50))}
            maxLength={50}
            style={{ ...inputStyle, marginBottom: 0 }}
          />
          <span style={{
            position: 'absolute', right: 10, bottom: 8, fontSize: 11,
            color: title.length >= 45 ? (title.length >= 50 ? '#e53e3e' : '#d97706') : colors.dateText,
          }}>
            {title.length}/50
          </span>
        </div>
        <div style={{ position: 'relative', marginBottom: inputStyle.marginBottom }}>
          <textarea
            placeholder="内容"
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 500))}
            maxLength={500}
            rows={5}
            style={{ ...inputStyle, marginBottom: 0, resize: 'vertical', lineHeight: 1.7 }}
          />
          <span style={{
            position: 'absolute', right: 10, bottom: 8, fontSize: 11,
            color: content.length >= 450 ? (content.length >= 500 ? '#e53e3e' : '#d97706') : colors.dateText,
          }}>
            {content.length}/500
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSubmit}
            title={editingId ? 'メモを更新する' : 'メモを追加する'}
            style={{
              padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 6,
              background: colors.btnPrimary, color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
            }}
          >
            {editingId ? <><Check size={16} /> 更新</> : <><Plus size={16} /> 追加</>}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
              title="編集をキャンセルする"
              style={{
                padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6,
                background: colors.btnSecondary, color: colors.btnSecondaryText,
                border: `1px solid ${colors.cardBorder}`, borderRadius: 8,
                cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}
            >
              <X size={16} /> キャンセル
            </button>
          )}
        </div>
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
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12, padding: 16,
              height: 190, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: colors.cardBg,
              boxShadow: colors.shadow,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h3 style={{
                margin: '0 0 4px', fontSize: 15, fontWeight: 700,
                color: colors.headerText,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {memo.title}
              </h3>
              <div style={{ fontSize: 11, color: colors.dateText, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span>作成: {formatDate(memo.created_at)}</span>
                {memo.updated_at && memo.updated_at !== memo.created_at && (
                  <span>更新: {formatDate(memo.updated_at)}</span>
                )}
              </div>
              <p style={{
                margin: 0, fontSize: 13, color: colors.bodyText,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                whiteSpace: 'pre-wrap', lineHeight: 1.6,
              }}>
                {memo.content}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexShrink: 0 }}>
              <button
                onClick={() => setDetailMemo(memo)}
                title="詳細を表示する"
                style={{
                  flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.btnSecondary, color: colors.btnSecondaryText,
                  border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer',
                }}
              >
                <Search size={15} />
              </button>
              <button
                onClick={() => handleEdit(memo)}
                title="編集する"
                style={{
                  flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.btnSecondary, color: colors.btnSecondaryText,
                  border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer',
                }}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(memo.id)}
                title="削除する"
                style={{
                  flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.btnDanger, color: colors.btnDangerText,
                  border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {detailMemo && <Modal memo={detailMemo} onClose={() => setDetailMemo(null)} colors={colors} />}
    </div>
  );
}

export default App;
