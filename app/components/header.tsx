import { UserButton } from "@clerk/nextjs";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
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
  );
}
