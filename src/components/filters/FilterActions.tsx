import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterActionsProps {
  onReset: () => void;
  onApply: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({ onReset, onApply }) => {
  return (
    <View style={styles.container}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={onReset}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.applyButton]}
          onPress={onApply}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 28, 36, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Touch target size
  },
  resetButton: {
    backgroundColor: 'rgba(114, 28, 36, 0.1)',
    borderWidth: 2,
    borderColor: '#721c24',
  },
  resetButtonText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#721c24',
    shadowColor: '#721c24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterActions;