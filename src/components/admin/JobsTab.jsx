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

export default function JobsTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({ queryKey: ['admin-jobs'], queryFn: () => base44.entities.Job.list() });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-jobs']); toast.success('Job created'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-jobs']); toast.success('Job deleted'); }
  });

  const filtered = jobs.filter(job => 
    job.title?.toLowerCase().includes(search.toLowerCase()) || 
    job.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Job Listings</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <JobDialog onCreate={(data) => createMutation.mutate(data)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-slate-600">{job.department}</p>
                <p className="text-sm text-slate-500">Salary: {job.salary} VHS/day | Status: {job.status}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(job.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function JobDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', description: '', salary: 0, location: '', type: 'Full-time', status: 'open' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ title: '', department: '', description: '', salary: 0, location: '', type: 'Full-time', status: 'open' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Job</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Job Listing</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
          <div><Label>Department</Label><Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} required /></div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required /></div>
          <div><Label>Daily Salary (VHS)</Label><Input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})} /></div>
          <div><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /></div>
          <Button type="submit" className="w-full">Create Job</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
