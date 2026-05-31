
// 社内開発環境限定の対処
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Supabase クライアントの初期化
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from('memos')
    .insert([{ title, content }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// メモの更新
app.put('/api/memos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from('memos')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// メモの削除
app.delete('/api/memos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});