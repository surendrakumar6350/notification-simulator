import { Star } from 'lucide-react';

const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
        <Star
        key= { index }
        className = {`w-4 h-4 ${index < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-600'
            }`}
      />
    ));
  };

const getCategoryColor = (category: string) => {
    const colors = {
        'general': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'bug': 'bg-red-500/10 text-red-400 border-red-500/20',
        'feature': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'improvement': 'bg-green-500/10 text-green-400 border-green-500/20'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
};


export { renderStars, getCategoryColor };

