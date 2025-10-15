import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterOptionButtonsProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
  category?: string;
  labelMap?: Record<string, string>;
}

const FilterOptionButtons: React.FC<FilterOptionButtonsProps> = ({
  options,
  selectedOptions,
  onToggleOption,
  category,
  labelMap,
}) => {
  // Removed verbose debug logging

  const getDisplayLabel = (option: string): string => {
    // Ensure option is a string
    const stringOption = String(option || '');
    
    if (labelMap?.[stringOption]) {
      return labelMap[stringOption];
    }
    
    // Basic capitalization for display
    return stringOption
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredOptions = options.filter(option => option != null && option !== '');

  return (
    <View style={styles.container}>
      {filteredOptions.map((option) => {
        const stringOption = String(option);
        const isSelected = selectedOptions.includes(stringOption);
        return (
          <TouchableOpacity
            key={stringOption}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
            ]}
            onPress={() => onToggleOption(stringOption)}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}
            >
              {getDisplayLabel(stringOption)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#721c24',
    borderColor: '#721c24',
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilterOptionButtons;