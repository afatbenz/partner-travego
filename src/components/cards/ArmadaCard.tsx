import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Calendar, Heart, Eye } from 'lucide-react';

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

  const handleDetailClick = () => {
    navigate(`/detail/armada/${armada.id}`);
  };

  const fullLocation = armada.pickupAreas && armada.pickupAreas.length > 0 
    ? armada.pickupAreas.join(', ') 
    : armada.location;

  const displayLocation = fullLocation.length > 50 
    ? fullLocation.substring(0, 50) + '...' 
    : fullLocation;

  // Split price into amount and unit
  const priceParts = (armada.price || '').split('/');
  const priceAmount = priceParts[0];
  const priceUnit = priceParts.length > 1 ? `/${priceParts.slice(1).join('/')}` : '';

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300" style={{ height: '22rem' }}>
        <div className="flex h-full">
          {/* Image Section - Left Side */}
          <div className="relative w-[32rem] flex-shrink-0 h-full">
            <img
              src={armada.image}
              alt={armada.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={`text-xs ${
                armada.badge === 'Popular' ? 'bg-blue-600 hover:bg-blue-600' :
                armada.badge === 'New' ? 'bg-green-600 hover:bg-green-600' :
                armada.badge === 'Luxury' ? 'bg-purple-600 hover:bg-purple-600' :
                armada.badge === 'Economical' ? 'bg-orange-600 hover:bg-orange-600' :
                'bg-gray-600 hover:bg-gray-600'
              }`}>
                {armada.badge}
              </Badge>
              <Badge variant="destructive" className="text-xs">
                {armada.discount}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content Section - Right Side */}
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">
                {armada.name}
              </h3>
              
              {/* Garis tipis di bawah judul */}
              <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{armada.capacity}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span title={fullLocation}>{displayLocation}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-2" />
                  <span>{armada.rating} ({armada.reviews} reviews)</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {features.slice(0, 5).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {features.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{features.length - 5} lainnya
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Mulai dari</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {priceAmount}
                  </span>
                  {priceUnit && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {priceUnit}
                    </span>
                  )}
                </div>
                {armada.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {armada.originalPrice}
                  </div>
                )}
              </div>
              <Button onClick={handleDetailClick}>
                Lihat Detail
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:h-48">
        <img
          src={armada.image}
          alt={armada.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`text-[10px] md:text-xs ${
            armada.badge === 'Popular' ? 'bg-blue-600 hover:bg-blue-600' :
            armada.badge === 'New' ? 'bg-green-600 hover:bg-green-600' :
            armada.badge === 'Luxury' ? 'bg-purple-600 hover:bg-purple-600' :
            armada.badge === 'Economical' ? 'bg-orange-600 hover:bg-orange-600' :
            'bg-gray-600 hover:bg-gray-600'
          }`}>
            {armada.badge}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3 md:p-4 flex flex-col flex-1">
        <h3 className="md:hidden font-semibold text-base mb-2 text-gray-900 dark:text-white" title={armada.name}>
          {armada.name.length > 15 ? armada.name.substring(0, 15) + '...' : armada.name}
        </h3>
        <h3 className="hidden md:block font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-1" title={armada.name}>
          {armada.name}
        </h3>
        
        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 flex-1">
          <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <Users className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
            <span>{armada.capacity}</span>
          </div>
          <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
            <span title={fullLocation}>{displayLocation}</span>
          </div>
          
          {/* Facilities */}
          <div className="flex flex-wrap gap-1 mt-2">
            {features.slice(0, 3).map((feature, index) => (
              <span key={index} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                +{features.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-1 border-t border-gray-100 dark:border-gray-700">
          <div className="mb-0">
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Mulai dari</div>
            <div className="flex items-baseline flex-wrap gap-1">
              <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                {priceAmount}
              </span>
              {priceUnit && (
                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {priceUnit}
                </span>
              )}
              {armada.originalPrice && (
                <span className="text-[10px] md:text-xs text-gray-400 line-through ml-1">
                  {armada.originalPrice}
                </span>
              )}
            </div>
          </div>
          <Button className="w-full text-xs md:text-sm h-8 md:h-9 mt-2 md:mt-3" onClick={handleDetailClick}>
            Lihat Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
