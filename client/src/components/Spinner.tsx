import type { ThemeColors } from '../styles';

type Props = {
  colors: ThemeColors;
};

export function Spinner({ colors }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `4px solid ${colors.cardBorder}`,
        borderTopColor: colors.btnPrimary,
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
