import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: FilterOption[];
  locations: FilterOption[];
  sortOptions: FilterOption[];
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categories,
  locations,
  sortOptions,
  className = ''
}) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-800/40 p-4 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${className}`}>
      <div className="flex flex-col lg:flex-row gap-6 items-end">
        {/* Search Input */}
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 px-1">
            <Search className="h-4 w-4 text-blue-600" />
            Cari Layanan
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Apa yang ingin Anda cari?"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all pl-12"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-sm font-bold text-blue-900 dark:text-blue-100 px-1">Kategori</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value} className="rounded-lg py-3">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-sm font-bold text-blue-900 dark:text-blue-100 px-1">Lokasi</label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all">
              <SelectValue placeholder="Semua Lokasi" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl">
              {locations.map((location) => (
                <SelectItem key={location.value} value={location.value} className="rounded-lg py-3">
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-sm font-bold text-blue-900 dark:text-blue-100 px-1">Urutkan</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-14 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg py-3">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`h-12 w-12 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`h-12 w-12 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
