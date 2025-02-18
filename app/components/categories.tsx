"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Bookmark, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Edit3 } from "lucide-react";
import Link from "next/link";

type Bookmark = {
  id: number;
  url: string;
  title: string;
  category_id: number;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
};

export default function Home() {
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [bookmarksResponse, categoriesResponse] = await Promise.all([
          supabase.from("bookmarks").select("*").eq("user_id", user.id),
          supabase.from("categories").select("*").eq("user_id", user.id),
        ]);

        if (bookmarksResponse.error)
          throw new Error(bookmarksResponse.error.message);
        if (categoriesResponse.error)
          throw new Error(categoriesResponse.error.message);

        setBookmarks(bookmarksResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [user]);

  const groupedBookmarks = categories.reduce((acc, category) => {
    acc[category.id] = bookmarks.filter(
      (bookmark) => bookmark.category_id === category.id
    );
    return acc;
  }, {} as Record<number, Bookmark[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Categories
            </h1>
            <Link
              href="/bookmarks/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-white"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Categories</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-gray-700">
                  {category.name}
                </h3>
                <ul className="space-y-3">
                  {groupedBookmarks[category.id]?.map((bookmark) => (
                    <li key={bookmark.id}>
                      <Link
                        href={
                          bookmark.url.startsWith("http")
                            ? bookmark.url
                            : `https://${bookmark.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                            alt=""
                            className="mt-3.5 mr-2 w-5 h-5 rounded-sm flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://www.google.com/s2/favicons?domain=example.com&sz=32";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors duration-200">
                              {bookmark.title}
                            </h4>
                            <p className="text-sm text-gray-400 truncate mt-1">
                              {bookmark.url}
                            </p>
                          </div>
                          <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200 flex-shrink-0" />
                        </div>
                      </Link>
                    </li>
                  ))}
                  {(!groupedBookmarks[category.id] ||
                    groupedBookmarks[category.id].length === 0) && (
                    <li className="text-gray-500 text-sm italic px-3">
                      No bookmarks in this category
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                You haven't created any categories yet.
              </p>
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50 max-w-md w-full">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Sign in to view your bookmarks
              </h2>
              <p className="text-gray-400 mb-6">
                Organize and access your bookmarks from anywhere
              </p>
              <SignInButton>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 w-full">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
