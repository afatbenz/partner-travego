import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Heart, ArrowRight, Clock } from 'lucide-react';

interface CatalogPackageCardProps {
  item: {
    id: number;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    image: string;
    rating: number;
    reviewCount: number;
    location: string;
    duration: string;
    features: string[];
    isPopular?: boolean;
    isNew?: boolean;
    discount?: number;
  };
  viewMode?: 'grid' | 'list';
}

export const CatalogPackageCard: React.FC<CatalogPackageCardProps> = ({ item, viewMode = 'grid' }) => {
  const navigate = useNavigate();

  const handleDetailClick = () => {
    navigate(`/detail/catalog/${item.id}`);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {item.isPopular && (
                <Badge className="bg-orange-500/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  Popular
                </Badge>
              )}
              {item.isNew && (
                <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  New
                </Badge>
              )}
              {item.discount && item.discount > 0 && (
                <Badge className="bg-red-500/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-bold">
                  -{item.discount}%
                </Badge>
              )}
            </div>
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
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{item.location}</p>
                  </div>
                </div>
                <div className="flex items-center bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-2xl">
                  <Star className="h-4 w-4 text-orange-500 fill-current mr-1.5" />
                  <span className="font-normal text-orange-900 dark:text-orange-100 text-sm">{item.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm my-6 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mr-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{item.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.features.slice(0, 4).map((feature, idx) => (
                  <span key={idx} className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {item.price}
                  </span>
                  <span className="text-sm font-bold text-gray-400">/pax</span>
                </div>
                {item.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {item.originalPrice}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleDetailClick}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
              >
                Lihat Detail
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid View (Default)
  return (
    <Card className="group overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] h-full flex flex-col transform hover:-translate-y-2">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.isPopular && (
            <Badge className="bg-orange-500/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              Popular
            </Badge>
          )}
          {item.isNew && (
            <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              New
            </Badge>
          )}
          {item.discount && item.discount > 0 && (
            <Badge className="bg-red-500/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] font-bold">
              -{item.discount}%
            </Badge>
          )}
        </div>
        
        <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300">
          <Heart className="h-4 w-4" />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold tracking-wide">{item.location}</span>
          </div>
          <h3 className="text-2xl font-black leading-tight line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      <CardContent className="p-8 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-xl">
            <Star className="h-4 w-4 text-orange-500 fill-current mr-1.5" />
            <span className="font-black text-orange-600 dark:text-orange-400 text-sm">{item.rating}</span>
          </div>
          <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            {item.duration}
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {item.price}
            </span>
          </div>
          <Button 
            onClick={handleDetailClick}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Detail
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
