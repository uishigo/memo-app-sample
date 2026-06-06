import { Search, Pencil, Trash2 } from 'lucide-react';
import type { ThemeColors } from '../styles';
import { formatDate, type Memo } from '../types';

// MemoCard に渡すプロパティ。表示モード・カラー・各アクションのコールバックを含む
interface Props {
  memo: Memo;
  viewMode: 'grid' | 'list';
  colors: ThemeColors;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// 詳細・編集・削除の3ボタンをまとめた内部コンポーネント。
// vertical=true のときリスト表示用に縦並び・固定幅、false のときグリッド表示用に横並び・均等幅になる
function ActionButtons({ colors, onDetail, onEdit, onDelete, vertical = false }: {
  colors: ThemeColors;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  vertical?: boolean;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, cursor: 'pointer', border: `1px solid ${colors.cardBorder}`,
  };
  const btnSize = vertical ? { padding: '5px 8px' } : { flex: 1, padding: '5px 0' } as React.CSSProperties;
  const iconSize = vertical ? 14 : 15;
  return (
    <div style={vertical
      ? { flexShrink: 0, paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }
      : { display: 'flex', gap: 6, marginTop: 10, flexShrink: 0 }
    }>
      <button onClick={onDetail} title="詳細を表示する" style={{ ...base, ...btnSize, background: colors.btnSecondary, color: colors.btnSecondaryText }}><Search size={iconSize} /></button>
      <button onClick={onEdit} title="編集する" style={{ ...base, ...btnSize, background: colors.btnSecondary, color: colors.btnSecondaryText }}><Pencil size={iconSize} /></button>
      <button onClick={onDelete} title="削除する" style={{ ...base, ...btnSize, background: colors.btnDanger, color: colors.btnDangerText }}><Trash2 size={iconSize} /></button>
    </div>
  );
}

// viewMode に応じてグリッドカードまたはリスト行として1件のメモを表示する
export function MemoCard({ memo, viewMode, colors, onDetail, onEdit, onDelete }: Props) {
  if (viewMode === 'grid') {
    return (
      <div style={{
        border: `1px solid ${colors.cardBorder}`, borderRadius: 12, padding: 16,
        height: 240, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: colors.cardBg, boxShadow: colors.shadow, overflow: 'hidden',
      }}>
        <div style={{ overflow: 'hidden', flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <h3 style={{
              margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: colors.headerText,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              background: colors.pageBg, borderRadius: 6, padding: '3px 8px',
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
            {/* 画像がある場合は本文行数を1行削減して画像スペースを確保する */}
            <p style={{
              margin: 0, fontSize: 13, color: colors.bodyText, overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: memo.image_url ? 3 : 4, WebkitBoxOrient: 'vertical',
              whiteSpace: 'pre-wrap', lineHeight: 1.6,
            }}>
              {memo.content}
            </p>
          </div>
          {memo.image_url && (
            <img src={memo.image_url} alt="添付画像" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: `1px solid ${colors.cardBorder}`, flexShrink: 0 }} />
          )}
        </div>
        <ActionButtons colors={colors} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
      </div>
    );
  }

  // リスト表示: [メタ情報 | タイトル+本文 | 画像(任意) | ボタン] の4列構成
  return (
    <div style={{
      border: `1px solid ${colors.cardBorder}`, borderRadius: 12, padding: '12px 16px',
      height: 100, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      background: colors.cardBg, boxShadow: colors.shadow, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
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
        <div style={{
          flex: 1, paddingLeft: 12, paddingRight: 12, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${colors.cardBorder}`,
        }}>
          <h3 style={{
            margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: colors.headerText,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            background: colors.pageBg, borderRadius: 6, padding: '2px 8px',
          }}>
            {memo.title}
          </h3>
          <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: '0 0 4px' }} />
          {/* WebkitLineClamp で複数行テキストを省略表示する (非標準だが主要ブラウザ対応済み) */}
          <p style={{
            flex: 1, margin: 0, fontSize: 12, color: colors.bodyText,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            whiteSpace: 'pre-wrap', lineHeight: 1.6,
          }}>
            {memo.content}
          </p>
        </div>
        {memo.image_url && (
          <div style={{ flexShrink: 0, paddingLeft: 12, borderRight: `1px solid ${colors.cardBorder}`, display: 'flex', alignItems: 'stretch' }}>
            <img src={memo.image_url} alt="添付画像" style={{ height: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: 4 }} />
          </div>
        )}
        <ActionButtons colors={colors} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} vertical />
      </div>
    </div>
  );
}
