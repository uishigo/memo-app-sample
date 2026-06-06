import { useState, useRef } from 'react';
import type { Memo } from '../types';

type AddMemo = (title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UpdateMemo = (id: number, title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UploadImage = (file: File) => Promise<string>;

// 投稿フォームの状態と操作をまとめたフック。新規追加・編集の両モードを管理する。
// username は App の state を毎レンダーで受け取ることで常に最新値を参照する
export function useForm(addMemo: AddMemo, updateMemo: UpdateMemo, uploadImage: UploadImage, username: string) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null); // null = 新規追加モード
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択時にプレビュー用のオブジェクトURLを生成する
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // imageFile だけでなく input の value もクリアしないと同じファイルを再選択できない
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // フォームと editingId を初期値に戻す。投稿・キャンセル後に呼ぶ
  const reset = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // タイトルが空なら中断。画像があればアップロード後にメモを追加または更新する
  const handleSubmit = async () => {
    if (!title.trim()) return;

    // 新規ファイルが選択されている場合はアップロード後にURLを取得する。
    // 未選択の場合は imagePreview をそのまま使う（既存URLの保持 or null）
    let image_url: string | null = imageFile ? null : imagePreview;
    if (imageFile) image_url = await uploadImage(imageFile);

    if (editingId) {
      await updateMemo(editingId, title, content, image_url, username || null);
    } else {
      await addMemo(title, content, image_url, username || null);
    }
    reset();
  };

  // 既存メモの内容をフォームに展開して編集モードに切り替える。
  // imageFile は null にリセットし、既存画像は imagePreview のURLで保持する
  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    setImageFile(null);
    setImagePreview(memo.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { title, setTitle, content, setContent, imagePreview, editingId, fileInputRef, handleImageChange, handleImageRemove, reset, handleSubmit, startEdit };
}
