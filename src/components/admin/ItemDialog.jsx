import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';

export default function ItemDialog({ type, onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(getDefaultData(type));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData(getDefaultData(type));
  };

  return (
    <Dialog open={open} onValueChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add {getTitle(type)}</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add {getTitle(type)}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFields(type, formData, setFormData)}
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultData(type) {
  switch(type) {
    case 'marketplace': return { name: '', description: '', price: 0, stock: 0 };
    case 'job': return { title: '', department: '', description: '', salary: 0 };
    case 'house': return { address: '', price: 0, bedrooms: 0, bathrooms: 0 };
    case 'car': return { make: '', model: '', year: 2025, price: 0 };
    case 'flight': return { flight_number: '', departure_city: '', arrival_city: '', price: 0 };
    case 'rail': return { train_number: '', departure_station: '', arrival_station: '', price: 0 };
    default: return {};
  }
}

function getTitle(type) {
  const titles = { marketplace: 'Item', job: 'Job', house: 'House', car: 'Car', flight: 'Flight', rail: 'Rail' };
  return titles[type] || 'Item';
}

function renderFields(type, data, setData) {
  switch(type) {
    case 'marketplace':
      return (<>
        <div><Label>Name</Label><Input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} required /></div>
        <div><Label>Description</Label><Textarea value={data.description} onChange={(e) => setData({...data, description: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price</Label><Input type="number" value={data.price} onChange={(e) => setData({...data, price: Number(e.target.value)})} required /></div>
          <div><Label>Stock</Label><Input type="number" value={data.stock} onChange={(e) => setData({...data, stock: Number(e.target.value)})} required /></div>
        </div>
      </>);
    default:
      return <p>Form not configured</p>;
  }
}
