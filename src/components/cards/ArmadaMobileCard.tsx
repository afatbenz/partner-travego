import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, MapPin, ArrowRight } from 'lucide-react';
import type { ArmadaData } from '@/components/cards/ArmadaCard';

interface ArmadaMobileCardProps {
  armada: ArmadaData;
  /** Varian besar (thumbnail ±2x + text lebih besar) — dipakai untuk list view desktop */
  large?: boolean;
}

export const ArmadaMobileCard: React.FC<ArmadaMobileCardProps> = ({ armada, large = false }) => {
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
      {/* Image - left (2x saat large) */}
      <div className={`relative shrink-0 aspect-square overflow-hidden ${large ? 'w-56 sm:w-72' : 'w-28 sm:w-36'}`}>
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
          <h3 className={`font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug ${large ? 'text-xl' : 'text-sm'}`}>
            {armada.name}
          </h3>
          <p className={`text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase mt-0.5 ${large ? 'text-xs' : 'text-[10px]'}`}>
            {armada.type}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-1.5">
          <Star className={`text-yellow-500 fill-current mr-1 ${large ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className={`font-semibold text-gray-700 dark:text-gray-300 ${large ? 'text-sm' : 'text-xs'}`}>
            {armada.rating}
          </span>
          <span className={`text-gray-400 ml-1 ${large ? 'text-sm' : 'text-xs'}`}>
            ({armada.reviews || 0} review)
          </span>
        </div>

        {/* Capacity + location */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Users className={`text-blue-600 mr-1.5 shrink-0 ${large ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
            <span className={`font-medium truncate ${large ? 'text-sm' : 'text-[11px]'}`}>{armada.capacity}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MapPin className={`text-blue-600 mr-1.5 shrink-0 ${large ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
            <span className={`font-medium truncate ${large ? 'text-sm' : 'text-[11px]'}`}>{displayLocation}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className={`font-bold text-gray-400 uppercase tracking-wider mb-0.5 ${large ? 'text-[11px]' : 'text-[9px]'}`}>Price</p>
          <div className="flex items-baseline gap-1">
            <span className={`font-bold text-blue-600 dark:text-blue-400 truncate ${large ? 'text-xl' : 'text-sm'}`}>
              {priceAmount}
            </span>
            <span className={`font-normal text-gray-500 truncate ${large ? 'text-xs' : 'text-[10px]'}`}>{priceUnit}</span>
          </div>
        </div>

        {/* CTA - below price */}
        <Button
          onClick={handleDetailClick}
          className={`mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1 ${large ? 'h-11 text-sm' : 'h-9 text-xs'}`}
        >
          Lihat
          <ArrowRight className={`${large ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </Button>
      </div>
    </Card>
  );
};

export default ArmadaMobileCard;
