import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MultiSelectFilterProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  options,
  selectedOptions,
  onToggleOption,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selectedOptions.includes(option) && styles.selectedOption,
          ]}
          onPress={() => onToggleOption(option)}
        >
          <Text
            style={[
              styles.optionText,
              selectedOptions.includes(option) && styles.selectedOptionText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedOption: {
    backgroundColor: '#721c24',
    borderColor: '#721c24',
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
});

export default MultiSelectFilter;