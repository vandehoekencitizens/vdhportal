import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function HousesTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: houses = [] } = useQuery({ queryKey: ['admin-houses'], queryFn: () => base44.entities.House.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.House.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-houses']); toast.success('House created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.House.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-houses']); toast.success('House deleted'); }
  });

  const filtered = houses.filter(house => 
    house.address?.toLowerCase().includes(search.toLowerCase()) || 
    house.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Property Listings</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <HouseDialog onCreate={(data) => createMutation.mutate(data)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map((house) => (
            <div key={house.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{house.address}</h3>
                <p className="text-sm text-slate-600">{house.description}</p>
                <p className="text-sm text-slate-500">Price: {house.price?.toLocaleString()} VHS | {house.bedrooms} bed, {house.bathrooms} bath</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(house.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HouseDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ address: '', price: 0, bedrooms: 0, bathrooms: 0, sqft: 0, description: '', status: 'available' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ address: '', price: 0, bedrooms: 0, bathrooms: 0, sqft: 0, description: '', status: 'available' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add House</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Property Listing</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required /></div>
          <div><Label>Price (VHS)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Bedrooms</Label><Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})} /></div>
            <div><Label>Bathrooms</Label><Input type="number" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})} /></div>
            <div><Label>Sqft</Label><Input type="number" value={formData.sqft} onChange={(e) => setFormData({...formData, sqft: Number(e.target.value)})} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <Button type="submit" className="w-full">Create Listing</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
