import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StorePreview = ({ name, rating, image, sellerId }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-2">
      {image ? (
        <img 
          src={image} 
          alt={name}
          className="w-10 h-10 rounded-full object-cover mr-2"
        />
      ) : (
        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-2">
          {name.charAt(0)}
        </div>
      )}
      <div>
        <div className="text-white font-medium text-sm">{name}</div>
        <div className="flex items-center">
          <div className="flex text-yellow-400 text-xs">
            {renderStars()}
          </div>
          <span className="text-xs text-gray-400 ml-1">({rating})</span>
        </div>
      </div>
      <Link 
        to={`/store/${sellerId}`}
        className="ml-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
      >
        View Store
      </Link>
    </div>
  );
};

export default StorePreview;