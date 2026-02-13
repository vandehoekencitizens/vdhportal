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

export default function CarsTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: cars = [] } = useQuery({ queryKey: ['admin-cars'], queryFn: () => base44.entities.Car.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Car.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-cars']); toast.success('Car created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Car.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-cars']); toast.success('Car deleted'); }
  });

  const filtered = cars.filter(car => 
    car.make?.toLowerCase().includes(search.toLowerCase()) || 
    car.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vehicle Listings</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <CarDialog onCreate={(data) => createMutation.mutate(data)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map((car) => (
            <div key={car.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{car.make} {car.model}</h3>
                <p className="text-sm text-slate-600">{car.description}</p>
                <p className="text-sm text-slate-500">{car.year} | {car.mileage?.toLocaleString()} km | {car.price?.toLocaleString()} VHS</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(car.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CarDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', year: new Date().getFullYear(), price: 0, mileage: 0, color: '', description: '', status: 'available' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ make: '', model: '', year: new Date().getFullYear(), price: 0, mileage: 0, color: '', description: '', status: 'available' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Car</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Vehicle Listing</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Make</Label><Input value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} required /></div>
            <div><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Year</Label><Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} required /></div>
            <div><Label>Price (VHS)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Mileage (km)</Label><Input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})} /></div>
            <div><Label>Color</Label><Input value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <Button type="submit" className="w-full">Create Listing</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
