import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';

const mockSalesData = [
  { name: 'Mon', sales: 1200000 },
  { name: 'Tue', sales: 1800000 },
  { name: 'Wed', sales: 1500000 },
  { name: 'Thu', sales: 2100000 },
  { name: 'Fri', sales: 2800000 },
  { name: 'Sat', sales: 3400000 },
  { name: 'Sun', sales: 2900000 },
];

const mockBestSellers = [
  { id: 1, name: 'Summer Breeze Dress', category: 'Dresses', sold: 45, revenue: 6750000 },
  { id: 2, name: 'Classic Leather Tote', category: 'Bags', sold: 32, revenue: 11200000 },
  { id: 3, name: 'Strappy Evening Heels', category: 'Heels', sold: 28, revenue: 7000000 },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('weekly');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Reports & Analytics</h2>
          <p className="text-stone-500 text-sm mt-1">Track your store's performance and sales trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-sm"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-medium text-stone-500">Gross Revenue</h3>
          </div>
          <p className="text-2xl font-medium text-stone-900">UGX 15,700,000</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
            <span className="text-stone-400 font-normal ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-stone-500">Items Sold</h3>
          </div>
          <p className="text-2xl font-medium text-stone-900">243</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-blue-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+5.2%</span>
            <span className="text-stone-400 font-normal ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-stone-500">Total Orders</h3>
          </div>
          <p className="text-2xl font-medium text-stone-900">186</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-purple-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+8.1%</span>
            <span className="text-stone-400 font-normal ml-1">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm p-6">
          <h3 className="font-medium text-stone-900 mb-6">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} tickFormatter={(val) => `UGX ${val / 1000}k`} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#1c1917" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-stone-200">
            <h3 className="font-medium text-stone-900">Best Sellers</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockBestSellers.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-900 truncate">{item.name}</p>
                  <p className="text-xs text-stone-500">{item.category} • {item.sold} sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-sm text-stone-900">UGX {item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
