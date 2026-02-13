import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function FlightsTab() {
  const queryClient = useQueryClient();
  const { data: flights = [] } = useQuery({ queryKey: ['admin-flights'], queryFn: () => base44.entities.Flight.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Flight.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-flights']); toast.success('Flight created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Flight.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-flights']); toast.success('Flight deleted'); }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flight Management</CardTitle>
        <FlightDialog onCreate={(data) => createMutation.mutate(data)} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{flight.flight_number}: {flight.departure_city} → {flight.arrival_city}</h3>
                <p className="text-sm text-slate-600">{flight.aircraft_model}</p>
                <p className="text-sm text-slate-500">
                  Departure: {new Date(flight.departure_time).toLocaleString()} | Price: {flight.price} VHS | Seats: {flight.available_seats}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(flight.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FlightDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    flight_number: '', departure_city: '', arrival_city: '', 
    departure_time: '', arrival_time: '', aircraft_model: '', 
    price: 0, available_seats: 0, status: 'scheduled' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ flight_number: '', departure_city: '', arrival_city: '', departure_time: '', arrival_time: '', aircraft_model: '', price: 0, available_seats: 0, status: 'scheduled' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Flight</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add Flight</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Flight Number</Label><Input value={formData.flight_number} onChange={(e) => setFormData({...formData, flight_number: e.target.value})} required /></div>
            <div><Label>Aircraft Model</Label><Input value={formData.aircraft_model} onChange={(e) => setFormData({...formData, aircraft_model: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Departure City</Label><Input value={formData.departure_city} onChange={(e) => setFormData({...formData, departure_city: e.target.value})} required /></div>
            <div><Label>Arrival City</Label><Input value={formData.arrival_city} onChange={(e) => setFormData({...formData, arrival_city: e.target.value})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Departure Time</Label><Input type="datetime-local" value={formData.departure_time} onChange={(e) => setFormData({...formData, departure_time: e.target.value})} required /></div>
            <div><Label>Arrival Time</Label><Input type="datetime-local" value={formData.arrival_time} onChange={(e) => setFormData({...formData, arrival_time: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (VHS)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
            <div><Label>Available Seats</Label><Input type="number" value={formData.available_seats} onChange={(e) => setFormData({...formData, available_seats: Number(e.target.value)})} /></div>
          </div>
          <Button type="submit" className="w-full">Create Flight</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
