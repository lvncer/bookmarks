"use client";

import { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import supabase from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { LogIn, Bookmark } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Footer } from "../components/footer";
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

export default function BookmarksPage() {
  useSupabaseAuth();
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState<string>("");
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>("");
  const [newBookmarkCategoryId, setNewBookmarkCategoryId] = useState<
    number | null
  >(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [categoryName, setCategoryName] = useState<string>("");

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

  const handleAddBookmark = async () => {
    if (
      !newBookmarkUrl ||
      !newBookmarkTitle ||
      !newBookmarkCategoryId ||
      !user
    ) {
      alert("All fields are required.");
      return;
    }

    const { data, error } = await supabase.from("bookmarks").insert([
      {
        url: newBookmarkUrl,
        title: newBookmarkTitle,
        category_id: newBookmarkCategoryId,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setBookmarks([...bookmarks, data[0]]);
      setNewBookmarkUrl("");
      setNewBookmarkTitle("");
      setNewBookmarkCategoryId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName || !user) {
      alert("Category name is required and user must be signed in.");
      return;
    }

    const { data, error } = await supabase.from("categories").insert([
      {
        name: newCategoryName,
        user_id: user.id,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    } else if (data) {
      alert("Category added successfully!");
      setCategories([...categories, data[0]]);
      setNewCategoryName("");
    }
  };

  // ブックマーク編集処理
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
  };

  // ブックマーク削除処理
  const handleDeleteBookmark = async (id: number) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } else {
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category and all its bookmarks?"
      )
    ) {
      // 1. 関連するブックマークを削除
      const { error: deleteBookmarksError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("category_id", categoryId);

      if (deleteBookmarksError) {
        console.error("Error deleting bookmarks:", deleteBookmarksError);
        alert("Error deleting bookmarks.");
        return;
      }

      // 2. カテゴリーを削除
      const { error: deleteCategoryError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (deleteCategoryError) {
        console.error("Error deleting category:", deleteCategoryError);
        alert("Error deleting category.");
        return;
      }

      // 削除が成功した場合
      alert("Category and its bookmarks deleted successfully.");
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.category_id !== categoryId)
      );
    }
  };

  // 編集フォームの表示/非表示
  const handleStartEditing = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setNewBookmarkUrl(bookmark.url);
    setNewBookmarkTitle(bookmark.title);
    setNewBookmarkCategoryId(bookmark.category_id);
  };

  // カテゴリーごとにブックマークをグループ化する
  const groupedBookmarks = categories.reduce((acc, category) => {
    acc[category.id] = bookmarks.filter(
      (bookmark) => bookmark.category_id === category.id
    );
    return acc;
  }, {} as Record<number, Bookmark[]>);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="h-16">
          <div className="max-w-[75rem] mx-auto px-6 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <Bookmark className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-white">
                  <Link href="/">Bookmarks</Link>
                </h1>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-6",
                  },
                }}
              />
            </div>
          </div>
        </header>

        <main className="max-w-[75rem] w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-[1fr_20.5rem] gap-10">
            <div>
              <SignedIn>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-3xl font-bold text-white">
                      Categories
                    </h1>
                  </div>

                  {/* 各カテゴリーごとのブックマークを表示 */}
                  <div>
                    {categories.map((category) => (
                      <div key={category.id}>
                        {selectedCategoryId === null ||
                        selectedCategoryId === category.id ? (
                          <div>
                            <button
                              onClick={() =>
                                setSelectedCategoryId(
                                  selectedCategoryId === category.id
                                    ? null
                                    : category.id
                                )
                              }
                              className={`w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                                selectedCategoryId === category.id
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-700 hover:bg-gray-600"
                              }`}
                            >
                              <h3 className="text-lg font-semibold text-white mb-4">
                                {category.name}
                              </h3>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800 ml-4"
                            >
                              Delete
                            </button>
                            <ul className="space-y-3">
                              {groupedBookmarks[category.id]?.map(
                                (bookmark) => (
                                  <li key={bookmark.id}>
                                    <a
                                      href={bookmark.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center p-4 rounded-lg hover:bg-gray-600 transition-colors group"
                                    >
                                      <div className="flex-1">
                                        <h3 className="text-lg font-medium text-white group-hover:text-indigo-600 transition-colors">
                                          {bookmark.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                          {bookmark.url}
                                        </p>
                                      </div>
                                      <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                      </div>
                                    </a>
                                    <div>
                                      {/* 編集ボタン */}
                                      <button
                                        onClick={() =>
                                          handleStartEditing(bookmark)
                                        }
                                        className="text-indigo-600 hover:text-indigo-800"
                                      >
                                        Edit
                                      </button>
                                      {/* 削除ボタン */}
                                      <button
                                        onClick={() =>
                                          handleDeleteBookmark(bookmark.id)
                                        }
                                        className="ml-2 text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Sign in to view your bookmarks
                    </h2>
                    <SignInButton>
                      <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </div>
              </SignedOut>
            </div>

            <div className="pt-[3.5rem]">
              <div className="rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add Bookmark
                </h2>
                <div className="space-y-3">
                  {/* Add Bookmark Form */}
                  {user && (
                    <div className="mt-6">
                      <div>
                        <input
                          type="text"
                          placeholder="URL"
                          value={newBookmarkUrl}
                          onChange={(e) => setNewBookmarkUrl(e.target.value)}
                          className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Title"
                          value={newBookmarkTitle}
                          onChange={(e) => setNewBookmarkTitle(e.target.value)}
                          className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="mt-2">
                        <select
                          value={newBookmarkCategoryId || ""}
                          onChange={(e) =>
                            setNewBookmarkCategoryId(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 text-sm text-gray-400 bg-gray-800 border border-gray-300 rounded-lg"
                        >
                          <option value="" className="text-white">
                            Select Category
                          </option>
                          {categories.map((category) => (
                            <option
                              key={category.id}
                              value={category.id}
                              className="text-white"
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={handleAddBookmark}
                          className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add Category
                </h2>

                {/* カテゴリー追加フォーム */}
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleAddCategory}
                      className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>

                {/* 編集フォーム */}
                {editingBookmark && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Edit Bookmark
                    </h2>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="URL"
                        value={newBookmarkUrl}
                        onChange={(e) => setNewBookmarkUrl(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        value={newBookmarkTitle}
                        onChange={(e) => setNewBookmarkTitle(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <select
                        value={newBookmarkCategoryId || ""}
                        onChange={(e) =>
                          setNewBookmarkCategoryId(Number(e.target.value))
                        }
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleEditBookmark}
                        className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
