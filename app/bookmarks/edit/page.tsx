"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import EditBookmark from "../../components/edit-bookmark";
import CategoriesEditOn from "@/app/components/categories-editon";

export default function BookmarksPage() {
  useSupabaseAuth();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Header />
        <main className="max-w-[75rem] w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-[1fr_20.5rem] gap-10">
            <CategoriesEditOn />
            <EditBookmark />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
