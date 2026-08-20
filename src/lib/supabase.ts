import { createClient } from "@supabase/supabase-js";

// Публичный URL проекта и anon-ключ — предназначены для использования
// в клиентском коде и защищены правилами Row Level Security на стороне
// Supabase, поэтому хранить их в секрете не нужно.
const SUPABASE_URL = "https://almawauqvdcwansorjvk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ch5pAbtd1yfsB13afzxhOg_qQC7FtYP";

// Единственный служебный аккаунт, под которым происходит вход в режим
// редактирования — пользователь вводит только пароль.
export const EDITOR_EMAIL = "admin@koydmb.ru";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
