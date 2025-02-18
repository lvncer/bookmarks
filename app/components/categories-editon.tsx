"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { ArrowLeft, Bookmark, LogIn, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState<string>("");
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>("");
  const [newBookmarkCategoryId, setNewBookmarkCategoryId] = useState<
    number | null
  >(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

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

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category and all its bookmarks?"
      )
    ) {
      const { error: deleteBookmarksError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("category_id", categoryId);

      if (deleteBookmarksError) {
        console.error("Error deleting bookmarks:", deleteBookmarksError);
        alert("Error deleting bookmarks.");
        return;
      }

      const { error: deleteCategoryError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (deleteCategoryError) {
        console.error("Error deleting category:", deleteCategoryError);
        alert("Error deleting category.");
        return;
      }

      alert("Category and its bookmarks deleted successfully.");
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.category_id !== categoryId)
      );

      window.location.reload();
    }
  };

  const handleStartEditing = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setNewBookmarkUrl(bookmark.url);
    setNewBookmarkTitle(bookmark.title);
    setNewBookmarkCategoryId(bookmark.category_id);
  };

  const handleStartEditingCategory = (
    categoryName: string,
    categoryId: number
  ) => {
    setNewCategoryName(categoryName);
    setSelectedCategoryId(categoryId);
  };

  const handleDeleteBookmark = async (id: number) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } else {
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    }

    window.location.reload();
  };

  const handleEditBookmark = async () => {
    if (
      !editingBookmark ||
      !newBookmarkUrl ||
      !newBookmarkTitle ||
      !newBookmarkCategoryId
    ) {
      alert("All fields are required.");
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .update({
        url: newBookmarkUrl,
        title: newBookmarkTitle,
        category_id: newBookmarkCategoryId,
      })
      .eq("id", editingBookmark.id);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setBookmarks(
        bookmarks.map((bookmark) =>
          bookmark.id === editingBookmark.id ? data[0] : bookmark
        )
      );
      setEditingBookmark(null);
      setNewBookmarkUrl("");
      setNewBookmarkTitle("");
      setNewBookmarkCategoryId(null);
    }

    window.location.reload();
  };

  const handleEditCategoryName = async (
    categoryName: string,
    categoryId: number
  ) => {
    if (!categoryName || !categoryId) {
      alert("All fields are required.");
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: categoryName,
      })
      .eq("id", categoryId);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setNewCategoryName("");
      setSelectedCategoryId(0);
    }

    window.location.reload();
  };

  const groupedBookmarks = categories.reduce((acc, category) => {
    acc[category.id] = bookmarks.filter(
      (bookmark) => bookmark.category_id === category.id
    );
    return acc;
  }, {} as Record<number, Bookmark[]>);

  return (
    <div className="min-h-screen bg-gray-900">
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-white mb-8">
              Your Bookmarks
            </h1>
            <Link
              href="/bookmarks"
              className="inline-flex items-center mb-5 gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookmarks
            </Link>
          </div>
          {/* Edit Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Category Edit Form */}
            {selectedCategoryId !== 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Edit Category
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleEditCategoryName(
                          newCategoryName,
                          selectedCategoryId
                        )
                      }
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategoryId(0);
                        setNewCategoryName("");
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookmark Edit Form */}
            {editingBookmark && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Edit Bookmark
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="URL"
                    value={newBookmarkUrl}
                    onChange={(e) => setNewBookmarkUrl(e.target.value)}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={newBookmarkTitle}
                    onChange={(e) => setNewBookmarkTitle(e.target.value)}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={newBookmarkCategoryId || ""}
                    onChange={(e) =>
                      setNewBookmarkCategoryId(Number(e.target.value))
                    }
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditBookmark}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingBookmark(null);
                        setNewBookmarkUrl("");
                        setNewBookmarkTitle("");
                        setNewBookmarkCategoryId(null);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Categories and Bookmarks */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-white">
                    {category.name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleStartEditingCategory(category.name, category.id)
                      }
                      className="p-2 text-gray-400 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedBookmarks[category.id]?.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors group"
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-3"
                      >
                        <h4 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors mb-2">
                          {bookmark.title}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          {bookmark.url}
                        </p>
                      </a>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleStartEditing(bookmark)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center">
              <Bookmark className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-4">
                Sign in to view your bookmarks
              </h2>
              <p className="text-gray-400 mb-6">
                Keep all your important links organized and accessible in one
                place.
              </p>
              <SignInButton>
                <button className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors">
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
