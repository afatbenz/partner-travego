import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, MapPin, ArrowRight } from 'lucide-react';
import type { ArmadaData } from '@/components/cards/ArmadaCard';

interface ArmadaMobileCardProps {
  armada: ArmadaData;
}

export const ArmadaMobileCard: React.FC<ArmadaMobileCardProps> = ({ armada }) => {
  const navigate = useNavigate();

  const handleDetailClick = () => {
    navigate(`/detail/armada/${armada.id}`);
  };

  const fullLocation =
    armada.pickupAreas && armada.pickupAreas.length > 0
      ? armada.pickupAreas.join(', ')
      : armada.location;

  const displayLocation =
    fullLocation.length > 40 ? fullLocation.substring(0, 40) + '...' : fullLocation;

  // Split price into amount and unit
  const priceParts = (armada.price || '').split('/');
  const priceAmount = priceParts[0];
  const priceUnit = priceParts.length > 1 ? `/${priceParts.slice(1).join('/')}` : '';

  return (
    <Card className="group flex overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm rounded-2xl">
      {/* Image - left */}
      <div className="relative w-28 sm:w-36 shrink-0 aspect-[3/4] overflow-hidden">
        <img
          src={armada.image}
          alt={armada.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      {/* Content - right */}
      <div className="flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col">
        {/* Name + category */}
        <div className="mb-1.5">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 leading-snug">
            {armada.name}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-[10px] tracking-widest uppercase mt-0.5">
            {armada.type}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-1.5">
          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {armada.rating}
          </span>
          <span className="text-xs text-gray-400 ml-1">
            ({armada.reviews || 0} review)
          </span>
        </div>

        {/* Capacity + location */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Users className="h-3.5 w-3.5 text-blue-600 mr-1.5 shrink-0" />
            <span className="text-[11px] font-medium truncate">{armada.capacity}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1.5 shrink-0" />
            <span className="text-[11px] font-medium truncate">{displayLocation}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
              {priceAmount}
            </span>
            <span className="text-[10px] font-normal text-gray-500 truncate">{priceUnit}</span>
          </div>
        </div>

        {/* CTA - below price */}
        <Button
          onClick={handleDetailClick}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1"
        >
          Lihat
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};

export default ArmadaMobileCard;
