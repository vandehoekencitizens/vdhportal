import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Leader() {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasApprovedOffice, setHasApprovedOffice] = useState(false);
  const [uiMode, setUiMode] = useState('elegant');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        const declarations = await base44.entities.OfficeDeclaration.filter({ 
          user_email: user.email, 
          status: 'approved' 
        });
        
        setHasApprovedOffice(declarations.length > 0);
      } catch (err) {
        console.error("Auth failed");
      }
    };
    loadUser();
  }, []);

  // Safe Navigation for Citizen View
  useEffect(() => {
    if (uiMode === 'citizen') {
      navigate(createPageUrl('AccountLookup'));
    }
  }, [uiMode, navigate]);

  if (!currentUser) return null;

  if (!hasApprovedOffice && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/10 backdrop-blur border-slate-700">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-slate-300">
              This portal is only available to verified micronation leaders and government administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={uiMode === 'elegant' 
      ? 'min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' 
      : 'min-h-screen bg-gradient-to-b from-slate-50 to-slate-100'}>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-4 ${uiMode === 'elegant' ? 'text-white' : 'text-slate-900'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Leader Portal</h1>
              <p className={uiMode === 'elegant' ? 'text-slate-300' : 'text-slate-600'}>
                Government & Diplomatic Access
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setUiMode('elegant')}
              variant={uiMode === 'elegant' ? 'default' : 'outline'}
              className={uiMode === 'elegant' ? 'bg-amber-600 hover:bg-amber-700' : 'border-slate-300 text-slate-700'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Leader View
            </Button>
            <Button
              onClick={() => setUiMode('citizen')}
              variant={uiMode === 'citizen' ? 'default' : 'outline'}
              className={uiMode === 'elegant' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'bg-slate-900 text-white hover:bg-slate-800'}
            >
              <Eye className="w-4 h-4 mr-2" />
              Citizen View
            </Button>
          </div>
        </div>

        {uiMode === 'elegant' && <ElegantLeaderView user={currentUser} />}
      </div>
    </div>
  );
}

function ElegantLeaderView({ user }) {
  const navigate = useNavigate();
  const features = [
    { title: 'Administrative Functions', desc: 'Access full admin portal', link: 'Admin', gradient: 'from-blue-600 to-blue-800', icon: Shield },
    { title: 'My Profile', desc: 'Manage your citizen profile', link: 'Profile', gradient: 'from-purple-600 to-purple-800', icon: Eye },
    { title: 'Treasury Services', desc: 'Access account and transactions', link: 'AccountLookup', gradient: 'from-emerald-600 to-emerald-800', icon: Shield }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <Card key={idx} onClick={() => navigate(createPageUrl(feature.link))} className="group cursor-pointer bg-white/10 backdrop-blur border-slate-700 hover:border-amber-500 transition-all hover:scale-105">
            <CardContent className="p-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-300">{feature.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
