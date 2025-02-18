"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import Categories from "../components/categories";

export default function BookmarksPage() {
  useSupabaseAuth();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Header />
        <main className="max-w-[75rem] w-full mx-auto px-6 py-8">
          <Categories />
        </main>
      </div>
      <Footer />
    </>
  );
}
