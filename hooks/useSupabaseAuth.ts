import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs"; // useUser を追加
import supabase from "../lib/supabaseClient";

export const useSupabaseAuth = () => {
  const { getToken } = useAuth(); // useAuth はそのまま
  const { user } = useUser(); // useUser を使ってユーザー情報を取得

  useEffect(() => {
    const setSupabaseAuth = async () => {
      // Clerkから取得したトークンを取得（既にJWT形式のトークン）
      const token = await getToken({ template: "supabase" });

      if (token && user) {
        // Supabaseに認証情報をセット
        supabase.auth.setSession({ access_token: token, refresh_token: "" });

        // ユーザー情報をSupabaseのusersテーブルに保存
        const { data, error } = await supabase.from("users").upsert([
          {
            id: user.id, // ClerkのユーザーID
          },
        ]);

        if (error) {
          console.error("Supabaseにユーザー情報を保存できませんでした:", error);
        } else {
          console.log("ユーザー情報がSupabaseに保存されました:", data);
        }
      }
    };

    setSupabaseAuth();
  }, [getToken, user]); // userを依存配列に追加
};
