import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { toast } from 'sonner';

export default function RailsTab() {
  const queryClient = useQueryClient();
  const { data: rails = [] } = useQuery({ queryKey: ['admin-rails'], queryFn: () => base44.entities.Rail.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Rail.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-rails']); toast.success('Rail created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Rail.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-rails']); toast.success('Rail deleted'); }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rail Management</CardTitle>
        <RailDialog onCreate={(data) => createMutation.mutate(data)} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rails.map((rail) => (
            <div key={rail.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{rail.train_number}: {rail.departure_station} → {rail.arrival_station}</h3>
                <p className="text-sm text-slate-600">{rail.train_model}</p>
                <p className="text-sm text-slate-500">
                  Departure: {new Date(rail.departure_time).toLocaleString()} | Price: {rail.price} VHS | Seats: {rail.available_seats}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(rail.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RailDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    train_number: '', departure_station: '', arrival_station: '', 
    departure_time: '', arrival_time: '', train_model: '', 
    price: 0, available_seats: 0, status: 'scheduled' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ train_number: '', departure_station: '', arrival_station: '', departure_time: '', arrival_time: '', train_model: '', price: 0, available_seats: 0, status: 'scheduled' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Train</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add Rail Service</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Train Number</Label><Input value={formData.train_number} onChange={(e) => setFormData({...formData, train_number: e.target.value})} required /></div>
            <div><Label>Train Model</Label><Input value={formData.train_model} onChange={(e) => setFormData({...formData, train_model: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Departure Station</Label><Input value={formData.departure_station} onChange={(e) => setFormData({...formData, departure_station: e.target.value})} required /></div>
            <div><Label>Arrival Station</Label><Input value={formData.arrival_station} onChange={(e) => setFormData({...formData, arrival_station: e.target.value})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Departure Time</Label><Input type="datetime-local" value={formData.departure_time} onChange={(e) => setFormData({...formData, departure_time: e.target.value})} required /></div>
            <div><Label>Arrival Time</Label><Input type="datetime-local" value={formData.arrival_time} onChange={(e) => setFormData({...formData, arrival_time: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (VHS)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
            <div><Label>Available Seats</Label><Input type="number" value={formData.available_seats} onChange={(e) => setFormData({...formData, available_seats: Number(e.target.value)})} /></div>
          </div>
          <Button type="submit" className="w-full">Create Rail Service</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
