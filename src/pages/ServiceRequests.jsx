import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Badge } from '@/components/UI/badge';
import { toast } from 'sonner';

export default function ServiceRequests() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: requests = [], error } = useQuery({
    queryKey: ['service-requests', currentUser?.email],
    queryFn: () => base44.entities.ServiceRequest.filter({ user_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    retry: 2
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['service-requests']);
      toast.success('Request submitted successfully');
      setOpen(false);
    }
  });

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    in_review: { icon: AlertCircle, color: 'bg-blue-100 text-blue-800', label: 'In Review' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' },
    completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800', label: 'Completed' }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Service Requests</h1>
            <p className="text-slate-600">Submit and track your government service requests</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Service Request</DialogTitle>
              </DialogHeader>
              <ServiceRequestForm onSubmit={(data) => createMutation.mutate({ ...data, user_email: currentUser.email })} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Requests</h3>
                <p className="text-slate-600 mb-4">Unable to fetch your service requests</p>
                <Button onClick={() => window.location.reload()} className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No service requests yet</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => {
              const StatusIcon = statusConfig[request.status].icon;
              return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                      </div>
                      <Badge className={statusConfig[request.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[request.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span>Type: <span className="font-medium capitalize">{request.request_type}</span></span>
                      <span>Priority: <span className="font-medium capitalize">{request.priority}</span></span>
                      <span>Submitted: {new Date(request.created_date).toLocaleDateString()}</span>
                    </div>
                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700">Admin Notes:</p>
                        <p className="text-sm text-slate-600">{request.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceRequestForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    request_type: 'permit',
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Request Type</Label>
        <Select value={formData.request_type} onValueChange={(val) => setFormData({...formData, request_type: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permit">Permit Application</SelectItem>
            <SelectItem value="utility">Utility Service</SelectItem>
            <SelectItem value="issue_report">Report Issue</SelectItem>
            <SelectItem value="document">Document Request</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Title</Label>
        <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          className="h-24"
          required 
        />
      </div>

      <div>
        <Label>Priority</Label>
        <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">Submit Request</Button>
    </form>
  );
}
