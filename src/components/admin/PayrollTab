import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { toast } from 'sonner';

export default function PayrollTab() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => base44.entities.User.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ['admin-jobs'], queryFn: () => base44.entities.Job.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ['admin-accounts'], queryFn: () => base44.entities.Account.list() });
  const { data: jobAssignments = [] } = useQuery({ queryKey: ['admin-job-assignments'], queryFn: () => base44.entities.JobAssignment.list() });

  const handlePaySalaries = async () => {
    const activeAssignments = jobAssignments.filter(ja => ja.status === 'active');
    for (const assignment of activeAssignments) {
      const account = accounts.find(a => a.user_email === assignment.user_email);
      if (account) {
        await base44.entities.Account.update(account.id, {
          ...account,
          balance: account.balance + assignment.daily_salary
        });
        await base44.entities.Transaction.create({
          type: 'admin_adjustment',
          amount: assignment.daily_salary,
          from_email: 'treasury@vandehoeken.gov',
          to_email: assignment.user_email,
          to_vnt_id: account.vnt_id,
          description: `Daily salary: ${assignment.job_title}`,
          status: 'completed'
        });
        await base44.integrations.Core.SendEmail({
          to: assignment.user_email,
          subject: 'Daily Salary Paid - Vandehoeken Treasury',
          body: `Your daily salary of ${assignment.daily_salary} VHS has been deposited.\n\nJob: ${assignment.job_title}\nNew Balance: ${account.balance + assignment.daily_salary} VHS`
        });
      }
    }
    queryClient.invalidateQueries();
    toast.success('Daily salaries paid to all employees!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Job to Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignJobForm users={users} jobs={jobs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Employees</CardTitle>
          <Button onClick={handlePaySalaries}>
            <DollarSign className="w-4 h-4 mr-2" />
            Pay Daily Salaries
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobAssignments.filter(ja => ja.status === 'active').map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{assignment.user_email}</h3>
                  <p className="text-sm text-slate-600">{assignment.job_title}</p>
                  <p className="text-sm text-slate-500">Daily Salary: {assignment.daily_salary} VHS</p>
                </div>
                <div className="flex gap-2">
                  <UpdateSalaryDialog assignment={assignment} />
                  <Button variant="destructive" size="sm" onClick={async () => {
                    await base44.entities.JobAssignment.update(assignment.id, { ...assignment, status: 'terminated' });
                    queryClient.invalidateQueries(['admin-job-assignments']);
                    toast.success('Employee terminated');
                  }}>Terminate</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignJobForm({ users, jobs }) {
  const [formData, setFormData] = useState({ user_email: '', job_id: '', daily_salary: 0 });
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedJob = jobs.find(j => j.id === formData.job_id);
    
    await base44.entities.JobAssignment.create({
      user_email: formData.user_email,
      job_id: formData.job_id,
      job_title: selectedJob.title,
      daily_salary: formData.daily_salary || selectedJob.salary,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    });

    await base44.integrations.Core.SendEmail({
      to: formData.user_email,
      subject: 'Job Assignment - Vandehoeken Government',
      body: `You have been assigned to a new position!\n\nJob: ${selectedJob.title}\nDepartment: ${selectedJob.department}\nDaily Salary: ${formData.daily_salary || selectedJob.salary} VHS\n\nCongratulations!`
    });

    queryClient.invalidateQueries(['admin-job-assignments']);
    toast.success('Employee assigned to job!');
    setFormData({ user_email: '', job_id: '', daily_salary: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Employee Email</Label>
          <Select value={formData.user_email} onValueChange={(val) => setFormData({...formData, user_email: val})}>
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
        <div>
          <Label>Job Position</Label>
          <Select value={formData.job_id} onValueChange={(val) => setFormData({...formData, job_id: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Select job..." />
            </SelectTrigger>
            <SelectContent>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title} - {job.department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Custom Daily Salary (optional, defaults to job salary)</Label>
        <Input type="number" value={formData.daily_salary} onChange={(e) => setFormData({...formData, daily_salary: Number(e.target.value)})} placeholder="Leave empty to use job default" />
      </div>
      <Button type="submit" className="w-full">Assign Employee</Button>
    </form>
  );
}

function UpdateSalaryDialog({ assignment }) {
  const [open, setOpen] = useState(false);
  const [newSalary, setNewSalary] = useState(assignment.daily_salary);
  const queryClient = useQueryClient();

  const handleUpdate = async (e) => {
    e.preventDefault();
    await base44.entities.JobAssignment.update(assignment.id, { ...assignment, daily_salary: newSalary });
    queryClient.invalidateQueries(['admin-job-assignments']);
    toast.success('Salary updated');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Update Salary</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Daily Salary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>New Daily Salary (VHS)</Label>
            <Input type="number" value={newSalary} onChange={(e) => setNewSalary(Number(e.target.value))} required />
          </div>
          <Button type="submit" className="w-full">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
