if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  },
});

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Supabase クライアントの初期化
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
// Storage削除はRLSをバイパスするためservice_role keyを使用
const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : supabase;

async function deleteStorageFile(imageUrl) {
  if (!imageUrl) return;
  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = '/memo-images/';
    const idx = pathname.indexOf(marker);
    if (idx === -1) return;
    // SupabaseのパブリックURLからバケット以下のパスを抽出する
    // ファイル名に特殊文字が含まれる場合に備えてdecodeURIComponentを使用
    const filePath = decodeURIComponent(pathname.slice(idx + marker.length));
    const { error } = await supabaseAdmin.storage.from('memo-images').remove([filePath]);
    if (error) console.error('Storage deletion failed:', error.message);
  } catch (e) {
    console.error('Storage deletion error:', e);
  }
}

// 画像アップロード
app.post('/api/upload', uploadLimiter, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('memo-images')
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
  if (error) return res.status(500).json({ error: error.message });
  const { data } = supabase.storage.from('memo-images').getPublicUrl(fileName);
  res.json({ url: data.publicUrl });
});

// メモ一覧の取得
app.get('/api/memos', async (req, res) => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// メモの作成
app.post('/api/memos', async (req, res) => {
  const { title, content, image_url, author } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'タイトルは必須です' });
  }
  if (title.length > 50) return res.status(400).json({ error: 'タイトルは50文字以内です' });
  if (content && content.length > 500) return res.status(400).json({ error: '内容は500文字以内です' });
  if (image_url && typeof image_url !== 'string') return res.status(400).json({ error: '無効な画像URLです' });
  if (author && (typeof author !== 'string' || author.length > 20)) return res.status(400).json({ error: '名前は20文字以内です' });
  const authorValue = author ? author.trim() || null : null;
  const { data, error } = await supabase
    .from('memos')
    .insert([{ title: title.trim(), content: content ?? '', image_url: image_url || null, author: authorValue }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// メモの更新
app.put('/api/memos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url, author } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'タイトルは必須です' });
  }
  if (title.length > 50) return res.status(400).json({ error: 'タイトルは50文字以内です' });
  if (content && content.length > 500) return res.status(400).json({ error: '内容は500文字以内です' });
  if (image_url && typeof image_url !== 'string') return res.status(400).json({ error: '無効な画像URLです' });
  if (author && (typeof author !== 'string' || author.length > 20)) return res.status(400).json({ error: '名前は20文字以内です' });
  const authorValue = author ? author.trim() || null : null;

  const { data: existing } = await supabase
    .from('memos').select('image_url, author').eq('id', id).single();

  // 画像URLが変わった場合（差し替えまたは削除）のみ古いファイルをStorageから除去
  if (existing?.image_url && existing.image_url !== image_url) {
    await deleteStorageFile(existing.image_url);
  }

  // 現在のユーザー名が空の場合は既存のauthorを引き継ぐ
  const updatedAuthor = authorValue ?? existing?.author ?? null;

  const { data, error } = await supabase
    .from('memos')
    .update({ title, content, image_url: image_url ?? null, author: updatedAuthor, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// メモの削除
app.delete('/api/memos/:id', async (req, res) => {
  const { id } = req.params;

  // DBレコード削除前にimage_urlを取得する — 削除後は参照できなくなるため
  const { data: existing } = await supabase
    .from('memos').select('image_url').eq('id', id).single();

  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  if (existing?.image_url) {
    await deleteStorageFile(existing.image_url);
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});