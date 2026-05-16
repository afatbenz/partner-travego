import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Shield, Zap, ArrowRight, Heart } from 'lucide-react';

interface ArmadaCardProps {
  armada: {
    id: number | string;
    name: string;
    type: string;
    capacity: string;
    price: string;
    originalPrice: string;
    image: string;
    rating: number;
    reviews: number;
    features: string[];
    location: string;
    pickupAreas?: string[];
    year: string;
    transmission: string;
    fuel: string;
    badge: string;
    discount: string;
    productionYear?: number;
  };
  viewMode?: 'grid' | 'list';
}

export const ArmadaCard: React.FC<ArmadaCardProps> = ({ armada, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const features = armada.features || [];
  console.log({armada})

  const handleDetailClick = () => {
    navigate(`/detail/armada/${armada.id}`);
  };

  const fullLocation = armada.pickupAreas && armada.pickupAreas.length > 0 
    ? armada.pickupAreas.join(', ') 
    : armada.location;

  const displayLocation = fullLocation.length > 40 
    ? fullLocation.substring(0, 40) + '...' 
    : fullLocation;

  // Split price into amount and unit
  const priceParts = (armada.price || '').split('/');
  const priceAmount = priceParts[0];
  const priceUnit = priceParts.length > 1 ? `/${priceParts.slice(1).join('/')}` : '';

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
            <img
              src={armada.image}
              alt={armada.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300">
              <Heart className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content Section */}
          <CardContent className="p-6 md:p-8 flex flex-col flex-1">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {armada.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-normal text-sm tracking-wide uppercase">{armada.type}</p>
                </div>
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-2xl">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1.5" />
                  <span className="font-bold text-blue-900 dark:text-blue-100 text-sm">{armada.rating}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{armada.capacity}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mr-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{displayLocation}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mr-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Full Insured</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {features.slice(0, 4).map((feature, index) => (
                  <span key={index} className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-1">Price per trip</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {priceAmount}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    {priceUnit}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  onClick={handleDetailClick}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
                >
                  Lihat Detail
                </Button>
                <Button 
                  variant="outline"
                  className="h-14 w-14 rounded-2xl border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Zap className="h-6 w-6 text-blue-600" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] h-full flex flex-col transform hover:-translate-y-2">
      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={armada.image}
          alt={armada.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-2">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {armada.name}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 font-bold text-[10px] tracking-widest uppercase mt-1">{armada.type}</p>
          </div>
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-xl shrink-0">
            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
            <span className="font-bold text-blue-900 dark:text-blue-100 text-xs">{armada.rating}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <Users className="h-4 w-4 text-blue-600 mr-2 shrink-0" />
            <span className="text-[11px] font-bold truncate">{armada.capacity}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <MapPin className="h-4 w-4 text-blue-600 mr-2 shrink-0" />
            <span className="text-[11px] font-bold truncate">{armada.location}</span>
          </div>
        </div>

        {/* Facilities - Minimalist Icons or text */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {features.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-2 py-1 rounded-md">
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              +{features.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {priceAmount}
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                {priceUnit}
              </span>
            </div>
          </div>
          <Button 
            onClick={handleDetailClick}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-5 py-2 font-normal shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Lihat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
