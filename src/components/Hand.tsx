import React from 'react';
import CardComponent from './CardComponent';
import { Card, calculateHandValue } from '../types/game';

interface HandProps {
  cards: Card[];
  title: string;
  hideFirstCard?: boolean;
  className?: string;
}

const Hand: React.FC<HandProps> = ({ 
  cards, 
  title, 
  hideFirstCard = false, 
  className = '' 
}) => {
  // Calculate hand value, considering hidden cards
  const visibleCards = hideFirstCard && cards.length > 0 ? cards.slice(1) : cards;
  const handValue = calculateHandValue(visibleCards);
  
  return (
    <div className={`hand ${className}`}>
      <div className="hand-header">
        <h3 className="hand-title">{title}</h3>
        {cards.length > 0 && (
          <div className="hand-value">
            {hideFirstCard && cards.length > 1 ? `${handValue}+` : handValue}
          </div>
        )}
      </div>
      
      <div className="cards-container">
        {cards.map((card, index) => (
          <CardComponent
            key={`${card.suit}-${card.value}-${index}`}
            card={card}
            isHidden={hideFirstCard && index === 0}
            className="card-in-hand"
          />
        ))}
        
        {cards.length === 0 && (
          <div className="empty-hand">
            <div className="empty-card-placeholder">
              Ready to play
            </div>
          </div>
        )}
      </div>
      
      {/* Hand status indicators */}
      {cards.length > 0 && !hideFirstCard && (
        <div className="hand-status">
          {handValue === 21 && cards.length === 2 && (
            <span className="status-blackjack">🎯 BLACKJACK!</span>
          )}
          {handValue === 21 && cards.length > 2 && (
            <span className="status-twenty-one">✨ 21!</span>
          )}
          {handValue > 21 && (
            <span className="status-bust">💥 BUST!</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Hand;