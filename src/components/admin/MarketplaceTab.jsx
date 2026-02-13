import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { toast } from 'sonner';
import ItemDialog from './ItemDialog';

export default function MarketplaceTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  
  const { data: items = [] } = useQuery({ queryKey: ['admin-marketplace'], queryFn: () => base44.entities.MarketplaceItem.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketplaceItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-marketplace']); toast.success('Item created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketplaceItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-marketplace']); toast.success('Item deleted'); }
  });

  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) || 
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Marketplace Items</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <ItemDialog type="marketplace" onCreate={(data) => createMutation.mutate(data)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <p className="text-sm text-slate-500">Price: {item.price} VHS | Stock: {item.stock}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
