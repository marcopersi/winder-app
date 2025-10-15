import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FilterOptionButtons from './FilterOptionButtons';

interface WineTypeFilterProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
}

const WineTypeFilter: React.FC<WineTypeFilterProps> = ({
  options,
  selectedOptions,
  onToggleOption,
}) => {
  return (
    <View>
      {options.length > 0 ? (
        <FilterOptionButtons
          options={options}
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
          category="wineType"
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wine types...</Text>
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

export default WineTypeFilter;