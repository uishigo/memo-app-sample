import { X } from 'lucide-react';
import type { ThemeColors } from '../styles';
import type { Memo } from '../types';
import { formatDate } from '../types';

// メモの全文・画像を表示するモーダル。オーバーレイクリックでも閉じられる
export function Modal({ memo, onClose, colors }: { memo: Memo; onClose: () => void; colors: ThemeColors }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: colors.modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      {/* オーバーレイクリックで閉じる処理が内側のクリックで発火しないよう伝播を止める */}
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
        <h2 style={{
          margin: 0, color: colors.headerText, wordBreak: 'break-word', overflowWrap: 'break-word',
          background: colors.pageBg, borderRadius: 8, padding: '6px 12px',
        }}>{memo.title}</h2>
        <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: 0 }} />
        <div style={{ fontSize: 12, color: colors.dateText, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ color: memo.author ? colors.btnPrimary : colors.dateText, fontWeight: memo.author ? 600 : 400 }}>
            👤 {memo.author || '-'}
          </span>
          <span>作成: {formatDate(memo.created_at)}</span>
          <span>更新: {(memo.updated_at && memo.updated_at !== memo.created_at) ? formatDate(memo.updated_at) : '-'}</span>
        </div>
        <div style={{ overflowY: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', lineHeight: 1.8, color: colors.bodyText }}>
          {memo.content}
        </div>
        {memo.image_url && (
          <img
            src={memo.image_url}
            alt="添付画像"
            style={{
              width: '100%', maxHeight: 320, objectFit: 'contain',
              borderRadius: 8, border: `1px solid ${colors.cardBorder}`,
            }}
          />
        )}
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
