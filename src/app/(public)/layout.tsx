// src/app/(public)/layout.tsx - Layout untuk halaman publik
import "../globals.css";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsTicker from "@/components/NewsTicker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative pb-24 md:pb-12">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <NewsTicker />
    </div>
  );
}
