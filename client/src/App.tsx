import { useState, useRef } from 'react';
import { Search, Pencil, Trash2, Plus, Check, X, ImagePlus } from 'lucide-react';
import { themes, themeList, getInputStyle, type ThemeName } from './styles';
import { formatDate, type Memo } from './types';
import { Modal } from './components/Modal';
import { useMemos } from './hooks/useMemos';

function App() {
  const { memos, addMemo, updateMemo, deleteMemo, uploadImage } = useMemos();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailMemo, setDetailMemo] = useState<Memo | null>(null);
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem('memo-theme') as ThemeName) || 'green'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = themes[theme];
  const inputStyle = getInputStyle(colors);
  const activeThemeItem = themeList.find(t => t.key === theme)!;

  const handleThemeChange = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem('memo-theme', t);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // 新規ファイルがあればnullで初期化しアップロード後に上書き
    // ファイルがなければimagePreview（既存URL or null）をそのまま送る
    let image_url: string | null = imageFile ? null : imagePreview;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    if (editingId) {
      await updateMemo(editingId, title, content, image_url);
    } else {
      await addMemo(title, content, image_url);
    }
    resetForm();
  };

  const handleEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    // 編集開始時はimageFileをnullにリセット — 既存画像はimagePreviewのURLで保持
    setImageFile(null);
    setImagePreview(memo.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('このメモを削除しますか？')) return;
    await deleteMemo(id);
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

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              background: colors.btnSecondary, color: colors.btnSecondaryText,
              border: `1px solid ${colors.cardBorder}`, cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}>
              <ImagePlus size={15} /> 画像を選択
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </label>
            {imagePreview && (
              <>
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  style={{
                    width: 64, height: 64, objectFit: 'cover',
                    borderRadius: 8, border: `1px solid ${colors.cardBorder}`,
                  }}
                />
                <button
                  onClick={handleImageRemove}
                  title="画像を削除"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    background: colors.btnDanger, color: colors.btnDangerText,
                    border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  <X size={13} /> 削除
                </button>
              </>
            )}
          </div>
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
              onClick={resetForm}
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
            <div style={{ overflow: 'hidden', flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
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
                  // 画像がある場合は2行、ない場合は3行でテキストを省略
                  WebkitLineClamp: memo.image_url ? 2 : 3, WebkitBoxOrient: 'vertical',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>
                  {memo.content}
                </p>
              </div>
              {memo.image_url && (
                <img
                  src={memo.image_url}
                  alt="添付画像"
                  style={{
                    width: 64, height: 64, objectFit: 'cover',
                    borderRadius: 6, border: `1px solid ${colors.cardBorder}`,
                    flexShrink: 0,
                  }}
                />
              )}
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
