import type React from 'react';

export type ThemeColors = {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  inputBorder: string;
  btnPrimary: string;
  btnSecondary: string;
  btnSecondaryText: string;
  btnDanger: string;
  btnDangerText: string;
  headerText: string;
  dateText: string;
  bodyText: string;
  modalOverlay: string;
  modalBg: string;
  shadow: string;
  modalShadow: string;
};

export type ThemeName = 'green' | 'blue' | 'red' | 'yellow' | 'mono';

export const themes: Record<ThemeName, ThemeColors> = {
  green: {
    pageBg: '#edf7f1', cardBg: '#f7fdf9', cardBorder: '#b2ddc0',
    inputBorder: '#a8d5b5', btnPrimary: '#5aaa78',
    btnSecondary: '#c3e8cf', btnSecondaryText: '#2e6e4a',
    btnDanger: '#e8c3c3', btnDangerText: '#8b3a3a',
    headerText: '#2a5e40', dateText: '#7aab8e', bodyText: '#3d5a47',
    modalOverlay: 'rgba(42, 94, 64, 0.4)', modalBg: '#f4fcf7',
    shadow: '0 2px 8px rgba(90, 170, 120, 0.12)',
    modalShadow: '0 8px 32px rgba(90, 170, 120, 0.2)',
  },
  blue: {
    pageBg: '#edf1f7', cardBg: '#f7f9fd', cardBorder: '#b2c4dd',
    inputBorder: '#a8bcd5', btnPrimary: '#5a7eaa',
    btnSecondary: '#c3d6e8', btnSecondaryText: '#2e4a6e',
    btnDanger: '#e8c3c3', btnDangerText: '#8b3a3a',
    headerText: '#2a3e5e', dateText: '#7a96ab', bodyText: '#3d4a5a',
    modalOverlay: 'rgba(42, 62, 94, 0.4)', modalBg: '#f4f7fc',
    shadow: '0 2px 8px rgba(90, 126, 170, 0.12)',
    modalShadow: '0 8px 32px rgba(90, 126, 170, 0.2)',
  },
  red: {
    pageBg: '#f7edee', cardBg: '#fdf7f7', cardBorder: '#ddb5b5',
    inputBorder: '#d5a8a8', btnPrimary: '#aa5a60',
    btnSecondary: '#e8c3c4', btnSecondaryText: '#6e2e32',
    btnDanger: '#c8c3e8', btnDangerText: '#3a2e8b',
    headerText: '#5e2a2e', dateText: '#ab7a7c', bodyText: '#5a3d3e',
    modalOverlay: 'rgba(94, 42, 46, 0.4)', modalBg: '#fcf4f4',
    shadow: '0 2px 8px rgba(170, 90, 96, 0.12)',
    modalShadow: '0 8px 32px rgba(170, 90, 96, 0.2)',
  },
  yellow: {
    pageBg: '#f7f5ec', cardBg: '#fdfcf5', cardBorder: '#ddd4a8',
    inputBorder: '#d5c898', btnPrimary: '#a89040',
    btnSecondary: '#e8dfc3', btnSecondaryText: '#6e5a2e',
    btnDanger: '#e8c3c3', btnDangerText: '#8b3a3a',
    headerText: '#5e4a2a', dateText: '#ab987a', bodyText: '#5a4a3d',
    modalOverlay: 'rgba(94, 74, 42, 0.4)', modalBg: '#fcfaf4',
    shadow: '0 2px 8px rgba(170, 144, 64, 0.12)',
    modalShadow: '0 8px 32px rgba(170, 144, 64, 0.2)',
  },
  mono: {
    pageBg: '#f0f0f0', cardBg: '#fafafa', cardBorder: '#cccccc',
    inputBorder: '#bbbbbb', btnPrimary: '#555555',
    btnSecondary: '#dddddd', btnSecondaryText: '#333333',
    btnDanger: '#e8c8c8', btnDangerText: '#662222',
    headerText: '#222222', dateText: '#888888', bodyText: '#444444',
    modalOverlay: 'rgba(30, 30, 30, 0.5)', modalBg: '#f8f8f8',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    modalShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
};

export const themeList: { key: ThemeName; label: string; emoji: string }[] = [
  { key: 'green',  label: 'グリーン',   emoji: '🌿' },
  { key: 'blue',   label: 'ブルー',     emoji: '💧' },
  { key: 'red',    label: 'レッド',     emoji: '🌹' },
  { key: 'yellow', label: 'イエロー',   emoji: '⭐' },
  { key: 'mono',   label: 'モノトーン', emoji: '🖤' },
];

export function getInputStyle(c: ThemeColors): React.CSSProperties {
  return {
    display: 'block', width: '100%', marginBottom: 10,
    padding: '10px 14px', fontSize: 15,
    boxSizing: 'border-box',
    borderRadius: 8, border: `1px solid ${c.inputBorder}`,
    background: '#fff', color: c.bodyText,
    outline: 'none',
  };
}
