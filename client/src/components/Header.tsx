import { User } from 'lucide-react';
import { themes, themeList, type ThemeColors, type ThemeName } from '../styles';

interface Props {
  theme: ThemeName;
  colors: ThemeColors;
  username: string;
  activeEmoji: string;
  onThemeChange: (t: ThemeName) => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Header({ theme, colors, username, activeEmoji, onThemeChange, onUsernameChange }: Props) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ color: colors.headerText, margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
          {activeEmoji} みんなの掲示板
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: colors.dateText, marginRight: 2 }}>テーマ</span>
          {themeList.map(t => (
            <button
              key={t.key}
              title={t.label}
              onClick={() => onThemeChange(t.key)}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: themes[t.key].btnPrimary,
                border: theme === t.key ? `2px solid ${colors.headerText}` : '2px solid transparent',
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
            onChange={onUsernameChange}
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
    </>
  );
}
