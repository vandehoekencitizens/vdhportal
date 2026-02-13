import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

export default function TransactionsTab() {
  const { data: transactions = [] } = useQuery({ 
    queryKey: ['admin-transactions'], 
    queryFn: () => base44.entities.Transaction.list('-created_date') 
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{txn.description || txn.item_name}</h3>
                <p className="text-sm text-slate-600">{txn.from_vnt_id || txn.from_email} → {txn.to_vnt_id || txn.to_email || 'N/A'}</p>
                <p className="text-xs text-slate-500">{new Date(txn.created_date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{txn.amount.toLocaleString()} VHS</p>
                <p className="text-xs text-slate-500">{txn.type}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
