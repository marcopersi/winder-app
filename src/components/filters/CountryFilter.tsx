import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FilterOptionButtons from './FilterOptionButtons';

interface CountryFilterProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
  labelMap?: Record<string, string>;
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  options,
  selectedOptions,
  onToggleOption,
  labelMap,
}) => {
  return (
    <View>
      {options.length > 0 ? (
        <FilterOptionButtons
          options={options}
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
          category="country"
          labelMap={labelMap}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading countries...</Text>
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

export default CountryFilter;