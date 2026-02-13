import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Car, 
  Search,
  ArrowLeft,
  Calendar,
  Gauge,
  Palette,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Cars() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleView = (car) => {
    toast.info(`Viewing vehicle: ${car.make} ${car.model}`);
  };

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ['cars'],
    queryFn: () => base44.entities.Car.filter({ status: 'available' }),
    retry: 2
  });

  const filteredCars = cars.filter(car => 
    car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Vehicle Marketplace</h1>
              <p className="text-slate-400">Browse available vehicles</p>
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
                placeholder="Search by make, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-slate-200 focus:border-slate-500 rounded-xl"
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Vehicles</h3>
              <p className="text-slate-600 mb-4">Unable to fetch vehicle listings</p>
              <Button onClick={() => window.location.reload()} className="bg-slate-800 hover:bg-slate-900">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-slate-600 animate-spin" />
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  {car.image_url && (
                    <div className="h-48 bg-slate-200 overflow-hidden">
                      <img src={car.image_url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-600 transition-colors">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">{car.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{car.year}</span>
                      </div>
                      {car.mileage && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Gauge className="w-4 h-4" />
                          <span>{car.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {car.color && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Palette className="w-4 h-4" />
                          <span>{car.color}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{car.price.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">VHS</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-slate-800 hover:bg-slate-900 rounded-full"
                        onClick={() => handleView(car)}
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Vehicles Available</h3>
              <p className="text-slate-600">Check back later for new listings</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
