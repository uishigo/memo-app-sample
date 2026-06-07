import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Memo } from '../types';

// 環境変数が未設定のときはローカル開発用のデフォルト値を使う
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

// メモ一覧の取得・追加・更新・削除・画像アップロードをまとめたフック。
// 各ミューテーション後は fetchMemos で一覧を再取得してローカル状態を同期する。
export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  // ミューテーション後の再取得用。useEffect の依存配列には含めないため関数として切り出す
  const fetchMemos = async () => {
    const res = await axios.get<Memo[]>(`${API}/memos`);
    setMemos(res.data);
  };

  // 初回マウント時のみ取得。fetchMemos を deps に入れると無限ループになるため直接記述
  useEffect(() => {
    axios.get<Memo[]>(`${API}/memos`).then(res => {
      setMemos(res.data);
      setLoading(false);
    });
  }, []);

  const addMemo = async (title: string, content: string, image_url: string | null, author: string | null) => {
    await axios.post(`${API}/memos`, { title, content, image_url, author });
    fetchMemos();
  };

  const updateMemo = async (id: number, title: string, content: string, image_url: string | null, author: string | null) => {
    await axios.put(`${API}/memos/${id}`, { title, content, image_url, author });
    fetchMemos();
  };

  const deleteMemo = async (id: number) => {
    await axios.delete(`${API}/memos/${id}`);
    fetchMemos();
  };

  // multipart/form-data でサーバーに送信し、保存後のURLを返す。
  // キー名 'image' はサーバーの upload.single('image') と一致させる必要がある
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post<{ url: string }>(`${API}/upload`, formData);
    return res.data.url;
  };

  return { memos, loading, addMemo, updateMemo, deleteMemo, uploadImage };
}
