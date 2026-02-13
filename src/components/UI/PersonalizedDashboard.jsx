import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { 
  Wallet, 
  TrendingUp, 
  ShoppingBag, 
  Briefcase,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonalizedDashboard({ user }) {
  const { data: account } = useQuery({
    queryKey: ['account', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.Account.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['recent-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ from_email: user.email }, '-created_date', 5),
    enabled: !!user
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-requests', user?.email],
    queryFn: () => base44.entities.ServiceRequest.filter({ 
      user_email: user.email, 
      status: 'pending' 
    }),
    enabled: !!user
  });

  const { data: activeJobs = [] } = useQuery({
    queryKey: ['active-jobs', user?.email],
    queryFn: () => base44.entities.JobAssignment.filter({ 
      user_email: user.email, 
      status: 'active' 
    }),
    enabled: !!user
  });

  if (!account) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const quickStats = [
    {
      icon: Wallet,
      label: 'Balance',
      value: `${account.balance.toLocaleString()} VHS`,
      color: 'from-emerald-500 to-emerald-600',
      link: createPageUrl('AccountLookup')
    },
    {
      icon: TrendingUp,
      label: 'Transactions',
      value: recentTransactions.length,
      color: 'from-blue-500 to-blue-600',
      link: createPageUrl('AccountLookup')
    },
    {
      icon: FileText,
      label: 'Pending Requests',
      value: pendingRequests.length,
      color: 'from-amber-500 to-amber-600',
      link: createPageUrl('ServiceRequests')
    },
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: activeJobs.length,
      color: 'from-purple-500 to-purple-600',
      link: createPageUrl('Employment')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user.full_name || 'Citizen'}!</h2>
              <p className="text-slate-200">VNT ID: {account.vnt_id}</p>
            </div>
            <div className="hidden sm:block w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <Wallet className="w-10 h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <Link key={idx} to={stat.link}>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to={createPageUrl('Marketplace')}>
              <Button className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
            <Link to={createPageUrl('Employment')}>
              <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                <Briefcase className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </Link>
            <Link to={createPageUrl('ServiceRequests')}>
              <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                <FileText className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentTransactions.length > 0 && (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">Recent Transactions</h3>
              <Link to={createPageUrl('AccountLookup')}>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{txn.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(txn.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-slate-800">
                    -{txn.amount} VHS
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
