"use client";

import "./home.css";
import { Footer } from "./components/footer";
import {
  BookmarkIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  SparklesIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BookmarkIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Bookmarks</span>
            </motion.div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold leading-tight"
              >
                スマートな
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-400"
                >
                  ブックマーク管理
                </motion.span>
                を、あなたの手に
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-300"
              >
                最新のテクノロジーを駆使した、安全で使いやすいブックマーク管理ツール。
                あなたの大切なウェブページを、スマートに整理します。
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <SignedIn>
                  <Link href="/bookmarks">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-lg font-semibold"
                    >
                      Login
                    </motion.button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <button className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-lg font-semibold"
                >
                  詳しく見る
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <ShieldCheckIcon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">安全な認証</h3>
                <p className="text-gray-400">
                  Clerkによる最新の認証システムで、あなたのデータを確実に保護します。
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <DatabaseIcon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  高速なデータベース
                </h3>
                <p className="text-gray-400">
                  Supabaseの強力なインフラで、快適な操作性を実現しています。
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <SparklesIcon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">直感的な操作</h3>
                <p className="text-gray-400">
                  モダンなUIで、ストレスのない快適な操作を提供します。
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <BookmarkIcon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">スマートな整理</h3>
                <p className="text-gray-400">
                  タグ付けやフォルダ分けで、効率的なブックマーク管理を実現。
                </p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
