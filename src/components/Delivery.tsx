import { useState } from 'react';
import { Search, MapPin, Phone, Truck, CheckCircle, Package, Clock, ChevronRight } from 'lucide-react';

const mockDeliveries = [
  { id: 'ORD-1042', customer: 'Jane Doe', address: '123 Palm Ave, East Legon', phone: '055-123-4567', status: 'out_for_delivery', fee: 15000, items: 3 },
  { id: 'ORD-1043', customer: 'Alice Smith', address: '45C Airport Res., Accra', phone: '024-987-6543', status: 'packed', fee: 10000, items: 1 },
  { id: 'ORD-1044', customer: 'Bob Jones', address: 'Block 2, Roman Ridge', phone: '020-555-0103', status: 'placed', fee: 12000, items: 2 },
  { id: 'ORD-1045', customer: 'Mary Mensah', address: 'Osu Oxford St.', phone: '027-111-2222', status: 'delivered', fee: 10000, items: 4 },
];

const statusLabels: Record<string, { label: string, color: string, icon: any }> = {
  placed: { label: 'Placed', color: 'bg-stone-100 text-stone-600', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  packed: { label: 'Packed', color: 'bg-purple-100 text-purple-700', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-amber-100 text-amber-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  returned: { label: 'Returned', color: 'bg-red-100 text-red-700', icon: Clock },
};

export default function Delivery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const filteredDeliveries = mockDeliveries.filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = !['delivered', 'returned'].includes(d.status);
    return matchesSearch && (activeTab === 'active' ? isActive : !isActive);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Delivery & Fulfillment</h2>
          <p className="text-stone-500 text-sm mt-1">Manage order dispatch and courier tracking.</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50">
          <div className="flex p-1 bg-stone-200/50 rounded-lg self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'completed' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-stone-200">
          {filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              No deliveries found in this view.
            </div>
          ) : (
            filteredDeliveries.map((delivery) => {
              const status = statusLabels[delivery.status];
              const StatusIcon = status.icon;

              return (
                <div key={delivery.id} className="p-4 sm:p-6 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-stone-100 items-center justify-center shrink-0">
                      <Truck className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-stone-900">{delivery.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-stone-900 font-medium">{delivery.customer}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-stone-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {delivery.address}</span>
                        <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {delivery.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-stone-100 sm:border-0 pt-4 sm:pt-0">
                    <div className="text-sm">
                      <p className="text-stone-500 text-right">Items: <span className="font-medium text-stone-900">{delivery.items}</span></p>
                      <p className="text-stone-500 text-right">Fee: <span className="font-medium text-stone-900">UGX {delivery.fee.toLocaleString()}</span></p>
                    </div>
                    <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
