import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WineFilter } from '../types';
import { createDefaultFilter } from '../utils/filterUtils';

// Import filter options service
import { 
  getAllFilterOptions, 
  fetchCountryOptions
} from '../services/filterOptionsService';

// Import filter components
import FilterHeader from './filters/FilterHeader';
import FilterActions from './filters/FilterActions';
import GrapeFilter from './filters/GrapeFilter';
import CountryFilter from './filters/CountryFilter';
import WineTypeFilter from './filters/WineTypeFilter';
import CharacteristicFilter from './filters/CharacteristicFilter';



interface FilterMenuProps {
  isVisible: boolean;
  onClose: () => void;
  currentFilter: WineFilter;
  onFilterChange: (filter: WineFilter) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  isVisible,
  onClose,
  currentFilter,
  onFilterChange,
}) => {
  const [filter, setFilter] = useState<WineFilter>({ ...currentFilter });
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({
    grape: [],
    country: [],
    region: [],
    wineType: [],
    color: [],
    sweetness: [],      // ADD - wie Web App
    productionType: [],
    unit: [],
    alcohol: [],
    price: []           // ADD - wie Web App
  });
  const [countryLabels, setCountryLabels] = useState<Record<string, string>>({});
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false); // Track if we've loaded options

  // Update local filter when currentFilter changes
  useEffect(() => {
    setFilter({ ...currentFilter });
  }, [currentFilter]);

  // Load filter options from database - load when visible and not yet loaded
  useEffect(() => {
    const loadFilterOptions = async () => {
      
      try {
        // Load dynamic options and countries in parallel
        const dynamicOptions = await getAllFilterOptions('de');
        const countries = await fetchCountryOptions('de');

        // Extract country codes and create label mapping
        const countryCodes = countries
          .map(c => c.country_code.toUpperCase())
          .filter((code): code is string => code.length > 0);
        
        const labelMap = countries.reduce<Record<string, string>>((acc, country) => {
          const code = country.country_code.toUpperCase();
          acc[code] = country.name;
          return acc;
        }, {});
        
        // Update filter options with database values
        const newFilterOptions = {
          grape: dynamicOptions.grape,
          country: countryCodes,
          region: [],
          wineType: dynamicOptions.wineType,
          color: dynamicOptions.color,
          sweetness: dynamicOptions.sweetness,
          productionType: dynamicOptions.productionType,
          unit: dynamicOptions.unit,
          alcohol: dynamicOptions.alcohol,
          price: dynamicOptions.price
        };
        
        setFilterOptions(newFilterOptions);
        setCountryLabels(labelMap);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error('FilterMenu: Failed to load filter options:', error);
        throw error;
      }
    };

    // Load options when visible AND not yet loaded
    if (isVisible && !hasLoadedOptions) {
      loadFilterOptions();
    }
  }, [isVisible, hasLoadedOptions]);

  const handleApplyFilter = () => {
    onFilterChange(filter);
    onClose();
  };

  const handleReset = () => {
    const resetFilter = createDefaultFilter();
    setFilter(resetFilter);
    onFilterChange(resetFilter);
    onClose();
  };

  const updateFilter = (key: keyof WineFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };



  // Handle new-style filter toggles (exactly like Web App)
  const handleToggleOption = (
    category: keyof Pick<WineFilter, 'grape' | 'country' | 'region' | 'wineType' | 'color' | 'sweetness' | 'productionType' | 'unit' | 'alcohol' | 'price'>, 
    value: string
  ) => {
    setFilter(prev => {
      const updated = { ...prev };
      const currentArray = updated[category] || [];
      
      if (currentArray.includes(value)) {
        updated[category] = currentArray.filter((item: string) => item !== value) as any;
      } else {
        updated[category] = [...currentArray, value] as any;
      }
      
      return updated;
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <FilterHeader onClose={onClose} />
        
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={true}
        >
          {/* SIMPLIFIED - NO ACCORDION - Just render all filters directly */}
          
          {/* Grape Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <GrapeFilter
              options={filterOptions.grape}
              selectedOptions={filter.grape || []}
              onToggleOption={(value) => handleToggleOption('grape', value)}
            />
          </View>
          
          {/* Country Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <CountryFilter
              options={filterOptions.country || []}
              selectedOptions={filter.country || []}
              onToggleOption={(value) => handleToggleOption('country', value)}
              labelMap={countryLabels}
            />
          </View>
          
          {/* Wine Type Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <WineTypeFilter
              options={filterOptions.wineType || []}
              selectedOptions={filter.wineType || []}
              onToggleOption={(value) => handleToggleOption('wineType', value)}
            />
          </View>
          
          {/* Color Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <CharacteristicFilter
              type="color"
              options={filterOptions.color || []}
              selectedOptions={filter.color || []}
              onToggleOption={(value) => handleToggleOption('color', value)}
            />
          </View>
          
          {/* Sweetness Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <CharacteristicFilter
              type="sweetness"
              options={filterOptions.sweetness || []}
              selectedOptions={filter.sweetness || []}
              onToggleOption={(value) => handleToggleOption('sweetness', value)}
            />
          </View>
          
          {/* Alcohol Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <CharacteristicFilter
              type="alcohol"
              options={filterOptions.alcohol || []}
              selectedOptions={filter.alcohol || []}
              onToggleOption={(value) => handleToggleOption('alcohol', value)}
            />
          </View>
          
          {/* Price Filter */}
          <View style={{ marginBottom: 20, backgroundColor: 'white', padding: 12, borderRadius: 8 }}>
            <CharacteristicFilter
              type="price"
              options={filterOptions.price || []}
              selectedOptions={filter.price || []}
              onToggleOption={(value) => handleToggleOption('price', value)}
            />
          </View>
        </ScrollView>

        <FilterActions
          onReset={handleReset}
          onApply={handleApplyFilter}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default FilterMenu;