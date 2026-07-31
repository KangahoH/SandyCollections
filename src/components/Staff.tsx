import { useState } from 'react';
import { Shield, User, Clock, Search, MoreVertical, Edit2, ShieldAlert } from 'lucide-react';

const mockStaff = [
  { id: '1', name: 'Sandy Mensah', email: 'sandy@sandycollections.com', role: 'owner', status: 'active' },
  { id: '2', name: 'John Doe', email: 'john@sandycollections.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Jane Smith', email: 'jane@sandycollections.com', role: 'sales', status: 'active' },
  { id: '4', name: 'Kofi Osei', email: 'kofi@sandycollections.com', role: 'delivery', status: 'active' },
];

const mockAuditLogs = [
  { id: '1', user: 'Jane Smith', action: 'Created Sale', entity: 'Sale', entityId: 'ORD-1045', time: '10 mins ago', date: 'Oct 24, 2023' },
  { id: '2', user: 'John Doe', action: 'Adjusted Stock', entity: 'Variant', entityId: 'SKU-092 (Summer Dress)', time: '1 hour ago', date: 'Oct 24, 2023' },
  { id: '3', user: 'Sandy Mensah', action: 'Refund Override', entity: 'Sale', entityId: 'ORD-1042', time: '3 hours ago', date: 'Oct 24, 2023' },
  { id: '4', user: 'Kofi Osei', action: 'Updated Delivery', entity: 'Order', entityId: 'ORD-1033', time: 'Yesterday', date: 'Oct 23, 2023' },
];

export default function Staff() {
  const [activeTab, setActiveTab] = useState<'staff' | 'audit'>('staff');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Staff & Roles</h2>
          <p className="text-stone-500 text-sm mt-1">Manage team access and view security logs.</p>
        </div>
        {activeTab === 'staff' && (
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors">
            <User className="w-4 h-4" />
            Invite Staff
          </button>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50">
          <div className="flex p-1 bg-stone-200/50 rounded-lg self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'staff' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Team Directory
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Audit Logs
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'staff' ? 'staff' : 'logs'}...`}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all shadow-sm"
            />
          </div>
        </div>

        {activeTab === 'staff' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-stone-200">
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockStaff.map((person) => (
                  <tr key={person.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-medium text-sm">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{person.name}</div>
                          <div className="text-sm text-stone-500">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700 capitalize">
                        <Shield className="w-3.5 h-3.5 text-stone-500" />
                        {person.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-stone-200">
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-stone-900 font-medium">{log.time}</span>
                        <span className="text-stone-500 text-xs">{log.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-stone-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-stone-700">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-stone-500">{log.entity}: </span>
                      <span className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">{log.entityId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
