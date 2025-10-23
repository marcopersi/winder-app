import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice.toString());
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice.toString());

  const handleMinPriceChange = (text: string) => {
    setLocalMinPrice(text);
    const numValue = Number.parseFloat(text) || 0;
    onPriceChange(numValue, maxPrice);
  };

  const handleMaxPriceChange = (text: string) => {
    setLocalMaxPrice(text);
    const numValue = Number.parseFloat(text) || 1000;
    onPriceChange(minPrice, numValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.priceInputContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Min Price</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>€</Text>
            <TextInput
              style={styles.input}
              value={localMinPrice}
              onChangeText={handleMinPriceChange}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.separator}>
          <Text style={styles.separatorText}>—</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Price</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>€</Text>
            <TextInput
              style={styles.input}
              value={localMaxPrice}
              onChangeText={handleMaxPriceChange}
              keyboardType="numeric"
              placeholder="1000"
            />
          </View>
        </View>
      </View>

      <View style={styles.priceDisplay}>
        <Text style={styles.priceDisplayText}>
          Range: €{minPrice} - €{maxPrice}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
    height: 44,
  },
  currency: {
    fontSize: 16,
    color: '#495057',
    marginRight: 4,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    padding: 0,
  },
  separator: {
    paddingBottom: 12,
  },
  separatorText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  priceDisplay: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignItems: 'center',
  },
  priceDisplayText: {
    fontSize: 14,
    color: '#721c24',
    fontWeight: '500',
  },
});

export default PriceRangeFilter;