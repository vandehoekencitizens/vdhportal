import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  User, Upload, FileText, Shield, Trash2, Plus, AlertCircle,
  Building2, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Button } from '@/components/UI/utton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Badge } from '@/components/UI/badge';
import { toast } from 'sonner';
import DigitalPassport from '@/components/UI/DigitalPassport';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: account, error: accountError } = useQuery({
    queryKey: ['account', currentUser?.email],
    queryFn: async () => {
      const accounts = await base44.entities.Account.filter({ user_email: currentUser.email });
      return accounts[0];
    },
    enabled: !!currentUser,
    retry: 2
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', currentUser?.email],
    queryFn: () => base44.entities.Document.filter({ user_email: currentUser.email }),
    enabled: !!currentUser
  });

  const { data: officeDeclarations = [] } = useQuery({
    queryKey: ['office-declarations', currentUser?.email],
    queryFn: () => base44.entities.OfficeDeclaration.filter({ user_email: currentUser.email }),
    enabled: !!currentUser
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Profile updated successfully');
      base44.auth.me().then(setCurrentUser);
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await base44.integrations.Core.SendEmail({
        to: 'elliotscottchan@gmail.com',
        subject: 'Account Deletion Request',
        body: `User ${currentUser.email} has requested account deletion.\n\nPlease process this request.`
      });
      await base44.auth.logout();
    }
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {accountError && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">Unable to load some account data. Some features may be limited.</p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Citizen Profile</h1>
          <p className="text-slate-600">Manage your personal information and documents</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="passport">Digital Passport</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="office">Office Service</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm user={currentUser} account={account} onUpdate={updateProfileMutation} onUpload={uploadFileMutation} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Passport */}
          <TabsContent value="passport">
            <Card>
              <CardHeader>
                <CardTitle>Digital Passport</CardTitle>
              </CardHeader>
              <CardContent>
                <DigitalPassport user={currentUser} account={account} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Documents</CardTitle>
                <DocumentUploadDialog userId={currentUser.email} />
              </CardHeader>
              <CardContent>
                <DocumentsList documents={documents} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Office Service */}
          <TabsContent value="office">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Office Holder Declaration</CardTitle>
                <OfficeDeclarationDialog userId={currentUser.email} />
              </CardHeader>
              <CardContent>
                <OfficeDeclarationsList declarations={officeDeclarations} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-700 mb-4">
                        This will permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                            deleteAccountMutation.mutate();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PersonalInfoForm({ user, account, onUpdate, onUpload }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    date_of_birth: user.date_of_birth || '',
    address: user.address || '',
    bio: user.bio || '',
    passport_number: user.passport_number || account?.vnt_id || ''
  });
  const [uploading, setUploading] = useState({ profile: false, passport: false });

  const handleFileUpload = async (file, type) => {
    setUploading({ ...uploading, [type]: true });
    try {
      const url = await onUpload.mutateAsync(file);
      onUpdate.mutate(type === 'profile' ? { profile_picture: url } : { passport_picture: url });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo Uploads */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Profile Picture</Label>
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-slate-300 overflow-hidden flex items-center justify-center">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e.target.files[0], 'profile')}
                disabled={uploading.profile}
              />
              <Button as="span" size="sm" disabled={uploading.profile}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading.profile ? 'Uploading...' : 'Upload'}
              </Button>
            </label>
          </div>
        </div>

        <div>
          <Label>Passport Photo</Label>
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="w-32 h-40 bg-slate-100 border-2 border-slate-300 overflow-hidden flex items-center justify-center">
              {user.passport_picture ? (
                <img src={user.passport_picture} alt="Passport" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e.target.files[0], 'passport')}
                disabled={uploading.passport}
              />
              <Button as="span" size="sm" disabled={uploading.passport}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading.passport ? 'Uploading...' : 'Upload'}
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
        </div>
        <div>
          <Label>Email (Read Only)</Label>
          <Input value={formData.email} disabled />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Phone</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div>
          <Label>Date of Birth</Label>
          <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
      </div>

      <div>
        <Label>Passport Number</Label>
        <Input value={formData.passport_number} onChange={(e) => setFormData({...formData, passport_number: e.target.value})} />
      </div>

      <div>
        <Label>Bio</Label>
        <Textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="h-24" />
      </div>

      <Button onClick={() => onUpdate.mutate(formData)} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}

function DocumentsList({ documents }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document deleted');
    }
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <div>
              <h4 className="font-semibold">{doc.document_name}</h4>
              <p className="text-sm text-slate-600 capitalize">{doc.document_type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url, '_blank')}>
              View
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(doc.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentUploadDialog({ userId }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ document_name: '', document_type: 'other', notes: '' });
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Document.create({
        user_email: userId,
        document_name: formData.document_name,
        document_type: formData.document_type,
        file_url,
        notes: formData.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document uploaded');
      setOpen(false);
      setFormData({ document_name: '', document_type: 'other', notes: '' });
      setFile(null);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Upload Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Document Name</Label>
            <Input value={formData.document_name} onChange={(e) => setFormData({...formData, document_name: e.target.value})} />
          </div>
          <div>
            <Label>Document Type</Label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-slate-300"
              value={formData.document_type}
              onChange={(e) => setFormData({...formData, document_type: e.target.value})}
            >
              <option value="passport">Passport</option>
              <option value="id_card">ID Card</option>
              <option value="certificate">Certificate</option>
              <option value="permit">Permit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <Button onClick={() => uploadMutation.mutate()} disabled={!file || !formData.document_name} className="w-full">
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OfficeDeclarationsList({ declarations }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
  };

  if (declarations.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">No office declarations submitted</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {declarations.map((dec) => {
        const StatusIcon = statusConfig[dec.status].icon;
        const approved = dec.status === 'approved';
        
        return (
          <div key={dec.id} className={`p-6 border-2 rounded-lg ${approved ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg">{dec.office_title}</h4>
                <p className="text-slate-600">{dec.micronation_name}</p>
              </div>
              <Badge className={statusConfig[dec.status].color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[dec.status].label}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-2">{dec.description}</p>
            <div className="text-xs text-slate-500">
              {dec.start_date && <span>From: {dec.start_date}</span>}
              {dec.end_date && <span className="ml-4">To: {dec.end_date}</span>}
            </div>
            {dec.admin_notes && (
              <div className="mt-3 p-3 bg-slate-100 rounded">
                <p className="text-sm font-medium">Admin Notes:</p>
                <p className="text-sm text-slate-600">{dec.admin_notes}</p>
              </div>
            )}
            {approved && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-900">Verified Office Holder</p>
                    <p className="text-sm text-emerald-700">Your service has been officially recognized</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OfficeDeclarationDialog({ userId }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    micronation_name: '',
    office_title: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OfficeDeclaration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['office-declarations']);
      toast.success('Declaration submitted for review');
      setOpen(false);
      setFormData({ micronation_name: '', office_title: '', start_date: '', end_date: '', description: '' });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Declare Office</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Declare Office Held in Another Micronation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Micronation Name</Label>
            <Input value={formData.micronation_name} onChange={(e) => setFormData({...formData, micronation_name: e.target.value})} required />
          </div>
          <div>
            <Label>Office/Position Title</Label>
            <Input value={formData.office_title} onChange={(e) => setFormData({...formData, office_title: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
              <Label>End Date (if applicable)</Label>
              <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Description of Duties</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="h-24"
            />
          </div>
          <Button onClick={() => createMutation.mutate({ ...formData, user_email: userId })} className="w-full">
            Submit Declaration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
