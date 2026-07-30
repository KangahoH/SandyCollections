import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Filter, Package, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  stock_qty?: number; // Aggregated for UI
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, we'd fetch from supabase.
    // We'll use mock data for the UI preview while the DB is unseeded.
    setTimeout(() => {
      setProducts([
        { id: '1', name: 'Summer Breeze Dress', category: 'Dresses', base_price: 45.00, stock_qty: 12 },
        { id: '2', name: 'Classic Leather Tote', category: 'Bags', base_price: 85.00, stock_qty: 4 },
        { id: '3', name: 'Gold Loop Earrings', category: 'Jewelry', base_price: 25.00, stock_qty: 0 },
        { id: '4', name: 'Strappy Evening Heels', category: 'Heels', base_price: 65.00, stock_qty: 8 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Inventory</h2>
          <p className="text-stone-500 text-sm mt-1">Manage catalog, variants, and stock levels.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-500">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200">
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-stone-400" />
                        </div>
                        <span className="font-medium text-stone-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                      ${product.base_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {product.stock_qty === 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Out of stock
                          </span>
                        ) : product.stock_qty && product.stock_qty <= 5 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Low ({product.stock_qty})
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-sm font-medium">
                            {product.stock_qty} in stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-stone-900 hover:text-stone-600">Edit</button>
                    </td>
                  </tr>
                ))}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
