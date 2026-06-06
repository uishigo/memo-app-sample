import { useState, useRef } from 'react';
import type { Memo } from '../types';

type AddMemo = (title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UpdateMemo = (id: number, title: string, content: string, image_url: string | null, author: string | null) => Promise<void>;
type UploadImage = (file: File) => Promise<string>;

export function useForm(addMemo: AddMemo, updateMemo: UpdateMemo, uploadImage: UploadImage, username: string) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let image_url: string | null = imageFile ? null : imagePreview;
    if (imageFile) image_url = await uploadImage(imageFile);

    if (editingId) {
      await updateMemo(editingId, title, content, image_url, username || null);
    } else {
      await addMemo(title, content, image_url, username || null);
    }
    reset();
  };

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
