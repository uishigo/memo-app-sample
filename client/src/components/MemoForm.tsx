import { Check, X, Plus, ImagePlus } from 'lucide-react';
import type { RefObject } from 'react';
import { getInputStyle, type ThemeColors } from '../styles';

// MemoForm に渡すプロパティ。フォームの値・ref・各操作のコールバックを含む
interface Props {
  title: string;
  content: string;
  imagePreview: string | null;
  editingId: number | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  colors: ThemeColors;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// メモの新規追加・編集に使うフォームカード。editingId が null のとき新規追加モード
export function MemoForm({
  title, content, imagePreview, editingId, fileInputRef, colors,
  onTitleChange, onContentChange, onImageChange, onImageRemove, onSubmit, onCancel,
}: Props) {
  const inputStyle = getInputStyle(colors);
  const mb = inputStyle.marginBottom;

  return (
    <div style={{
      background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
      borderRadius: 14, padding: 24, marginBottom: 32, boxShadow: colors.shadow,
    }}>
      <div style={{ position: 'relative', marginBottom: mb }}>
        <input
          placeholder="タイトル"
          value={title}
          onChange={e => onTitleChange(e.target.value.slice(0, 50))}
          maxLength={50}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
        {/* 残り文字数: 90%超で橙、上限到達で赤 */}
        <span style={{
          position: 'absolute', right: 10, bottom: 8, fontSize: 11,
          color: title.length >= 45 ? (title.length >= 50 ? '#e53e3e' : '#d97706') : colors.dateText,
        }}>
          {title.length}/50
        </span>
      </div>
      <div style={{ position: 'relative', marginBottom: mb }}>
        <textarea
          placeholder="内容"
          value={content}
          onChange={e => onContentChange(e.target.value.slice(0, 500))}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {/* label でラップすることで、クリック時に hidden の input[file] を直接起動できる */}
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          background: colors.btnSecondary, color: colors.btnSecondaryText,
          border: `1px solid ${colors.cardBorder}`, cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
        }}>
          <ImagePlus size={15} /> 画像を選択
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageChange} />
        </label>
        {imagePreview && (
          <>
            <img src={imagePreview} alt="プレビュー" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1px solid ${colors.cardBorder}` }} />
            <button
              onClick={onImageRemove}
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

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onSubmit}
          title={editingId ? 'メモを更新する' : 'メモを追加する'}
          style={{
            padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 6,
            background: colors.btnPrimary, color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
        >
          {editingId ? <><Check size={16} /> 更新</> : <><Plus size={16} /> 追加</>}
        </button>
        {editingId && (
          <button
            onClick={onCancel}
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
  );
}
