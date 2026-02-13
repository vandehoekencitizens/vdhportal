import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  User, 
  Wallet, 
  CreditCard,
  Shield,
  Loader2,
  Send,
  ShoppingCart,
  Home as HomeIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TransactionHistory from '@/components/TransactionHistory';
import PersonalizedDashboard from '@/components/PersonalizedDashboard';

export default function AccountLookup() {
  const [currentUser, setCurrentUser] = useState(null);

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['my-account', currentUser?.email],
    queryFn: async () => {
      const accounts = await base44.entities.Account.filter({ user_email: currentUser.email });
      
      // If no account exists, create one automatically
      if (!accounts || accounts.length === 0) {
        const vntId = `VNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newAccount = await base44.entities.Account.create({
          vnt_id: vntId,
          user_email: currentUser.email,
          balance: 0
        });
        return newAccount;
      }
      
      return accounts[0];
    },
    enabled: !!currentUser
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        console.error('Not authenticated');
      }
    };
    loadUser();
  }, []);

  if (!currentUser || accountLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-[#1e3a5f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
            <HomeIcon className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e8c547] rounded-2xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">My Account</h1>
              <p className="text-slate-300">VNT Treasury Account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <PersonalizedDashboard user={currentUser} />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Transaction History</h2>
          {currentUser && <TransactionHistory userEmail={currentUser.email} />}
        </div>
      </div>
    </div>
  );
}
