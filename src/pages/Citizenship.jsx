import React, { useState } from 'react';
import { ArrowLeft, FileText, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Button } from '@/components/UI/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Citizenship() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    reason: ''
  });
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create user account via invitation system
      await base44.users.inviteUser(formData.email, 'user');

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: 'elliotscottchan@gmail.com',
        subject: 'New Citizenship Application - Account Created',
        body: `New citizenship application received and user account created:\n\nName: ${formData.full_name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nReason: ${formData.reason}\n\nStatus: User invited and can now access the portal`
      });

      // Notify applicant
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: 'Citizenship Approved - Welcome to Vandehoeken!',
        body: `Dear ${formData.full_name},\n\nYour citizenship application for The Democratic Republic of Vandehoeken has been approved!\n\nYour account has been created. Please check your email for an invitation link to set your password and access the portal.\n\nWelcome to Vandehoeken!\n\nDeath Before Dishonor.`
      });

      setStep(2);
      toast.success('Citizenship approved! Check your email for login instructions.');
    } catch (error) {
      toast.error('Error creating account. Please contact administration.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-amber-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Citizenship Application</h1>
              <p className="text-amber-200">Apply for Vandehoeken citizenship</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <Card className="bg-white border-0 shadow-xl">
          <CardContent className="p-8">
            {step === 1 && (
              <>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 mb-6">
                  <h2 className="text-lg font-bold text-amber-900 mb-1">Welcome, Future Citizen!</h2>
                  <p className="text-sm text-amber-800">
                    Complete the form below to apply for citizenship and create your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      type="tel"
                      placeholder="+65 9123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Reason for Citizenship</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="h-24"
                      placeholder="Tell us why you want to become a citizen..."
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 h-12">
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Vandehoeken!</h2>
                <p className="text-slate-600 mb-6">
                  Your citizenship has been approved! Check your email for an invitation link to set your password and access the portal.
                </p>
                <Link to={createPageUrl('Home')}>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Return to Portal
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
