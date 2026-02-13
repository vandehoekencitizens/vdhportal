import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OfficesTab() {
  const queryClient = useQueryClient();
  const { data: officeDeclarations = [] } = useQuery({ 
    queryKey: ['admin-office-declarations'], 
    queryFn: () => base44.entities.OfficeDeclaration.filter({ status: 'pending' }) 
  });

  const handleApprove = async (dec) => {
    await base44.entities.OfficeDeclaration.update(dec.id, { ...dec, status: 'approved', admin_notes: 'Verified and approved' });
    await base44.integrations.Core.SendEmail({
      to: dec.user_email,
      subject: 'Office Declaration Approved - Vandehoeken',
      body: `Your office declaration for ${dec.office_title} in ${dec.micronation_name} has been approved and verified.\n\nYour service is now officially recognized.`
    });
    queryClient.invalidateQueries(['admin-office-declarations']);
    toast.success('Declaration approved');
  };

  const handleReject = async (dec) => {
    await base44.entities.OfficeDeclaration.update(dec.id, { ...dec, status: 'rejected', admin_notes: 'Unable to verify' });
    await base44.integrations.Core.SendEmail({
      to: dec.user_email,
      subject: 'Office Declaration Update',
      body: `Your office declaration has been reviewed. Please contact administration for more information.`
    });
    queryClient.invalidateQueries(['admin-office-declarations']);
    toast.success('Declaration rejected');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Office Holder Declarations (Pending Review)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {officeDeclarations.map(dec => (
            <div key={dec.id} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{dec.office_title} - {dec.micronation_name}</h4>
              <p className="text-sm text-slate-600 mb-2">{dec.description}</p>
              <p className="text-xs text-slate-500">Applicant: {dec.user_email}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => handleApprove(dec)}>
                  <CheckCircle className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(dec)}>
                  <XCircle className="w-4 h-4 mr-1" />Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
