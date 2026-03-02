'use client';
// src/app/admin/posts/[id]/edit/page.tsx - Edit Berita
import PostEditor from '@/components/cms/PostEditor';

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <PostEditor mode="edit" postId={params.id} />;
}
