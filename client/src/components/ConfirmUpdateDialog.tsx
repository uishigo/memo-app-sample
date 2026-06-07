import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../styles';
import type { DiffItem } from '../hooks/useForm';

interface Props {
  diffs: DiffItem[];
  colors: ThemeColors;
  onConfirm: () => void;
  onCancel: () => void;
}

// 編集内容の差分を表示して更新を確認するダイアログ
export function ConfirmUpdateDialog({ diffs, colors, onConfirm, onCancel }: Props) {
  return (
    <div
      onClick={onCancel}
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
          borderRadius: 16, padding: 28,
          width: '90%', maxWidth: 560,
          display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: colors.modalShadow,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, color: colors.headerText }}>以下の内容で更新しますか？</h3>
        <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {diffs.map((diff) => (
            <div key={diff.field}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.dateText, marginBottom: 6 }}>{diff.field}</div>
              {diff.type === 'image' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['before', 'after'] as const).map((side) => {
                    const url = diff[side];
                    const label = side === 'before' ? '変更前' : '変更後';
                    const bg = side === 'before' ? '#fef2f2' : '#f0fdf4';
                    const border = side === 'before' ? '#fecaca' : '#bbf7d0';
                    const color = side === 'before' ? '#991b1b' : '#166534';
                    return (
                      <div key={side} style={{
                        flex: 1, padding: '8px 10px', borderRadius: 8,
                        background: bg, border: `1px solid ${border}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
                        {url
                          ? <img src={url} alt={label} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', borderRadius: 6 }} />
                          : <span style={{ fontSize: 12, color }}>なし</span>
                        }
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['before', '変更前', '#fef2f2', '#fecaca', '#991b1b'], ['after', '変更後', '#f0fdf4', '#bbf7d0', '#166534']] as const).map(([side, label, bg, border, color]) => (
                    <div key={side} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      background: bg, border: `1px solid ${border}`,
                      fontSize: 13, color,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 120, overflowY: 'auto',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, marginRight: 6 }}>{label}</span>{diff[side]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6,
              background: colors.btnSecondary, color: colors.btnSecondaryText,
              border: `1px solid ${colors.cardBorder}`, borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            <X size={15} /> キャンセル
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 6,
              background: colors.btnPrimary, color: '#fff',
              border: 'none', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            <Check size={15} /> 更新する
          </button>
        </div>
      </div>
    </div>
  );
}
