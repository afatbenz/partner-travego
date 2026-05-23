import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  onSubmit?: (rating: number, review: string) => void;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  className = ''
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && selectedRating > 0 && reviewText.trim()) {
      onSubmit(selectedRating, reviewText);
      setSelectedRating(0);
      setReviewText('');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tulis Ulasan Anda</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setSelectedRating(rating)}
                className="focus:outline-none bg-transparent p-0.5 rounded"
              >
                <Star
                  className={`h-6 w-6 transition-colors bg-transparent ${
                    rating <= selectedRating
                      ? 'text-orange-500 fill-current'
                      : 'text-gray-300 dark:text-gray-600 hover:text-orange-500 dark:hover:text-orange-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Review Text */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ulasan Anda
          </label>
          <Textarea
            placeholder="Bagikan pengalaman Anda menggunakan layanan ini..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedRating || !reviewText.trim()}
        >
          Kirim Ulasan
        </Button>
      </form>
    </div>
  );
};
