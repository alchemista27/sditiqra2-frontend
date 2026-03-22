'use client';
// src/app/admin/posts/[id]/edit/page.tsx - Edit Berita
import PostEditor from '@/components/cms/PostEditor';
import { useParams } from 'next/navigation';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  return <PostEditor mode="edit" postId={id} />;
}
