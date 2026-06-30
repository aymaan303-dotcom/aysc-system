import { useState } from "react";
import LoginScreen from "./LoginScreen";
import { supabase } from "./supabaseClient";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "P001", name: "حديد تسليح 10 مم", type: "تسليح", size: "10 مم", unit: "طن", theoreticalWeight: 617, buyPrice: 14500, sellPrice: 15200, reorderLevel: 10, stock: 85, branch: "الفرع الرئيسي" },
  { id: "P002", name: "حديد تسليح 12 مم", type: "تسليح", size: "12 مم", unit: "طن", theoreticalWeight: 888, buyPrice: 14500, sellPrice: 15200, reorderLevel: 15, stock: 6, branch: "الفرع الرئيسي" },
  { id: "P003", name: "مواسير مجلفنة 2 بوصة", type: "مواسير", size: '2"', unit: "طن", theoreticalWeight: 5600, buyPrice: 18000, sellPrice: 19500, reorderLevel: 5, stock: 3, branch: "الفرع الثاني" },
  { id: "P004", name: "صاج مسطح 2 مم", type: "صاج", size: "2 مم", unit: "طن", theoreticalWeight: 15680, buyPrice: 16200, sellPrice: 17100, reorderLevel: 8, stock: 22, branch: "الفرع الرئيسي" },
  { id: "P005", name: "زاوية 50×50×5", type: "زاوية", size: "50×50×5", unit: "طن", theoreticalWeight: 3770, buyPrice: 15800, sellPrice: 16700, reorderLevel: 10, stock: 4, branch: "الفرع الثاني" },
];

const CUSTOMERS = [
  { id: "C001", name: "شركة البناء الحديث", phone: "0501234567", credit: 200000, balance: 45000, lastPayment: "2024-01-15", overdue: true },
  { id: "C002", name: "مقاولات النيل", phone: "0509876543", credit: 150000, balance: 12000, lastPayment: "2024-01-20", overdue: false },
  { id: "C003", name: "مصنع الهياكل المعدنية", phone: "0507654321", credit: 500000, balance: 87000, lastPayment: "2023-12-28", overdue: true },
  { id: "C004", name: "مشاريع الخليج", phone: "0503456789", credit: 300000, balance: 0, lastPayment: "2024-01-22", overdue: false },
];

const SUPPLIERS = [
  { id: "S001", name: "مصنع حديد المصريين", phone: "0221234567", balance: 320000, lastOrder: "2024-01-18" },
  { id: "S002", name: "شركة الفولاذ الوطني", phone: "0229876543", balance: 180000, lastOrder: "2024-01-20" },
  { id: "S003", name: "مجموعة الحديد المتحدة", phone: "0227654321", balance: 0, lastOrder: "2024-01-10" },
];

const SALES = [
  { id: "INV-001", date: "2024-01-22", customer: "شركة البناء الحديث", items: [{ product: "حديد تسليح 10 مم", qty: 5, price: 15200 }], total: 76000, paid: 30000, status: "جزئي" },
  { id: "INV-002", date: "2024-01-22", customer: "مقاولات النيل", items: [{ product: "صاج مسطح 2 مم", qty: 3, price: 17100 }], total: 51300, paid: 51300, status: "مكتمل" },
  { id: "INV-003", date: "2024-01-21", customer: "مصنع الهياكل المعدنية", items: [{ product: "زاوية 50×50×5", qty: 8, price: 16700 }], total: 133600, paid: 50000, status: "جزئي" },
];

const MANUFACTURING_ORDERS = [
  {
    id: "MFG-001", customer: "شركة البناء الحديث", product: "هياكل معدنية مجلفنة", qty: 12, unit: "قطعة", deliveryDate: "2024-01-28",
    status: "قيد التنفيذ", startDate: "2024-01-20",
    rawMaterials: [
      { item: "صاج مسطح 2 مم", qtyNeeded: 4.5, unit: "طن", unitCost: 16200 },
      { item: "زاوية 50×50×5", qtyNeeded: 1.2, unit: "طن", unitCost: 15800 },
    ],
    waste: 0.15, wasteUnit: "طن",
    operatingCost: 18000, transportCost: 2500,
    expectedRevenue: 145000,
  },
  {
    id: "MFG-002", customer: "مصنع الهياكل المعدنية", product: "مواسير مجلفنة مقاس خاص", qty: 30, unit: "متر", deliveryDate: "2024-01-25",
    status: "مكتمل", startDate: "2024-01-18",
    rawMaterials: [
      { item: "مواسير مجلفنة 2 بوصة", qtyNeeded: 3.0, unit: "طن", unitCost: 18000 },
    ],
    waste: 0.08, wasteUnit: "طن",
    operatingCost: 9500, transportCost: 1200,
    expectedRevenue: 78000,
    actualRevenue: 81000,
  },
  {
    id: "MFG-003", customer: "مقاولات النيل", product: "قواعد تسليح جاهزة", qty: 8, unit: "طن", deliveryDate: "2024-02-02",
    status: "بانتظار المواد", startDate: "2024-01-22",
    rawMaterials: [
      { item: "حديد تسليح 12 مم", qtyNeeded: 8.5, unit: "طن", unitCost: 14500 },
    ],
    waste: 0, wasteUnit: "طن",
    operatingCost: 22000, transportCost: 0,
    expectedRevenue: 168000,
  },
];

const EMPLOYEES = [
  { id: "E001", name: "أحمد محمود", role: "مدير فرع", branch: "الفرع الرئيسي", salary: 8000, attendance: "حاضر" },
  { id: "E002", name: "سارة خالد", role: "محاسب", branch: "الفرع الرئيسي", salary: 5500, attendance: "حاضر" },
  { id: "E003", name: "محمد عمر", role: "مبيعات", branch: "الفرع الثاني", salary: 4500, attendance: "غائب" },
  { id: "E004", name: "فاطمة حسن", role: "مخزن", branch: "الفرع الثاني", salary: 4000, attendance: "حاضر" },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    branch: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    warehouse: "M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    manufacturing: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9l2 2 4-4",
    scale: "M12 3v1m0 16v1M3 12h1m16 0h1m-2.636-6.364l-.707.707M5.343 17.657l-.707.707m12.728 0l-.707-.707M5.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
    suppliers: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    customers: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    sales: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
    purchase: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    accounts: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    hr: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    reports: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    permissions: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    backup: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    print: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z",
    plus: "M12 4v16m8-8H4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    check: "M5 13l4 4L19 7",
    transfer: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    truck: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-700",
    gold: "bg-amber-100 text-amber-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
};

const StatCard = ({ label, value, sub, icon, color = "blue", trend }) => {
  const colors = {
    blue: "from-blue-600 to-blue-700",
    gold: "from-amber-500 to-amber-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    steel: "from-slate-600 to-slate-700",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-4 shadow-lg`}>
      <div className="flex justify-between items-start mb-3">
        <div className="bg-white/20 rounded-lg p-2"><Icon name={icon} size={20} /></div>
        {trend && <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>{trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%</span>}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );
};

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// DASHBOARD
function Dashboard() {
  const lowStock = PRODUCTS.filter(p => p.stock <= p.reorderLevel);
  const overdueCustomers = CUSTOMERS.filter(c => c.overdue);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">لوحة التحكم</h1>
          <p className="text-slate-500 text-sm">الإثنين، 22 يناير 2024</p>
        </div>
        <div className="flex gap-2">
          <Badge color="blue">الفرع الرئيسي</Badge>
          <Badge color="green">متصل</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="إجمالي مبيعات اليوم" value="387,900 ج" icon="sales" color="blue" trend={12} />
        <StatCard label="إجمالي مشتريات اليوم" value="215,000 ج" icon="purchase" color="steel" trend={-5} />
        <StatCard label="رصيد الصندوق" value="124,500 ج" icon="money" color="green" />
        <StatCard label="رصيد البنك" value="892,300 ج" icon="accounts" color="gold" />
        <StatCard label="إجمالي المخزون" value="142 طن" icon="warehouse" color="steel" />
        <StatCard label="حركة البسكول اليوم" value="7 شاحنات" icon="truck" color="blue" />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-yellow-500"><Icon name="warning" size={20} /></div>
            <h3 className="font-bold text-slate-800">أصناف منخفضة الكمية</h3>
            <Badge color="yellow">{lowStock.length}</Badge>
          </div>
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-100">
                <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">متاح: {p.stock} {p.unit}</span>
                  <Badge color="red">تحت الحد</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-red-500"><Icon name="customers" size={20} /></div>
            <h3 className="font-bold text-slate-800">عملاء متأخرون في السداد</h3>
            <Badge color="red">{overdueCustomers.length}</Badge>
          </div>
          <div className="space-y-2">
            {overdueCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-bold">{c.balance.toLocaleString()} ج</span>
                  <Badge color="red">متأخر</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="p-4">
        <h3 className="font-bold text-slate-800 mb-4">آخر المبيعات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["رقم الفاتورة", "التاريخ", "العميل", "الإجمالي", "المدفوع", "الحالة"].map(h => (
                  <th key={h} className="text-right py-2 px-3 text-slate-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALES.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-blue-600 font-semibold">{s.id}</td>
                  <td className="py-2 px-3 text-slate-600">{s.date}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{s.customer}</td>
                  <td className="py-2 px-3 font-bold text-slate-800">{s.total.toLocaleString()} ج</td>
                  <td className="py-2 px-3 text-green-600 font-semibold">{s.paid.toLocaleString()} ج</td>
                  <td className="py-2 px-3"><Badge color={s.status === "مكتمل" ? "green" : "yellow"}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// PRODUCTS
function ProductsScreen() {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p => p.name.includes(search) || p.id.includes(search));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">إدارة الأصناف</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Icon name="plus" size={16} /> صنف جديد
        </button>
      </div>
      <Card className="p-4">
        <div className="relative mb-4">
          <Icon name="search" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="بحث بالاسم أو الكود..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 rounded-lg">
                {["الكود", "الاسم", "النوع", "المقاس", "الوحدة", "سعر الشراء", "سعر البيع", "المخزون", "الحالة"].map(h => (
                  <th key={h} className="text-right py-3 px-3 text-slate-600 font-bold first:rounded-r-lg last:rounded-l-lg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer">
                  <td className="py-3 px-3 font-mono text-xs text-blue-700 font-bold">{p.id}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{p.name}</td>
                  <td className="py-3 px-3"><Badge color="blue">{p.type}</Badge></td>
                  <td className="py-3 px-3 text-slate-600">{p.size}</td>
                  <td className="py-3 px-3 text-slate-600">{p.unit}</td>
                  <td className="py-3 px-3 text-slate-700">{p.buyPrice.toLocaleString()} ج</td>
                  <td className="py-3 px-3 font-bold text-green-700">{p.sellPrice.toLocaleString()} ج</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${p.stock <= p.reorderLevel ? "text-red-600" : "text-slate-700"}`}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge color={p.stock <= p.reorderLevel ? "red" : "green"}>
                      {p.stock <= p.reorderLevel ? "منخفض" : "متاح"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// CUSTOMERS
function CustomersScreen() {
  const [active, setActive] = useState(null);
  if (active) {
    const c = CUSTOMERS.find(x => x.id === active);
    return (
      <div className="space-y-4">
        <button onClick={() => setActive(null)} className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800">
          ← العودة للقائمة
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3">
                {c.name[0]}
              </div>
              <h2 className="font-black text-slate-800 text-lg">{c.name}</h2>
              <p className="text-slate-500 text-sm">{c.id}</p>
            </div>
            <div className="space-y-3 text-sm">
              {[["الهاتف", c.phone], ["الحد الائتماني", `${c.credit.toLocaleString()} ج`], ["الرصيد المستحق", `${c.balance.toLocaleString()} ج`], ["آخر سداد", c.lastPayment]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800">{v}</span>
                </div>
              ))}
              <div className="pt-2"><Badge color={c.overdue ? "red" : "green"}>{c.overdue ? "متأخر في السداد" : "منتظم"}</Badge></div>
            </div>
          </Card>
          <Card className="p-5 col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">كشف الحساب</h3>
            <div className="space-y-2">
              {[
                { date: "2024-01-22", desc: "فاتورة مبيعات INV-001", debit: 76000, credit: 0 },
                { date: "2024-01-20", desc: "دفعة نقدية", debit: 0, credit: 30000 },
                { date: "2024-01-15", desc: "فاتورة مبيعات INV-000", debit: 50000, credit: 50000 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3 text-sm">
                  <span className="text-slate-500 w-24">{row.date}</span>
                  <span className="flex-1 text-slate-700 font-semibold text-right pr-4">{row.desc}</span>
                  <span className="w-24 text-center text-red-600 font-bold">{row.debit ? row.debit.toLocaleString() : "—"}</span>
                  <span className="w-24 text-center text-green-600 font-bold">{row.credit ? row.credit.toLocaleString() : "—"}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-red-500">إجمالي المديونية</p>
                <p className="font-black text-red-700">{c.balance.toLocaleString()} ج</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">إدارة العملاء</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Icon name="plus" size={16} /> عميل جديد
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CUSTOMERS.map(c => (
          <Card key={c.id} className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => setActive(c.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.phone} · {c.id}</p>
                </div>
              </div>
              <Badge color={c.overdue ? "red" : "green"}>{c.overdue ? "متأخر" : "منتظم"}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[["الحد الائتماني", `${c.credit.toLocaleString()} ج`, "blue"], ["الرصيد", `${c.balance.toLocaleString()} ج`, c.balance > 0 ? "red" : "green"], ["آخر سداد", c.lastPayment, "gray"]].map(([k, v, col]) => (
                <div key={k} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-slate-500 mb-1">{k}</p>
                  <p className={`text-xs font-bold ${col === "red" ? "text-red-600" : col === "green" ? "text-green-600" : "text-slate-700"}`}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// SUPPLIERS
function SuppliersScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">إدارة الموردين</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Icon name="plus" size={16} /> مورد جديد
        </button>
      </div>
      <div className="space-y-3">
        {SUPPLIERS.map(s => (
          <Card key={s.id} className="p-4 hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.phone} · {s.id}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500">المستحقات</p>
                <p className={`font-black text-lg ${s.balance > 0 ? "text-red-600" : "text-green-600"}`}>{s.balance.toLocaleString()} ج</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-semibold border border-slate-200">كشف الحساب</button>
              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-semibold border border-blue-200">أمر شراء</button>
              <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg text-xs font-semibold border border-green-200">تسجيل دفعة</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// MANUFACTURING
function ManufacturingScreen() {
  const [active, setActive] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const calcCosts = (order) => {
    const materialsCost = order.rawMaterials.reduce((s, m) => s + m.qtyNeeded * m.unitCost, 0);
    const totalCost = materialsCost + order.operatingCost + order.transportCost;
    const expectedProfit = order.expectedRevenue - totalCost;
    const actualProfit = order.actualRevenue ? order.actualRevenue - totalCost : null;
    return { materialsCost, totalCost, expectedProfit, actualProfit };
  };

  const statusColor = (s) => s === "مكتمل" ? "green" : s === "قيد التنفيذ" ? "blue" : "yellow";

  if (active) {
    const order = MANUFACTURING_ORDERS.find(o => o.id === active);
    const { materialsCost, totalCost, expectedProfit, actualProfit } = calcCosts(order);
    return (
      <div className="space-y-4">
        <button onClick={() => setActive(null)} className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800">
          ← العودة لأوامر التصنيع
        </button>

        {/* Header */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-black text-xl text-slate-800">{order.id}</h2>
                <Badge color={statusColor(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-slate-500 text-sm">{order.product}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500">تاريخ التسليم</p>
              <p className="font-bold text-slate-800">{order.deliveryDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[["العميل", order.customer], ["الكمية", `${order.qty} ${order.unit}`], ["تاريخ البدء", order.startDate], ["الهالك", order.waste > 0 ? `${order.waste} ${order.wasteUnit}` : "لا يوجد"]].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm font-bold text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Raw Materials */}
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon name="warehouse" size={18} /> المواد الخام المستخدمة
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["الصنف", "الكمية المطلوبة", "تكلفة الوحدة", "التكلفة الإجمالية"].map(h => (
                  <th key={h} className="text-right py-2 px-3 text-slate-600 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.rawMaterials.map((m, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">{m.item}</td>
                  <td className="py-2 px-3 text-slate-600">{m.qtyNeeded} {m.unit}</td>
                  <td className="py-2 px-3 text-slate-600">{m.unitCost.toLocaleString()} ج</td>
                  <td className="py-2 px-3 font-bold text-slate-800">{(m.qtyNeeded * m.unitCost).toLocaleString()} ج</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs font-semibold border border-red-200">
              <Icon name="transfer" size={14} /> صرف المواد من المخزن (خصم تلقائي)
            </button>
            {order.waste > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg font-semibold">
                <Icon name="warning" size={14} /> هالك مسجل: {order.waste} {order.wasteUnit}
              </span>
            )}
          </div>
        </Card>

        {/* Cost & Profit */}
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon name="money" size={18} /> حساب التكلفة والربح
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              ["تكلفة المواد الخام", materialsCost, "slate"],
              ["تكلفة التشغيل", order.operatingCost, "slate"],
              ["تكلفة النقل", order.transportCost, "slate"],
              ["إجمالي التكلفة", totalCost, "red"],
            ].map(([k, v, col]) => (
              <div key={k} className={`rounded-lg p-3 text-center ${col === "red" ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className={`font-black ${col === "red" ? "text-red-700" : "text-slate-800"}`}>{v.toLocaleString()} ج</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 mb-1">الإيراد المتوقع</p>
              <p className="font-black text-xl text-blue-700">{order.expectedRevenue.toLocaleString()} ج</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-xs text-green-600 mb-1">الربح المتوقع</p>
              <p className="font-black text-xl text-green-700">{expectedProfit.toLocaleString()} ج</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${actualProfit !== null ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-xs mb-1 ${actualProfit !== null ? "text-amber-600" : "text-slate-400"}`}>الربح الفعلي</p>
              <p className={`font-black text-xl ${actualProfit !== null ? "text-amber-700" : "text-slate-400"}`}>
                {actualProfit !== null ? `${actualProfit.toLocaleString()} ج` : "لم يكتمل بعد"}
              </p>
            </div>
          </div>
        </Card>

        {order.status === "مكتمل" && (
          <Card className="p-5 border-2 border-green-200 bg-green-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-green-600"><Icon name="check" size={24} /></div>
                <div>
                  <p className="font-bold text-slate-800">تمت إضافة المنتج النهائي للمخزون</p>
                  <p className="text-xs text-slate-500">{order.qty} {order.unit} من "{order.product}" — التكلفة النهائية للوحدة: {(totalCost / order.qty).toLocaleString(undefined, { maximumFractionDigits: 0 })} ج</p>
                </div>
              </div>
              <Badge color="green">مضاف للمخزون</Badge>
            </div>
          </Card>
        )}

        {order.status !== "مكتمل" && (
          <button className="w-full bg-gradient-to-l from-green-600 to-green-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-800">
            <Icon name="check" size={18} /> إنهاء الأمر وإضافة المنتج للمخزون
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">التصنيع</h1>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Icon name="plus" size={16} /> أمر تصنيع جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="أوامر قيد التنفيذ" value={MANUFACTURING_ORDERS.filter(o => o.status === "قيد التنفيذ").length} icon="manufacturing" color="blue" />
        <StatCard label="أوامر مكتملة" value={MANUFACTURING_ORDERS.filter(o => o.status === "مكتمل").length} icon="check" color="green" />
        <StatCard label="بانتظار المواد" value={MANUFACTURING_ORDERS.filter(o => o.status === "بانتظار المواد").length} icon="warning" color="gold" />
        <StatCard label="إجمالي الأرباح المتوقعة" value={`${MANUFACTURING_ORDERS.reduce((s, o) => s + calcCosts(o).expectedProfit, 0).toLocaleString()} ج`} icon="money" color="steel" />
      </div>

      {showNew && (
        <Card className="p-5 border-2 border-blue-200 bg-blue-50/30">
          <h3 className="font-bold text-slate-800 mb-4">إنشاء أمر تصنيع جديد</h3>
          <div className="grid grid-cols-2 gap-4">
            {[["العميل", "اختر العميل"], ["المنتج النهائي", "اسم المنتج"], ["الكمية المطلوبة", "0"], ["تاريخ التسليم", "yyyy-mm-dd"]].map(([label, ph]) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder={ph} />
              </div>
            ))}
          </div>
          <div className="mt-4 bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-slate-500">
            سيتم إضافة المواد الخام وتفاصيل التكلفة بعد إنشاء الأمر
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold">إنشاء الأمر</button>
            <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold">إلغاء</button>
          </div>
        </Card>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {MANUFACTURING_ORDERS.map(o => {
          const { totalCost, expectedProfit } = calcCosts(o);
          return (
            <Card key={o.id} className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => setActive(o.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-xl p-2 text-blue-700"><Icon name="manufacturing" size={20} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">{o.id}</p>
                      <Badge color={statusColor(o.status)}>{o.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{o.product} · {o.customer}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">تسليم</p>
                  <p className="text-sm font-bold text-slate-700">{o.deliveryDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[["الكمية", `${o.qty} ${o.unit}`], ["تكلفة إجمالية", `${totalCost.toLocaleString()} ج`], ["ربح متوقع", `${expectedProfit.toLocaleString()} ج`], ["ربح فعلي", o.actualRevenue ? `${(o.actualRevenue - totalCost).toLocaleString()} ج` : "—"]].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">{k}</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manufacturing Reports */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Icon name="reports" size={18} /> تقارير التصنيع
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["أوامر التصنيع المنفذة", "تكلفة كل أمر", "استهلاك المواد الخام", "الأرباح"].map(r => (
            <button key={r} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-3 text-center transition-all">
              <p className="text-xs font-semibold text-slate-700">{r}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// HR
function HRScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">الموارد البشرية</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Icon name="plus" size={16} /> موظف جديد
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[["إجمالي الموظفين", EMPLOYEES.length, "blue"], ["الحاضرون اليوم", EMPLOYEES.filter(e => e.attendance === "حاضر").length, "green"], ["إجمالي الرواتب", `${EMPLOYEES.reduce((s, e) => s + e.salary, 0).toLocaleString()} ج`, "gold"]].map(([k, v, col]) => (
          <Card key={k} className={`p-4 border-r-4 ${col === "blue" ? "border-blue-500" : col === "green" ? "border-green-500" : "border-amber-500"}`}>
            <p className="text-2xl font-black text-slate-800">{v}</p>
            <p className="text-sm text-slate-500">{k}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-bold text-slate-800 mb-4">قائمة الموظفين</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              {["الكود", "الاسم", "الوظيفة", "الفرع", "الراتب", "الحضور"].map(h => (
                <th key={h} className="text-right py-3 px-3 text-slate-600 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-3 font-mono text-xs text-blue-700 font-bold">{e.id}</td>
                <td className="py-3 px-3 font-bold text-slate-800">{e.name}</td>
                <td className="py-3 px-3"><Badge color="blue">{e.role}</Badge></td>
                <td className="py-3 px-3 text-slate-600">{e.branch}</td>
                <td className="py-3 px-3 font-bold text-slate-800">{e.salary.toLocaleString()} ج</td>
                <td className="py-3 px-3"><Badge color={e.attendance === "حاضر" ? "green" : "red"}>{e.attendance}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// REPORTS
function ReportsScreen() {
  const reports = [
    { title: "تقرير المبيعات", icon: "sales", color: "blue", desc: "تفاصيل المبيعات حسب الفترة والعميل" },
    { title: "تقرير المشتريات", icon: "purchase", color: "steel", desc: "تفاصيل المشتريات حسب المورد" },
    { title: "تقرير المخزون", icon: "warehouse", color: "green", desc: "حركة الأصناف والمخزون الحالي" },
    { title: "الأرباح والخسائر", icon: "money", color: "gold", desc: "قائمة الدخل والمصروفات" },
    { title: "تقرير البسكول", icon: "truck", color: "blue", desc: "حركة الشاحنات والأوزان" },
    { title: "ميزان المراجعة", icon: "accounts", color: "steel", desc: "أرصدة الحسابات الختامية" },
    { title: "الأرباح حسب العميل", icon: "customers", color: "blue", desc: "هامش الربح لكل عميل" },
    { title: "الأرباح حسب الصنف", icon: "products", color: "green", desc: "هامش الربح لكل صنف" },
    { title: "الأرباح حسب الفرع", icon: "branch", color: "gold", desc: "مقارنة أداء الفروع" },
  ];
  const colors = { blue: "bg-blue-100 text-blue-700", steel: "bg-slate-100 text-slate-700", green: "bg-green-100 text-green-700", gold: "bg-amber-100 text-amber-700" };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-800">التقارير</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.title} className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-200 group">
            <div className={`w-12 h-12 ${colors[r.color]} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon name={r.icon} size={22} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{r.title}</h3>
            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">عرض</button>
              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 flex items-center justify-center gap-1">
                <Icon name="print" size={12} /> طباعة
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// PERMISSIONS
function PermissionsScreen() {
  const roles = [
    { name: "مدير النظام", color: "red", perms: ["المبيعات", "المشتريات", "المخزون", "الحسابات", "الموارد البشرية", "التقارير", "الإعدادات", "الصلاحيات"] },
    { name: "مدير فرع", color: "blue", perms: ["المبيعات", "المشتريات", "المخزون", "الحسابات", "تقارير الفرع"] },
    { name: "محاسب", color: "gold", perms: ["الحسابات", "التقارير المالية", "المبيعات (قراءة)", "المشتريات (قراءة)"] },
    { name: "مبيعات", color: "green", perms: ["الفواتير", "العملاء", "البسكول", "عروض الأسعار"] },
    { name: "مخزن", color: "steel", perms: ["استلام بضاعة", "صرف بضاعة", "الجرد", "تحويل مخزن"] },
  ];
  const roleColors = { red: "border-red-500 bg-red-50", blue: "border-blue-500 bg-blue-50", gold: "border-amber-500 bg-amber-50", green: "border-green-500 bg-green-50", steel: "border-slate-500 bg-slate-50" };
  const badgeColors = { red: "red", blue: "blue", gold: "gold", green: "green", steel: "gray" };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-800">إدارة الصلاحيات</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map(r => (
          <Card key={r.name} className={`p-4 border-r-4 ${roleColors[r.color]}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-800 text-lg">{r.name}</h3>
              <Badge color={badgeColors[r.color]}>{r.perms.length} صلاحية</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.perms.map(p => (
                <div key={p} className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                  <span className="text-green-500"><Icon name="check" size={12} /></span> {p}
                </div>
              ))}
            </div>
            <button className="mt-3 w-full border border-dashed border-slate-300 text-slate-500 py-1.5 rounded-lg text-xs font-semibold hover:bg-white">تعديل الصلاحيات</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// BACKUP
function BackupScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-800">النسخ الاحتياطي</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "نسخ احتياطي الآن", icon: "backup", desc: "إنشاء نسخة احتياطية فورية من جميع البيانات", action: "نسخ الآن", color: "blue" },
          { title: "استعادة نسخة", icon: "transfer", desc: "استعادة البيانات من نسخة احتياطية سابقة", action: "استعادة", color: "gold" },
          { title: "الحفظ السحابي", icon: "backup", desc: "رفع النسخة الاحتياطية على التخزين السحابي", action: "رفع سحابي", color: "green" },
        ].map(b => (
          <Card key={b.title} className="p-5 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${b.color === "blue" ? "bg-blue-100 text-blue-600" : b.color === "gold" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
              <Icon name={b.icon} size={28} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{b.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{b.desc}</p>
            <button className={`w-full py-2 rounded-lg text-sm font-bold text-white ${b.color === "blue" ? "bg-blue-600 hover:bg-blue-700" : b.color === "gold" ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}`}>
              {b.action}
            </button>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h3 className="font-bold text-slate-800 mb-4">سجل النسخ الاحتياطية</h3>
        <div className="space-y-2">
          {[
            { date: "2024-01-22 02:00", type: "تلقائي", size: "45.2 MB", status: "ناجح" },
            { date: "2024-01-21 02:00", type: "تلقائي", size: "44.8 MB", status: "ناجح" },
            { date: "2024-01-20 15:30", type: "يدوي", size: "44.5 MB", status: "ناجح" },
            { date: "2024-01-19 02:00", type: "تلقائي", size: "43.9 MB", status: "ناجح" },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="text-green-500"><Icon name="check" size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{b.date}</p>
                  <p className="text-xs text-slate-500">{b.type} · {b.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color="green">{b.status}</Badge>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">استعادة</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// BRANCHES
function BranchesScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-800">إدارة الفروع</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { name: "الفرع الرئيسي", address: "القاهرة - شارع السلام", manager: "أحمد محمود", salesDay: 250000, purchaseDay: 150000, stock: 95 },
          { name: "الفرع الثاني", address: "الجيزة - الهرم", manager: "محمد عمر", salesDay: 137900, purchaseDay: 65000, stock: 47 },
        ].map(b => (
          <Card key={b.name} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Icon name="branch" size={22} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">{b.name}</h3>
                <p className="text-xs text-slate-500">{b.address}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[["مبيعات اليوم", `${b.salesDay.toLocaleString()} ج`, "text-blue-700"], ["مشتريات اليوم", `${b.purchaseDay.toLocaleString()} ج`, "text-slate-700"], ["المخزون (طن)", b.stock, "text-green-700"]].map(([k, v, cls]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className={`font-black ${cls}`}>{v}</p>
                  <p className="text-xs text-slate-500 mt-1">{k}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mb-3">المدير: <strong className="text-slate-700">{b.manager}</strong></p>
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100">تقرير الفرع</button>
              <button className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center justify-center gap-1">
                <Icon name="transfer" size={14} /> تحويل بضاعة
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "الرئيسية", icon: "dashboard" },
  { id: "branches", label: "الفروع", icon: "branch" },
  { id: "products", label: "الأصناف", icon: "products" },
  { id: "warehouse", label: "المخازن", icon: "warehouse" },
  { id: "manufacturing", label: "التصنيع", icon: "manufacturing" },
  { id: "suppliers", label: "الموردون", icon: "suppliers" },
  { id: "customers", label: "العملاء", icon: "customers" },
  { id: "sales", label: "المبيعات", icon: "sales" },
  { id: "purchases", label: "المشتريات", icon: "purchase" },
  { id: "accounts", label: "الحسابات", icon: "accounts" },
  { id: "hr", label: "الموارد البشرية", icon: "hr" },
  { id: "reports", label: "التقارير", icon: "reports" },
  { id: "permissions", label: "الصلاحيات", icon: "permissions" },
  { id: "backup", label: "النسخ الاحتياطي", icon: "backup" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const renderScreen = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "branches": return <BranchesScreen />;
      case "products": return <ProductsScreen />;
      case "customers": return <CustomersScreen />;
      case "suppliers": return <SuppliersScreen />;
      case "manufacturing": return <ManufacturingScreen />;
      case "hr": return <HRScreen />;
      case "reports": return <ReportsScreen />;
      case "permissions": return <PermissionsScreen />;
      case "backup": return <BackupScreen />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-slate-300 mb-4 flex justify-center"><Icon name={NAV_ITEMS.find(n => n.id === active)?.icon || "dashboard"} size={48} /></div>
              <h2 className="text-xl font-bold text-slate-600">{NAV_ITEMS.find(n => n.id === active)?.label}</h2>
              <p className="text-slate-400 text-sm mt-2">هذه الشاشة قيد التطوير</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans" dir="rtl" style={{ fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-slate-900 font-black text-sm">A</span>
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-white font-black text-sm">AYSC</div>
              <div className="text-slate-400 text-xs">تجارة الحديد</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${active === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
              <span className="flex-shrink-0"><Icon name={item.icon} size={17} /></span>
              {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">{user.name}</div>
                <div className="text-slate-400 text-xs truncate">{user.role}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} className="mt-2 w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs py-1 px-2 rounded-lg hover:bg-slate-700 transition-all">
              <Icon name="logout" size={14} /> تسجيل الخروج
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-gray-100">
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <span className="font-black text-slate-800">{NAV_ITEMS.find(n => n.id === active)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-amber-700">الحديد 14,850 ج/طن</span>
            </div>
            <button className="relative text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-gray-100">
              <Icon name="bell" size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{user.role}</p>
                <p className="text-xs text-slate-500">{user.branch}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
