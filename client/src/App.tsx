import { useState } from 'react';
import { themes, themeList, type ThemeName } from './styles';
import type { Memo } from './types';
import { useMemos } from './hooks/useMemos';
import { useForm } from './hooks/useForm';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { MemoForm } from './components/MemoForm';
import { ViewToggle } from './components/ViewToggle';
import { MemoCard } from './components/MemoCard';

// アプリのルートコンポーネント。全 state と各コンポーネントへの prop 受け渡しを担う
function App() {
  const { memos, addMemo, updateMemo, deleteMemo, uploadImage } = useMemos();
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem('memo-theme') as ThemeName) || 'green'
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem('memo-username') || ''
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (localStorage.getItem('memo-view') as 'grid' | 'list') || 'grid'
  );
  const [detailMemo, setDetailMemo] = useState<Memo | null>(null);

  const colors = themes[theme];
  const form = useForm(addMemo, updateMemo, uploadImage, username);

  const handleThemeChange = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem('memo-theme', t);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 20);
    setUsername(val);
    localStorage.setItem('memo-username', val);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('memo-view', mode);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('このメモを削除しますか？')) return;
    await deleteMemo(id);
  };

  const activeEmoji = themeList.find(t => t.key === theme)!.emoji;

  return (
    <div style={{ minHeight: '100vh', background: colors.pageBg, padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <Header
        theme={theme}
        colors={colors}
        username={username}
        activeEmoji={activeEmoji}
        onThemeChange={handleThemeChange}
        onUsernameChange={handleUsernameChange}
      />
      <MemoForm
        title={form.title}
        content={form.content}
        imagePreview={form.imagePreview}
        editingId={form.editingId}
        fileInputRef={form.fileInputRef}
        colors={colors}
        onTitleChange={form.setTitle}
        onContentChange={form.setContent}
        onImageChange={form.handleImageChange}
        onImageRemove={form.handleImageRemove}
        onSubmit={form.handleSubmit}
        onCancel={form.reset}
      />
      <ViewToggle viewMode={viewMode} colors={colors} onChange={handleViewModeChange} />
      <div style={viewMode === 'grid' ? {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16,
      } : {
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {memos.map(memo => (
          <MemoCard
            key={memo.id}
            memo={memo}
            viewMode={viewMode}
            colors={colors}
            onDetail={() => setDetailMemo(memo)}
            onEdit={() => form.startEdit(memo)}
            onDelete={() => handleDelete(memo.id)}
          />
        ))}
      </div>
      {detailMemo && <Modal memo={detailMemo} onClose={() => setDetailMemo(null)} colors={colors} />}
    </div>
  );
}

export default App;
