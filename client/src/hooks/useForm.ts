import { useState, useRef } from 'react';
import type { Memo } from '../types';

type AddMemo = (title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UpdateMemo = (id: number, title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UploadImage = (file: File) => Promise<string>;

export type DiffItem =
  | { type: 'text'; field: string; before: string; after: string }
  | { type: 'image'; field: string; before: string | null; after: string | null };

// 投稿フォームの状態と操作をまとめたフック。新規追加・編集の両モードを管理する。
// username は App の state を毎レンダーで受け取ることで常に最新値を参照する
export function useForm(addMemo: AddMemo, updateMemo: UpdateMemo, uploadImage: UploadImage, username: string) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null); // null = 新規追加モード
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ diffs: DiffItem[] } | null>(null);
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

  const doSubmit = async () => {
    let image_url: string | null = imageFile ? null : imagePreview;
    if (imageFile) image_url = await uploadImage(imageFile);

    if (editingId) {
      await updateMemo(editingId, title, content, image_url, username || null);
    } else {
      await addMemo(title, content, image_url, username || null);
    }
    reset();
  };

  // 編集モードのとき title/content の差分があれば確認ダイアログを出す。
  // 差分なし or 新規追加モードはそのまま送信する
  const handleSubmit = async () => {
    if (!title.trim()) return;

    if (editingId) {
      const diffs: DiffItem[] = [];
      if (title !== originalTitle) diffs.push({ type: 'text', field: 'タイトル', before: originalTitle, after: title });
      if (content !== originalContent) diffs.push({ type: 'text', field: '本文', before: originalContent, after: content });
      if (imageFile !== null || imagePreview !== originalImagePreview) diffs.push({ type: 'image', field: '画像', before: originalImagePreview, after: imagePreview });
      if (diffs.length === 0) { reset(); return; }
      setConfirmDialog({ diffs });
      return;
    }

    await doSubmit();
  };

  const confirmUpdate = async () => {
    setConfirmDialog(null);
    await doSubmit();
  };

  const cancelConfirm = () => setConfirmDialog(null);

  // 既存メモの内容をフォームに展開して編集モードに切り替える。
  // imageFile は null にリセットし、既存画像は imagePreview のURLで保持する
  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    setOriginalTitle(memo.title);
    setOriginalContent(memo.content);
    setOriginalImagePreview(memo.image_url || null);
    setImageFile(null);
    setImagePreview(memo.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { title, setTitle, content, setContent, imagePreview, editingId, fileInputRef, handleImageChange, handleImageRemove, reset, handleSubmit, startEdit, confirmDialog, confirmUpdate, cancelConfirm };
}
