import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("من فضلك ادخل البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);

    // 1) تسجيل الدخول عبر Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError("بيانات الدخول غير صحيحة");
      return;
    }

    // 2) جلب بيانات الموظف المرتبطة بهذا المستخدم من جدول employees
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select(`
        id,
        employee_code,
        full_name,
        phone,
        is_active,
        roles ( name, name_ar ),
        branches ( id, name )
      `)
      .eq("auth_user_id", authData.user.id)
      .single();

    setLoading(false);

    if (empError || !employee) {
      setError("تم تسجيل الدخول لكن لا يوجد موظف مرتبط بهذا الحساب. تواصل مع مدير النظام.");
      await supabase.auth.signOut();
      return;
    }

    if (!employee.is_active) {
      setError("هذا الحساب غير مفعّل. تواصل مع مدير النظام.");
      await supabase.auth.signOut();
      return;
    }

    // 3) تمرير بيانات الموظف للتطبيق الرئيسي
    onLogin({
      id: employee.id,
      code: employee.employee_code,
      name: employee.full_name,
      role: employee.roles?.name_ar || "غير محدد",
      roleKey: employee.roles?.name || "",
      branch: employee.branches?.name || "غير محدد",
      branchId: employee.branches?.id,
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-2xl mb-4">
            <span className="text-3xl font-black text-slate-800">A</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider">AYSC</h1>
          <p className="text-slate-300 text-sm mt-1">نظام إدارة تجارة الحديد</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12 bg-amber-400/50"></div>
            <span className="text-amber-400 text-xs font-semibold">IRON TRADE MANAGEMENT</span>
            <div className="h-px w-12 bg-amber-400/50"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">تسجيل الدخول</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="admin@aysc.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                تذكر تسجيل الدخول
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-60"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
