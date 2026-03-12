import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : "https://placeholder.supabase.co";
const finalKey = supabaseAnonKey || "placeholder";

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing or invalid. Please set them correctly in your environment variables.",
  );
}

export const supabase = createClient(finalUrl, finalKey);
