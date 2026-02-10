'use client'
import { useSession } from '@/context/session';
import { redirect } from 'next/navigation';

export default function Home() {
  const encodedContext = useSession()?.context || "";
  redirect(`/dashboard?context=${encodeURIComponent(encodedContext)}`);
}