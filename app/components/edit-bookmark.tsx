import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import supabase from "@/lib/supabaseClient";

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

export default function EditBookmark() {
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const handleAddCategory = async () => {
    if (!user) {
      alert("Category name is required and user must be signed in.");
      return;
    }
    if (!newCategoryName) {
      alert("Category name is required.");
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

    window.location.reload();
  };

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

    window.location.reload();
  };

  return (
    <div className="pt-[3.5rem]">
      <div className="rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add Bookmark</h2>
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

      {/* カテゴリー追加フォーム */}
      <div className="rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add Category</h2>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
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
      </div>
    </div>
  );
}
