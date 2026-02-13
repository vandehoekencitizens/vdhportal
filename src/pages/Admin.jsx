import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';

import UsersTab from '@/components/admin/UsersTab';
import NotificationsTab from '@/components/admin/NotificationsTab';
import RequestsTab from '@/components/admin/RequestsTab';
import VotesTab from '@/components/admin/VotesTab';
import OfficesTab from '@/components/admin/OfficesTab';
import MarketplaceTab from '@/components/admin/MarketplaceTab';
import JobsTab from '@/components/admin/JobsTab';
import HousesTab from '@/components/admin/HousesTab';
import CarsTab from '@/components/admin/CarsTab';
import FlightsTab from '@/components/admin/FlightsTab';
import RailsTab from '@/components/admin/RailsTab';
import PayrollTab from '@/components/admin/PayrollTab';
import TransactionsTab from '@/components/admin/TransactionsTab';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#c9a227]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Admin Portal</h1>
              <p className="text-slate-600">Complete system management</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-13 w-full mb-8">
            <TabsTrigger value="users"><Users className="w-4 h-4" />Users</TabsTrigger>
            <TabsTrigger value="notifications">Notify</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
            <TabsTrigger value="offices">Offices</TabsTrigger>
            <TabsTrigger value="marketplace">Market</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="rails">Rail</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="transactions">Txns</TabsTrigger>
          </TabsList>

          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="requests"><RequestsTab /></TabsContent>
          <TabsContent value="votes"><VotesTab /></TabsContent>
          <TabsContent value="offices"><OfficesTab /></TabsContent>
          <TabsContent value="marketplace"><MarketplaceTab /></TabsContent>
          <TabsContent value="jobs"><JobsTab /></TabsContent>
          <TabsContent value="houses"><HousesTab /></TabsContent>
          <TabsContent value="cars"><CarsTab /></TabsContent>
          <TabsContent value="flights"><FlightsTab /></TabsContent>
          <TabsContent value="rails"><RailsTab /></TabsContent>
          <TabsContent value="payroll"><PayrollTab /></TabsContent>
          <TabsContent value="transactions"><TransactionsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
