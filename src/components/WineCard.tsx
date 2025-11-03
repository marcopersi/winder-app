import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Wine } from '../types';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { i18n } from '../utils/i18n';
import WineTag from './WineTag';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WineCardProps {
  wine: Wine;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const WineCard: React.FC<WineCardProps> = ({ wine, onSwipe }) => {
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    animatedStyle,
    resetAnimation,
  } = useSwipeGestures({
    onSwipe: (direction) => {
      setTimeout(() => {
        resetAnimation();
        onSwipe(direction);
      }, 300);
    },
  });

  // Get wine tags directly from database
  // Tags are now populated from wines_with_core_details view with embedded translations
  const wineTags = wine.tags && wine.tags.length > 0 ? wine.tags.slice(0, 6) : [];

  const formatVintage = (vintage: number | null | undefined) => {
    if (vintage === null || vintage === undefined || Number.isNaN(vintage) || vintage <= 0) {
      return 'N.V.';
    }
    return vintage.toString();
  };

  // Helper function to get wine image URL from various possible fields
  const getWineImageUrl = (wine: Wine): string | null => {
    // Try different possible field names for wine images
    const possibleImageFields = [
      wine.image_url,
      wine.image,
      (wine as any).imageUrl,
      (wine as any).photo,
      (wine as any).picture,
      (wine as any).image_path,
      (wine as any).photo_url
    ];
    
    for (const imageUrl of possibleImageFields) {
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        return imageUrl;
      }
    }
    
    // Use the same placeholder image as the web application
    return 'https://www.exklusive-weine.ch/wp-content/uploads/2025/04/application-image-original.png';
  };

  const imageUrl = getWineImageUrl(wine);

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <View style={styles.card}>
          {/* Wine Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl || 'https://www.exklusive-weine.ch/wp-content/uploads/2025/04/application-image-original.png' }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Wine Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.wineName} numberOfLines={2}>
              {wine.name}
            </Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.vintage}>{formatVintage(wine.vintage)}</Text>
              <Text style={styles.wineType}>{i18n.translateWineProperty('wine_type', wine.wine_type)}</Text>
            </View>

            <Text style={styles.region} numberOfLines={1}>
              {wine.region || 'Unknown Region'}
            </Text>

            {/* Wine Tags */}
            <View style={styles.tagsContainer}>
              {wineTags.map((tag, index) => (
                <WineTag 
                  key={`wine-${wine.id || 'unknown'}-tag-${index}-${tag.type || 'fallback'}-${index}`} 
                  tag={tag}
                />
              ))}
            </View>

            {wine.description && (
              <Text style={styles.description} numberOfLines={3}>
                {wine.description}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]}
              onPress={() => onSwipe('left')}
            >
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.likeButton]}
              onPress={() => onSwipe('right')}
            >
              <Text style={styles.buttonText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
    </Animated.View>
  );
};

const getWineTypeColor = (type: string): string => {
  const colors = {
    red: '#8B0000',
    white: '#F5F5DC',
    rosé: '#FFB6C1',
    sparkling: '#87CEEB',
    dessert: '#DDA0DD',
  };
  return colors[type as keyof typeof colors] || '#696969';
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.6,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 60,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  wineName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 26,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vintage: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  region: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bodyTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ecf0f1',
  },
  bodyText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: 'white',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  likeButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  // New styles for wine tags
  wineType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
});