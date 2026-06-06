import { LayoutGrid, List } from 'lucide-react';
import type { ThemeColors } from '../styles';

// グリッド表示とリスト表示を切り替えるトグルボタン
interface Props {
  viewMode: 'grid' | 'list';
  colors: ThemeColors;
  onChange: (mode: 'grid' | 'list') => void;
}

// viewMode を受け取り、グリッド/リスト切替ボタンを描画する
export function ViewToggle({ viewMode, colors, onChange }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div style={{ display: 'flex', border: `1px solid ${colors.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
        {(['grid', 'list'] as const).map(mode => (
          <button
            key={mode}
            title={mode === 'grid' ? 'グリッド表示' : 'リスト表示'}
            onClick={() => onChange(mode)}
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
  );
}
