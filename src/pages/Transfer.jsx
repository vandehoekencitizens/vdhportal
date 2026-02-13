import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { toast } from 'sonner';

export default function Transfer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    to_vnt_id: '',
    amount: 0,
    description: ''
  });
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

  const { data: myAccount, error: accountError } = useQuery({
    queryKey: ['my-account', currentUser?.email],
    queryFn: async () => {
      const accounts = await base44.entities.Account.filter({ user_email: currentUser.email });
      return accounts[0] || null;
    },
    enabled: !!currentUser,
    retry: 2
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: () => base44.entities.Account.list(),
    enabled: !!currentUser
  });

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      if (!myAccount) throw new Error('Your account not found');
      
      const toAccount = allAccounts.find(a => a.vnt_id === data.to_vnt_id);
      if (!toAccount) throw new Error('Recipient account not found');
      
      if (myAccount.balance < data.amount) throw new Error('Insufficient balance');
      if (data.amount <= 0) throw new Error('Amount must be greater than 0');

      // Update balances
      await base44.entities.Account.update(myAccount.id, {
        ...myAccount,
        balance: myAccount.balance - data.amount
      });
      await base44.entities.Account.update(toAccount.id, {
        ...toAccount,
        balance: toAccount.balance + data.amount
      });

      // Create transaction
      await base44.entities.Transaction.create({
        type: 'transfer_sent',
        amount: data.amount,
        from_vnt_id: myAccount.vnt_id,
        to_vnt_id: data.to_vnt_id,
        from_email: currentUser.email,
        to_email: toAccount.user_email,
        description: data.description || 'Money transfer',
        status: 'completed'
      });

      // Send email confirmations
      await base44.integrations.Core.SendEmail({
        to: currentUser.email,
        subject: 'Transfer Sent - Vandehoeken Treasury',
        body: `Your transfer has been completed!\n\nAmount: ${data.amount} VHS\nTo: ${data.to_vnt_id}\nDescription: ${data.description}\n\nNew Balance: ${myAccount.balance - data.amount} VHS`
      });

      await base44.integrations.Core.SendEmail({
        to: toAccount.user_email,
        subject: 'Transfer Received - Vandehoeken Treasury',
        body: `You have received a transfer!\n\nAmount: ${data.amount} VHS\nFrom: ${myAccount.vnt_id}\nDescription: ${data.description}\n\nNew Balance: ${toAccount.balance + data.amount} VHS`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-account']);
      toast.success('Transfer successful! Email confirmations sent.');
      setFormData({ to_vnt_id: '', amount: 0, description: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Transfer failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    transferMutation.mutate(formData);
  };

  if (accountError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Account Error</h3>
            <p className="text-slate-600 mb-4">Unable to load your account information</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || !myAccount) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('AccountLookup')} className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Send className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Transfer Money</h1>
              <p className="text-blue-200">Send VHS to another VNT account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <Card className="bg-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Your Balance:</strong> {myAccount.balance.toLocaleString()} VHS
              </p>
              <p className="text-sm text-blue-800">
                <strong>Your VNT ID:</strong> {myAccount.vnt_id}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Recipient VNT ID</Label>
                <Input
                  value={formData.to_vnt_id}
                  onChange={(e) => setFormData({...formData, to_vnt_id: e.target.value})}
                  placeholder="VNT-0002"
                  required
                />
              </div>
              
              <div>
                <Label>Amount (VHS)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  min="1"
                  max={myAccount.balance}
                  required
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this transfer for?"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Transfer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
