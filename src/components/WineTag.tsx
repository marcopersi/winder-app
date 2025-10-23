import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WineTagProps {
  tag: {
    type: string;
    value: string;
  };
}

/**
 * Wine Tag Badge Component - renders colored badges based on tag type
 * Replicates the colored badge system from the web app
 */
export const WineTag: React.FC<WineTagProps> = ({ tag }) => {
  // Get color scheme based on tag type (matching web app colors)
  const getTagColors = (tagType: string) => {
    switch (tagType) {
      case 'aroma':
        return {
          backgroundColor: '#FEF3C7', // amber-100
          textColor: '#92400E', // amber-800
        };
      case 'texture':
        return {
          backgroundColor: '#FDE68A', // yellow-100
          textColor: '#78350F', // yellow-800
        };
      case 'body':
        return {
          backgroundColor: '#DBEAFE', // blue-100
          textColor: '#1E40AF', // blue-800
        };
      case 'tannins':
        return {
          backgroundColor: '#F3E8FF', // purple-100
          textColor: '#6B21A8', // purple-800
        };
      case 'sweetness':
        return {
          backgroundColor: '#FCE7F3', // pink-100
          textColor: '#BE185D', // pink-800
        };
      case 'acidity':
        return {
          backgroundColor: '#D1FAE5', // green-100
          textColor: '#047857', // green-800
        };
      case 'color':
        return {
          backgroundColor: '#FEE2E2', // red-100
          textColor: '#DC2626', // red-800
        };
      case 'wineType':
        return {
          backgroundColor: '#E0E7FF', // indigo-100
          textColor: '#3730A3', // indigo-800
        };
      case 'productionType':
        return {
          backgroundColor: '#ECFDF5', // emerald-100
          textColor: '#065F46', // emerald-800
        };
      case 'alcohol':
        return {
          backgroundColor: '#FEF7FF', // fuchsia-100
          textColor: '#A21CAF', // fuchsia-800
        };
      case 'unit':
        return {
          backgroundColor: '#F0FDF4', // lime-100
          textColor: '#365314', // lime-800
        };
      case 'grape':
        return {
          backgroundColor: '#E0F2FE', // cyan-100
          textColor: '#0E7490', // cyan-800
        };
      default:
        return {
          backgroundColor: '#F3F4F6', // gray-100
          textColor: '#374151', // gray-800
        };
    }
  };

  const colors = getTagColors(tag.type);

  // Capitalize and format the tag value for display
  const formatTagValue = (value: string): string => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatTagType = (type: string): string => {
    // Convert camelCase to readable format
    const readable = type.replaceAll(/([A-Z])/g, ' $1').toLowerCase();
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  };

  return (
    <View style={[styles.tagContainer, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.tagText, { color: colors.textColor }]}>
        {formatTagType(tag.type)}: {formatTagValue(tag.value)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WineTag;