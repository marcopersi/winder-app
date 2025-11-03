/**
 * ProducerFilter Component
 * 
 * Type-ahead search for filtering wines by producer (React Native version)
 * Adapted from web app with mobile-specific UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface Producer {
  id: string;
  name: string;
}

interface ProducerFilterProps {
  selectedProducerIds: string[];
  onProducersChange: (producerIds: string[]) => void;
}

/**
 * Search producers by name (type-ahead)
 */
const searchProducers = async (searchTerm: string): Promise<Producer[]> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const term = searchTerm.trim();

  const { data, error } = await supabase
    .from('producers')
    .select('id, name')
    .ilike('name', `%${term}%`)
    .order('name', { ascending: true })
    .limit(50);

  if (error) {
    logger.filterOptions.error('Error searching producers:', error);
    return [];
  }

  return data || [];
};

/**
 * Get producer by ID
 */
const getProducerById = async (id: string): Promise<Producer | null> => {
  const { data, error } = await supabase
    .from('producers')
    .select('id, name')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.filterOptions.error('Error fetching producer by ID:', error);
    return null;
  }

  return data;
};

/**
 * Simple debounce hook
 */
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProducerFilter: React.FC<ProducerFilterProps> = ({
  selectedProducerIds,
  onProducersChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Producer[]>([]);
  const [selectedProducers, setSelectedProducers] = useState<Producer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search producers when debounced term changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchProducers(debouncedSearchTerm);
        // Filter out already selected producers
        const filtered = results.filter(
          producer => !selectedProducerIds.includes(producer.id)
        );
        setSearchResults(filtered);
        setShowResults(filtered.length > 0);
      } catch (error) {
        logger.filterOptions.error('Producer search error:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, selectedProducerIds]);

  // Load selected producers' details when IDs change
  useEffect(() => {
    const loadSelectedProducers = async () => {
      if (selectedProducerIds.length === 0) {
        setSelectedProducers([]);
        return;
      }

      // Only reload if IDs have actually changed
      const currentIds = selectedProducers.map(p => p.id).sort().join(',');
      const newIds = [...selectedProducerIds].sort().join(',');
      
      if (currentIds === newIds) {
        return; // No change, skip reload
      }
      
      // Load all selected producers from database
      const loadedProducers: Producer[] = [];
      for (const id of selectedProducerIds) {
        try {
          const producer = await getProducerById(id);
          if (producer) {
            loadedProducers.push(producer);
          }
        } catch (error) {
          logger.filterOptions.error(`Failed to load producer ${id}:`, error);
        }
      }
      setSelectedProducers(loadedProducers);
    };

    loadSelectedProducers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducerIds.join(',')]);

  const handleSelectProducer = useCallback((producer: Producer) => {
    const newIds = [...selectedProducerIds, producer.id];
    onProducersChange(newIds);
    setSearchTerm('');
    setShowResults(false);
  }, [selectedProducerIds, onProducersChange]);

  const handleRemoveProducer = useCallback((producerId: string) => {
    const newIds = selectedProducerIds.filter(id => id !== producerId);
    onProducersChange(newIds);
  }, [selectedProducerIds, onProducersChange]);

  const handleClearAll = useCallback(() => {
    onProducersChange([]);
  }, [onProducersChange]);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Produzent suchen..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onFocus={() => searchResults.length > 0 && setShowResults(true)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Search Results */}
      {showResults && searchTerm.length >= 2 && (
        <View style={styles.searchResultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#722F37" />
              <Text style={styles.loadingText}>Suche läuft...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.searchResultsList}>
              {searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectProducer(item)}
                >
                  <Text style={styles.searchResultText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>Keine Produzenten gefunden</Text>
            </View>
          )}
        </View>
      )}

      {/* Selected Producers */}
      {selectedProducers.length > 0 && (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>
              Ausgewählt ({selectedProducers.length})
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAllText}>Alle löschen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsContainer}>
            {selectedProducers.map((producer) => (
              <View key={producer.id} style={styles.chip}>
                <Text style={styles.chipText}>{producer.name}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveProducer(producer.id)}
                  style={styles.chipRemoveButton}
                >
                  <Text style={styles.chipRemoveText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  searchResultsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 240,
    overflow: 'hidden',
  },
  searchResultsList: {
    maxHeight: 240,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  clearAllText: {
    fontSize: 12,
    color: '#722F37',
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  chipRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});

export default ProducerFilter;
