import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Briefcase, 
  Search,
  ArrowLeft,
  MapPin,
  DollarSign,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Employment() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleApply = (job) => {
    toast.success(`Application submitted for ${job.title}!`);
  };

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }),
    retry: 2
  });

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-purple-700 to-purple-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Employment Services</h1>
              <p className="text-purple-200">Government job opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <Card className="bg-white border-0 shadow-xl mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search job positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Jobs</h3>
              <p className="text-slate-600 mb-4">Unable to fetch job listings</p>
              <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <Briefcase className="w-8 h-8 text-purple-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-purple-600 font-medium">{job.department}</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 w-fit">
                            {job.type || 'Full-time'}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-600 mb-4">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          {job.salary && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              <span>{job.salary} VHS/day</span>
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>{job.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 rounded-full"
                          onClick={() => handleApply(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Jobs Available</h3>
              <p className="text-slate-600">Check back later for new opportunities</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
