import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function NotificationsTab() {
  const { data: users = [] } = useQuery({ 
    queryKey: ['admin-users'], 
    queryFn: () => base44.entities.User.list() 
  });

  const [formData, setFormData] = useState({
    recipient: 'all',
    specific_email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      let recipients = [];
      
      if (formData.recipient === 'all') {
        recipients = users.map(u => u.email);
      } else if (formData.recipient === 'specific') {
        recipients = [formData.specific_email];
      }

      for (const email of recipients) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `[Government Announcement] ${formData.subject}`,
          body: `Dear Citizen,\n\n${formData.message}\n\n---\nThe Democratic Republic of Vandehoeken\nDeath Before Dishonor`
        });
      }

      toast.success(`Notification sent to ${recipients.length} citizen(s)`);
      setFormData({ recipient: 'all', specific_email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Citizen Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Recipients</Label>
            <Select value={formData.recipient} onValueChange={(val) => setFormData({...formData, recipient: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Citizens</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recipient === 'specific' && (
            <div>
              <Label>User Email</Label>
              <Select value={formData.specific_email} onValueChange={(val) => setFormData({...formData, specific_email: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>{user.full_name} ({user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Subject</Label>
            <Input 
              value={formData.subject} 
              onChange={(e) => setFormData({...formData, subject: e.target.value})} 
              placeholder="Important Service Update"
              required 
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea 
              value={formData.message} 
              onChange={(e) => setFormData({...formData, message: e.target.value})} 
              placeholder="Enter your announcement message..."
              className="h-32"
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={sending}>
            <Mail className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
