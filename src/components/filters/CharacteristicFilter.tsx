import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FilterOptionButtons from './FilterOptionButtons';

interface CharacteristicFilterProps {
  type: 'color' | 'productionType' | 'sweetness' | 'alcohol' | 'price';  // ADD all types like Web App
  options: string[];
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
}

const CharacteristicFilter: React.FC<CharacteristicFilterProps> = ({
  type,
  options,
  selectedOptions,
  onToggleOption,
}) => {
  // DEBUG: Log what props we receive
  console.log(`🔍 [CharacteristicFilter] Rendering ${type}:`, {
    optionsCount: options?.length || 0,
    options: options,
    selectedCount: selectedOptions?.length || 0,
    selected: selectedOptions
  });

  // Get the filter title based on the type (exactly like Web App)
  const getFilterTitle = () => {
    switch (type) {
      case 'color': return 'Color';
      case 'productionType': return 'Production Type';
      case 'sweetness': return 'Sweetness';     // ADD
      case 'alcohol': return 'Alcohol';         // ADD
      case 'price': return 'Price';             // ADD
      default: return '';
    }
  };

  const getLoadingText = () => {
    switch (type) {
      case 'color': return 'Loading colors...';
      case 'productionType': return 'Loading production types...';
      case 'sweetness': return 'Loading sweetness levels...';
      case 'alcohol': return 'Loading alcohol levels...';
      case 'price': return 'Loading price ranges...';
      default: return 'Loading options...';
    }
  };
  
  return (
    <View>
      <Text style={styles.title}>{getFilterTitle()} ({options.length})</Text>
      {options.length > 0 ? (
        <FilterOptionButtons
          options={options}
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
          category={type}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{getLoadingText()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default CharacteristicFilter;