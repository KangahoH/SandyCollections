import { useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { LogOut, Package, ShoppingBag, Users, FileText, Truck, Shield, ChevronLeft } from 'lucide-react';
import Inventory from './Inventory';
import PointOfSale from './PointOfSale';
import Reports from './Reports';
import Delivery from './Delivery';
import Staff from './Staff';

interface DashboardProps {
  userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback for preview mode before DB is provisioned
        setProfile({
          id: userId,
          name: 'Preview User',
          role: 'owner',
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Define modules based on PRD
  const modules = [
    { id: 'pos', name: 'Point of Sale', icon: ShoppingBag, desc: 'Process sales & checkout', allowed: ['owner', 'manager', 'sales'] },
    { id: 'inventory', name: 'Inventory', icon: Package, desc: 'Manage catalog & stock', allowed: ['owner', 'manager'] },
    { id: 'reports', name: 'Reports', icon: FileText, desc: 'Sales & performance analytics', allowed: ['owner', 'accountant'] },
    { id: 'delivery', name: 'Delivery', icon: Truck, desc: 'Track order fulfillment', allowed: ['owner', 'manager', 'delivery'] },
    { id: 'staff', name: 'Staff & Roles', icon: Users, desc: 'Manage access & audit logs', allowed: ['owner'] },
  ];

  const roleLabels: Record<string, string> = {
    owner: 'Store Owner',
    manager: 'Store Manager',
    sales: 'Sales Associate',
    delivery: 'Delivery Coordinator',
    accountant: 'Accountant',
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <PointOfSale />;
      case 'reports':
        return <Reports />;
      case 'delivery':
        return <Delivery />;
      case 'staff':
        return <Staff />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {activeModule ? (
                <button 
                  onClick={() => setActiveModule(null)}
                  className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors mr-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>
              ) : (
                <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-serif text-xl text-stone-900 tracking-tight">Sandy Collections</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-stone-900">{profile?.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                    {profile?.role ? roleLabels[profile.role] : 'Staff'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeModule ? (
          renderActiveModule()
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-medium text-stone-900">Welcome back, {profile?.name?.split(' ')[0]}</h1>
              <p className="mt-2 text-stone-500">Select a module to manage your store operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod) => {
                const hasAccess = profile?.role && mod.allowed.includes(profile.role);
                const Icon = mod.icon;
                
                return (
                  <div
                    key={mod.id}
                    onClick={() => hasAccess && setActiveModule(mod.id)}
                    className={`relative group bg-white p-6 rounded-2xl border transition-all ${
                      hasAccess 
                        ? 'border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 cursor-pointer' 
                        : 'border-stone-100 bg-stone-50/50 opacity-75 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${hasAccess ? 'bg-stone-100 text-stone-900' : 'bg-stone-100 text-stone-400'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {!hasAccess && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                          No Access
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-medium ${hasAccess ? 'text-stone-900' : 'text-stone-500'}`}>
                      {mod.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {mod.desc}
                    </p>
                    {hasAccess && (
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-stone-900/5 rounded-2xl pointer-events-none transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
