import { useState, useRef } from 'react';
import { Search, Pencil, Trash2, Plus, Check, X, ImagePlus, User, LayoutGrid, List } from 'lucide-react';
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
  const [username, setUsername] = useState(
    () => localStorage.getItem('memo-username') || ''
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (localStorage.getItem('memo-view') as 'grid' | 'list') || 'grid'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = themes[theme];
  const inputStyle = getInputStyle(colors);
  const activeThemeItem = themeList.find(t => t.key === theme)!;

  const handleThemeChange = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem('memo-theme', t);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 20);
    setUsername(val);
    localStorage.setItem('memo-username', val);
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
      await updateMemo(editingId, title, content, image_url, username || null);
    } else {
      await addMemo(title, content, image_url, username || null);
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
          {activeThemeItem.emoji} みんなの掲示板
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 28, marginTop: 4 }}>
        <p style={{ color: colors.dateText, margin: 0, fontSize: 13 }}>誰でも自由に投稿・編集できる掲示板です</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={14} color={colors.dateText} />
          <span style={{ fontSize: 13, color: colors.dateText }}>名前:</span>
          <input
            placeholder="未設定"
            value={username}
            onChange={handleUsernameChange}
            maxLength={20}
            style={{
              padding: '4px 10px', fontSize: 13,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 6, background: colors.cardBg,
              color: colors.bodyText, outline: 'none', width: 130,
            }}
          />
        </div>
      </div>

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{ display: 'flex', border: `1px solid ${colors.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              title={mode === 'grid' ? 'グリッド表示' : 'リスト表示'}
              onClick={() => {
                setViewMode(mode);
                localStorage.setItem('memo-view', mode);
              }}
              style={{
                padding: '6px 12px', display: 'inline-flex', alignItems: 'center',
                background: viewMode === mode ? colors.btnPrimary : colors.cardBg,
                color: viewMode === mode ? '#fff' : colors.btnSecondaryText,
                border: 'none', cursor: 'pointer',
              }}
            >
              {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div style={viewMode === 'grid' ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      } : {
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {memos.map(memo => (
          <div
            key={memo.id}
            style={viewMode === 'grid' ? {
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12, padding: 16,
              height: 240, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: colors.cardBg,
              boxShadow: colors.shadow,
              overflow: 'hidden',
            } : {
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12, padding: '12px 16px',
              height: 100, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column',
              background: colors.cardBg,
              boxShadow: colors.shadow,
              overflow: 'hidden',
            }}
          >
            {viewMode === 'grid' ? (
              <>
                <div style={{ overflow: 'hidden', flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 6px', fontSize: 15, fontWeight: 700,
                      color: colors.headerText,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      background: colors.pageBg,
                      borderRadius: 6, padding: '3px 8px',
                    }}>
                      {memo.title}
                    </h3>
                    <div style={{ fontSize: 11, color: colors.dateText, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ color: memo.author ? colors.btnPrimary : colors.dateText, fontWeight: memo.author ? 600 : 400 }}>
                        👤 {memo.author || '-'}
                      </span>
                      <span>作成: {formatDate(memo.created_at)}</span>
                      <span>更新: {(memo.updated_at && memo.updated_at !== memo.created_at) ? formatDate(memo.updated_at) : '-'}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: '6px 0' }} />
                    <p style={{
                      margin: 0, fontSize: 13, color: colors.bodyText,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: memo.image_url ? 3 : 4, WebkitBoxOrient: 'vertical',
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
                  <button onClick={() => setDetailMemo(memo)} title="詳細を表示する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnSecondary, color: colors.btnSecondaryText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Search size={15} /></button>
                  <button onClick={() => handleEdit(memo)} title="編集する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnSecondary, color: colors.btnSecondaryText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(memo.id)} title="削除する" style={{ flex: 1, padding: '5px 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnDanger, color: colors.btnDangerText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
                {/* 列1: メタ情報 */}
                <div style={{
                  flexShrink: 0, width: 150, fontSize: 11, color: colors.dateText,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
                  paddingRight: 12, borderRight: `1px solid ${colors.cardBorder}`,
                }}>
                  <span style={{ color: memo.author ? colors.btnPrimary : colors.dateText, fontWeight: memo.author ? 600 : 400, whiteSpace: 'nowrap' }}>
                    👤 {memo.author || '-'}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>作成: {formatDate(memo.created_at)}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>更新: {(memo.updated_at && memo.updated_at !== memo.created_at) ? formatDate(memo.updated_at) : '-'}</span>
                </div>
                {/* 列2: タイトル + 区切り線 + 本文 */}
                <div style={{
                  flex: 1, paddingLeft: 12, paddingRight: 12, minWidth: 0,
                  display: 'flex', flexDirection: 'column',
                  borderRight: `1px solid ${colors.cardBorder}`,
                }}>
                  <h3 style={{
                    margin: '0 0 4px', fontSize: 17, fontWeight: 700,
                    color: colors.headerText, textAlign: 'left',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    background: colors.pageBg, borderRadius: 6, padding: '2px 8px',
                  }}>
                    {memo.title}
                  </h3>
                  <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: '0 0 4px' }} />
                  <p style={{
                    flex: 1, margin: 0, fontSize: 12, color: colors.bodyText, textAlign: 'left',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    whiteSpace: 'pre-wrap', lineHeight: 1.6,
                  }}>
                    {memo.content}
                  </p>
                </div>
                {/* 列3: 画像(全高・正方形) */}
                {memo.image_url && (
                  <div style={{
                    flexShrink: 0, paddingLeft: 12,
                    borderRight: `1px solid ${colors.cardBorder}`,
                    display: 'flex', alignItems: 'stretch',
                  }}>
                    <img
                      src={memo.image_url}
                      alt="添付画像"
                      style={{ height: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: 4 }}
                    />
                  </div>
                )}
                {/* 列4: ボタン縦並び */}
                <div style={{
                  flexShrink: 0, paddingLeft: 12,
                  display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center',
                }}>
                  <button onClick={() => setDetailMemo(memo)} title="詳細を表示する" style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnSecondary, color: colors.btnSecondaryText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Search size={14} /></button>
                  <button onClick={() => handleEdit(memo)} title="編集する" style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnSecondary, color: colors.btnSecondaryText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(memo.id)} title="削除する" style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.btnDanger, color: colors.btnDangerText, border: `1px solid ${colors.cardBorder}`, borderRadius: 6, cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {detailMemo && <Modal memo={detailMemo} onClose={() => setDetailMemo(null)} colors={colors} />}
    </div>
  );
}

export default App;
