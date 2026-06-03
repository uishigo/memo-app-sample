import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Memo } from '../types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);

  const fetchMemos = async () => {
    const res = await axios.get<Memo[]>(`${API}/memos`);
    setMemos(res.data);
  };

  // fetchMemos を依存配列に入れないため、初回取得は直接記述
  useEffect(() => {
    axios.get<Memo[]>(`${API}/memos`).then(res => setMemos(res.data));
  }, []);

  const addMemo = async (title: string, content: string, image_url: string | null) => {
    await axios.post(`${API}/memos`, { title, content, image_url });
    fetchMemos();
  };

  const updateMemo = async (id: number, title: string, content: string, image_url: string | null) => {
    await axios.put(`${API}/memos/${id}`, { title, content, image_url });
    fetchMemos();
  };

  const deleteMemo = async (id: number) => {
    await axios.delete(`${API}/memos/${id}`);
    fetchMemos();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    // キー名 'image' はサーバーの upload.single('image') と一致させる必要がある
    formData.append('image', file);
    const res = await axios.post<{ url: string }>(`${API}/upload`, formData);
    return res.data.url;
  };

  return { memos, addMemo, updateMemo, deleteMemo, uploadImage };
}
