import React from 'react';
import { AccordionItem } from './Accordion';
import PriceRangeFilter from '../PriceRangeFilter';

interface PriceRangeAccordionFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceRangeAccordionFilter: React.FC<PriceRangeAccordionFilterProps> = ({
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  return (
    <AccordionItem value="priceRange" title="Price Range">
      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={onPriceChange}
      />
    </AccordionItem>
  );
};

export default PriceRangeAccordionFilter;