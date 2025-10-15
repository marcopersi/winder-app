import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { AccordionItem } from './Accordion';
import FilterOptionButtons from './FilterOptionButtons';

interface HierarchicalRegionFilterProps {
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
}

// Common wine regions - in production this would be fetched from database
const COMMON_REGIONS = [
  'Bordeaux', 'Burgundy', 'Champagne', 'Loire Valley', 'Rhône Valley',
  'Tuscany', 'Piedmont', 'Veneto', 'Sicily', 'Marche',
  'Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas',
  'Napa Valley', 'Sonoma', 'Willamette Valley', 'Columbia Valley',
  'Barossa Valley', 'Hunter Valley', 'Margaret River',
  'Mosel', 'Rheingau', 'Pfalz', 'Baden',
  'Mendoza', 'Casablanca Valley', 'Stellenbosch',
];

const HierarchicalRegionFilter: React.FC<HierarchicalRegionFilterProps> = ({
  selectedOptions,
  onToggleOption,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter regions based on search term
  const filteredRegions = COMMON_REGIONS.filter(region =>
    region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort selected regions first
  const sortedRegions = [...filteredRegions].sort((a, b) => {
    const aSelected = selectedOptions.includes(a);
    const bSelected = selectedOptions.includes(b);
    
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    
    return a.localeCompare(b);
  });

  return (
    <AccordionItem value="region" title="Regions">
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search regions..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#6c757d"
          />
        </View>
        
        {/* Filter Options */}
        <FilterOptionButtons
          options={sortedRegions}
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
          category="region"
        />
      </View>
    </AccordionItem>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    fontSize: 14,
    color: '#495057',
  },
});

export default HierarchicalRegionFilter;