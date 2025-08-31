import React from 'react';
import { Card, getCardDisplayValue, SUIT_SYMBOLS, SUIT_COLORS } from '../types/game';

interface CardComponentProps {
  card: Card;
  isHidden?: boolean;
  className?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  isHidden = false, 
  className = '' 
}) => {
  if (isHidden) {
    return (
      <div className={`card-back ${className}`}>
        <div className="card-back-pattern">
          🂠
        </div>
      </div>
    );
  }

  const displayValue = getCardDisplayValue(card);
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <div className={`card ${suitColor} ${className}`}>
      <div className="card-corner top-left">
        <div className="card-value">{displayValue}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
      
      <div className="card-center">
        <div className="card-suit-large">{suitSymbol}</div>
      </div>
      
      <div className="card-corner bottom-right">
        <div className="card-value">{displayValue}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default CardComponent;