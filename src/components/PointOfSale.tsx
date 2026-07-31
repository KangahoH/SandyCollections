import { useState } from 'react';
import { Search, ShoppingBag, Plus, Minus, CreditCard, Banknote, Smartphone, Trash2, CheckCircle, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
}

export default function PointOfSale() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card');
  const [enableEfris, setEnableEfris] = useState(true);
  
  // Checkout flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<{ id: string, efrisFdn?: string } | null>(null);

  // Mock catalog
  const catalog = [
    { id: 'v1', product_id: '1', name: 'Summer Breeze Dress', variant: 'Medium - Blue', price: 150000 },
    { id: 'v2', product_id: '1', name: 'Summer Breeze Dress', variant: 'Large - Red', price: 150000 },
    { id: 'v3', product_id: '2', name: 'Classic Leather Tote', variant: 'One Size - Black', price: 350000 },
    { id: 'v4', product_id: '4', name: 'Strappy Evening Heels', variant: 'Size 8 - Gold', price: 250000 },
  ];

  const filteredCatalog = catalog.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.variant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item: typeof catalog[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, variant: item.variant, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate API call to process sale and optionally sync with EFRIS
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedSale({
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        efrisFdn: enableEfris ? `URA-${Math.floor(Math.random() * 1000000000)}` : undefined,
      });
      setCart([]);
    }, 1500);
  };

  const resetSale = () => {
    setCompletedSale(null);
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax for demo (would be VAT for URA)
  const total = subtotal + tax;

  if (completedSale) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-medium text-stone-900 mb-2">Sale Complete</h2>
          <p className="text-stone-500 mb-6">Order #{completedSale.id} has been processed successfully.</p>
          
          {completedSale.efrisFdn && (
            <div className="bg-stone-50 p-4 rounded-xl text-sm border border-stone-100 mb-6 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-2 text-stone-700 font-medium mb-1">
                <FileText className="w-4 h-4" /> EFRIS Receipt Generated
              </div>
              <div className="text-stone-500">FDN: <span className="font-mono text-stone-900">{completedSale.efrisFdn}</span></div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.print()}
              className="w-full py-2.5 px-4 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
            >
              Print Receipt
            </button>
            <button 
              onClick={resetSale}
              className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Left side: Product Selection */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Point of Sale</h2>
          <p className="text-stone-500 text-sm mt-1">Select items for the customer's order.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search catalog or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCatalog.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex flex-col text-left p-4 rounded-xl border border-stone-100 bg-stone-50 hover:bg-stone-100 hover:border-stone-200 transition-all group"
              >
                <div className="font-medium text-stone-900 group-hover:text-stone-900">{item.name}</div>
                <div className="text-xs text-stone-500 mt-1">{item.variant}</div>
                <div className="font-medium text-stone-900 mt-3">UGX {item.price.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Cart / Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <h3 className="font-medium text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Current Order
          </h3>
          <span className="text-sm text-stone-500">{cart.length} items</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
              Cart is empty
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-500">{item.variant}</div>
                  <div className="text-sm font-medium text-stone-900 mt-1">UGX {item.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span>UGX {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Tax (8%)</span>
              <span>UGX {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium text-lg text-stone-900 pt-2">
              <span>Total</span>
              <span>UGX {total.toLocaleString()}</span>
            </div>
          </div>
          
          {/* EFRIS Toggle */}
          <div className="flex items-center justify-between py-2 border-y border-stone-200/60">
            <div>
              <span className="block text-sm font-medium text-stone-900">Sync to EFRIS</span>
              <span className="block text-xs text-stone-500">Generate URA receipt for this sale</span>
            </div>
            <button 
              onClick={() => setEnableEfris(!enableEfris)}
              className={`p-1 rounded-full transition-colors ${enableEfris ? 'text-emerald-600' : 'text-stone-400'}`}
            >
              {enableEfris ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'card' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                <CreditCard className="w-4 h-4 mb-1" /> Card
              </button>
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'cash' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                <Banknote className="w-4 h-4 mb-1" /> Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('mobile')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'mobile' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                <Smartphone className="w-4 h-4 mb-1" /> Mobile
              </button>
            </div>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Sale'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
