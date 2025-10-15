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