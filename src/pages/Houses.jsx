import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Search,
  ArrowLeft,
  BedDouble,
  Bath,
  Ruler,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { toast } from 'sonner';

export default function Houses() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleView = (house) => {
    toast.info(`Viewing property: ${house.address}`);
  };

  const { data: houses = [], isLoading, error } = useQuery({
    queryKey: ['houses'],
    queryFn: () => base44.entities.House.filter({ status: 'available' }),
    retry: 2
  });

  const filteredHouses = houses.filter(house => 
    house.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    house.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Housing Marketplace</h1>
              <p className="text-blue-200">Find your new home in Vandehoeken</p>
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
                placeholder="Search by address or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Properties</h3>
              <p className="text-slate-600 mb-4">Unable to fetch house listings</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : filteredHouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house, idx) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  {house.image_url && (
                    <div className="h-48 bg-slate-200 overflow-hidden">
                      <img src={house.image_url} alt={house.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                      {house.address}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">{house.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      {house.bedrooms && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <BedDouble className="w-4 h-4" />
                          <span>{house.bedrooms} bed</span>
                        </div>
                      )}
                      {house.bathrooms && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Bath className="w-4 h-4" />
                          <span>{house.bathrooms} bath</span>
                        </div>
                      )}
                      {house.sqft && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Ruler className="w-4 h-4" />
                          <span>{house.sqft} sqft</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{house.price.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">VHS</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 rounded-full"
                        onClick={() => handleView(house)}
                      >
                        View Details
                      </Button>
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Properties Available</h3>
              <p className="text-slate-600">Check back later for new listings</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
