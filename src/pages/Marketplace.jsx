import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  ShoppingBag, 
  Package, 
  Search,
  ArrowLeft,
  Tag,
  Boxes,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { toast } from 'sonner';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['marketplace-items'],
    queryFn: () => base44.entities.MarketplaceItem.list(),
    retry: 2
  });

  const { data: myAccount } = useQuery({
    queryKey: ['my-account', currentUser?.email],
    queryFn: async () => {
      const accounts = await base44.entities.Account.filter({ user_email: currentUser.email });
      return accounts[0] || null;
    },
    enabled: !!currentUser
  });

  const purchaseMutation = useMutation({
    mutationFn: async (item) => {
      if (!myAccount) throw new Error('Account not found');
      if (myAccount.balance < item.price) throw new Error('Insufficient balance');
      if (item.stock < 1) throw new Error('Item out of stock');

      // Update account balance
      await base44.entities.Account.update(myAccount.id, {
        ...myAccount,
        balance: myAccount.balance - item.price
      });

      // Update item stock
      await base44.entities.MarketplaceItem.update(item.id, {
        ...item,
        stock: item.stock - 1
      });

      // Create transaction
      await base44.entities.Transaction.create({
        type: 'purchase',
        amount: item.price,
        from_vnt_id: myAccount.vnt_id,
        from_email: currentUser.email,
        description: `Purchased: ${item.name}`,
        item_name: item.name,
        status: 'completed'
      });

      // Send email confirmation
      await base44.integrations.Core.SendEmail({
        to: currentUser.email,
        subject: 'Purchase Confirmation - Vandehoeken Marketplace',
        body: `Your purchase has been completed!\n\nItem: ${item.name}\nPrice: ${item.price} VHS\nNew Balance: ${myAccount.balance - item.price} VHS\n\nThank you for your purchase!`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace-items']);
      queryClient.invalidateQueries(['my-account']);
      toast.success('Purchase successful! Check your email for confirmation.');
    },
    onError: (error) => {
      toast.error(error.message || 'Purchase failed');
    }
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-emerald-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Government Marketplace</h1>
              <p className="text-emerald-200">Official goods and services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {myAccount && (
          <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Available Balance</p>
                  <p className="text-3xl font-bold">{myAccount.balance.toLocaleString()} VHS</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white border-0 shadow-xl mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search marketplace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-slate-200 focus:border-emerald-500 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Marketplace</h3>
              <p className="text-slate-600 mb-4">Unable to fetch items at this time</p>
              <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-8 h-8 text-emerald-600" />
                      </div>
                      <Badge 
                        variant={item.stock > 20 ? "default" : item.stock > 0 ? "secondary" : "destructive"}
                        className={item.stock > 20 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                      >
                        <Boxes className="w-3 h-3 mr-1" />
                        {item.stock} in stock
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-2xl font-bold text-slate-800">{item.price}</span>
                        <span className="text-sm text-slate-500">VHS</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-4"
                        disabled={item.stock === 0 || !myAccount || purchaseMutation.isPending}
                        onClick={() => purchaseMutation.mutate(item)}
                      >
                        {purchaseMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : item.stock > 0 ? 'Purchase' : 'Out of Stock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Items Available</h3>
              <p className="text-slate-600">Check back later for new items</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
