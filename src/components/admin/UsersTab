import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Wallet } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { toast } from 'sonner';

export default function UsersTab() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ 
    queryKey: ['admin-users'], 
    queryFn: () => base44.entities.User.list() 
  });
  const { data: accounts = [] } = useQuery({ 
    queryKey: ['admin-accounts'], 
    queryFn: () => base44.entities.Account.list() 
  });

  const usersWithAccounts = users.map(user => ({
    ...user,
    account: accounts.find(acc => acc.user_email === user.email)
  }));

  return (
    <div className="space-y-6">
      <InviteForm />
      <MoneyCreationForm accounts={accounts} />
      <Card>
        <CardHeader>
          <CardTitle>All Users & Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usersWithAccounts.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{user.full_name}</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  {user.account ? (
                    <p className="text-sm text-emerald-600">
                      VNT ID: {user.account.vnt_id} | Balance: {user.account.balance?.toLocaleString()} VHS
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">No account created</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={async (newRole) => {
                      await base44.entities.User.update(user.id, { ...user, role: newRole });
                      queryClient.invalidateQueries(['admin-users']);
                      toast.success('Role updated');
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {!user.account && <CreateAccountButton userEmail={user.email} />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const queryClient = useQueryClient();

  const handleInvite = async (e) => {
    e.preventDefault();
    await base44.users.inviteUser(email, role);
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Admin Invitation - Vandehoeken Government Portal',
      body: `You have been invited to join the Vandehoeken Government Portal as an ${role}.`
    });
    toast.success(`Invitation sent to ${email}`);
    setEmail('');
    queryClient.invalidateQueries(['admin-users']);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit"><Mail className="w-4 h-4 mr-2" />Invite</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MoneyCreationForm({ accounts }) {
  const [formData, setFormData] = useState({ vnt_id: '', amount: 0, description: '' });
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const account = accounts.find(a => a.vnt_id === formData.vnt_id);
    if (!account) {
      toast.error('Account not found');
      return;
    }

    await base44.entities.Account.update(account.id, {
      ...account,
      balance: account.balance + formData.amount
    });

    await base44.entities.Transaction.create({
      type: 'admin_adjustment',
      amount: formData.amount,
      from_email: 'treasury@vandehoeken.gov',
      to_email: account.user_email,
      to_vnt_id: account.vnt_id,
      description: formData.description || 'Administrative credit',
      status: 'completed'
    });

    await base44.integrations.Core.SendEmail({
      to: account.user_email,
      subject: 'Funds Deposited - Vandehoeken Treasury',
      body: `${formData.amount} VHS has been deposited to your account.\n\nDescription: ${formData.description}\nNew Balance: ${account.balance + formData.amount} VHS`
    });

    queryClient.invalidateQueries();
    toast.success('Money created and deposited!');
    setFormData({ vnt_id: '', amount: 0, description: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Creation (Admin Only)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>VNT ID</Label>
              <Input value={formData.vnt_id} onChange={(e) => setFormData({...formData, vnt_id: e.target.value})} placeholder="VNT-0001" required />
            </div>
            <div>
              <Label>Amount (VHS)</Label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} required />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Reason for creation..." />
          </div>
          <Button type="submit" className="w-full"><Wallet className="w-4 h-4 mr-2" />Create Money</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CreateAccountButton({ userEmail }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const createAccount = async () => {
    setCreating(true);
    const vntId = `VNT-${Date.now().toString().slice(-6)}`;
    await base44.entities.Account.create({
      vnt_id: vntId,
      user_email: userEmail,
      balance: 0
    });
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: 'Account Created - Vandehoeken Treasury',
      body: `Your treasury account has been created!\n\nVNT ID: ${vntId}\nInitial Balance: 0 VHS\n\nYou can now access all government services.`
    });
    queryClient.invalidateQueries();
    toast.success('Account created!');
    setCreating(false);
  };

  return (
    <Button size="sm" onClick={createAccount} disabled={creating}>
      {creating ? 'Creating...' : 'Create Account'}
    </Button>
  );
}
