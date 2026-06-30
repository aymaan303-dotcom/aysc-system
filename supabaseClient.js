import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lhtghsmjwrgjrfzqsske.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodGdoc21qd3JnanJmenFzc2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjA1NjIsImV4cCI6MjA5ODMzNjU2Mn0.OhVthr5Ss2GWDqwt44ndWSUBgoV2JbjfE79Z5LKYOzg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
