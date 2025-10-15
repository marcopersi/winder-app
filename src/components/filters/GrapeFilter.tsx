import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import FilterOptionButtons from './FilterOptionButtons';

interface GrapeFilterProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (value: string) => void;
}

const GrapeFilter: React.FC<GrapeFilterProps> = ({
  options,
  selectedOptions,
  onToggleOption,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort grape options based on search term
  const filteredAndSortedOptions = useMemo(() => {
    let filtered = options;
    
    if (searchTerm.trim()) {
      filtered = options.filter(grape =>
        grape.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort selected options first, then alphabetically
    return filtered.sort((a, b) => {
      const aSelected = selectedOptions.includes(a);
      const bSelected = selectedOptions.includes(b);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      return a.localeCompare(b);
    });
  }, [options, selectedOptions, searchTerm]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grape Varieties ({options.length})</Text>
      
      {/* Search Input */}
      {options.length > 10 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search grape varieties..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#6c757d"
          />
        </View>
      )}
      
      {/* Filter Options */}
      {options.length > 0 ? (
        <FilterOptionButtons
          options={filteredAndSortedOptions}
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
          category="grape"
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading grape varieties...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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

export default GrapeFilter;