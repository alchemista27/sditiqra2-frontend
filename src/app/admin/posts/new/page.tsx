'use client';
// src/app/admin/posts/new/page.tsx - Buat Berita Baru
// Reuse komponen editor yang sama dengan edit
import PostEditor from '@/components/cms/PostEditor';

export default function NewPostPage() {
  return <PostEditor mode="create" />;
}
