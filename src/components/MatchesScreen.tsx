import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wine } from '../types';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { userPreferenceService } from '../services/userPreferenceService';
import { i18n } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchesScreenProps {
  onClose: () => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onClose }) => {
  const [matches, setMatches] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Load real matched wines from database
      const likedWines = await userPreferenceService.getLikedWines(user.id);
      
      if (likedWines.length === 0) {
        // If no real data, show sample data for demo
        console.log('No liked wines found, using sample data');
        setSampleMatches();
      } else {
        setMatches(likedWines);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // Fallback to sample data on error
      setSampleMatches();
    } finally {
      setLoading(false);
    }
  };

  // Sample wine data for demo purposes
  const setSampleMatches = () => {
    const sampleWines: Wine[] = [
      {
        id: '1',
        name: 'Château Margaux 2015',
        vintage: 2015,
        price: 450.00,
        region: 'Bordeaux, France',
        grape_variety: 'Cabernet Sauvignon, Merlot',
        description: 'Ein außergewöhnlicher Bordeaux mit komplexen Aromen.',
        image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop',
        wine_tags: ['Premium', 'Sammlerwein', 'Lagerfähig'],
        wine_type: 'red',
        body: 'full',
        sweetness: 'dry',
        acidity: 'medium-plus',
        tannin: 'high',
        alcohol_content: 13.5,
      },
      {
        id: '2',
        name: 'Dom Pérignon 2012',
        vintage: 2012,
        price: 180.00,
        region: 'Champagne, France',
        grape_variety: 'Chardonnay, Pinot Noir',
        description: 'Eleganter Champagner mit feinen Perlen.',
        image_url: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop',
        wine_tags: ['Prestige', 'Feier', 'Elegant'],
        wine_type: 'sparkling',
        body: 'medium',
        sweetness: 'dry',
        acidity: 'high',
        alcohol_content: 12.5,
      }
    ];
    
    setMatches(sampleWines);
  };

  const handleRemoveMatch = async (wine: Wine) => {
    if (!user) return;

    try {
      await userPreferenceService.removeLike(user.id, wine.id);
      // Remove from local state immediately
      const updatedMatches = matches.filter(m => m.id !== wine.id);
      setMatches(updatedMatches);
    } catch (error) {
      console.error('Error removing match:', error);
      Alert.alert('Fehler', 'Match konnte nicht entfernt werden');
    }
  };

  const generateWineTags = (wine: Wine): string[] => {
    const tags: string[] = [];
    
    // Add wine_tags from database if available
    if (wine.wine_tags && wine.wine_tags.length > 0) {
      tags.push(...wine.wine_tags);
    }
    
    // Generate tags from wine characteristics
    tags.push(i18n.translateWineProperty('body', wine.body));
    tags.push(i18n.translateWineProperty('sweetness', wine.sweetness));
    
    // Add acidity tag
    tags.push(i18n.translateWineProperty('acidity', wine.acidity));
    
    // Add tannin tag for red wines
    if (wine.wine_type === 'red' && wine.tannin) {
      tags.push(i18n.translateWineProperty('tannin', wine.tannin));
    }
    
    // Remove duplicates and filter out null/undefined values
    const uniqueTags = [...new Set(tags.filter(tag => tag && tag.trim() !== ''))];
    
    return uniqueTags.slice(0, 4); // Limit to 4 tags for display
  };

  const renderMatchItem = ({ item }: { item: Wine }) => {
    const wineTags = generateWineTags(item);
    
    // Handle different image field names and provide better fallback
    const imageUri = item.image_url || item.image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop';
    
    // Debug logging
    console.log('Rendering wine:', item.name, 'Image URI:', imageUri);
    
    return (
      <View style={styles.matchCard}>
        <Image 
          source={{ uri: imageUri }}
          style={styles.wineImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image failed to load for wine:', item.name, 'URI:', imageUri, 'Error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Image loaded successfully for wine:', item.name);
          }}
        />
        
        <View style={styles.wineInfo}>
          <Text style={styles.wineName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.wineDetails}>{item.vintage} • {item.region}</Text>
          
          {/* Wine Tags */}
          <View style={styles.tagsContainer}>
            {wineTags.map((tag, index) => (
              <View key={`${item.id}-tag-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          {item.price && (
            <Text style={styles.price}>CHF {item.price.toFixed(2)}</Text>
          )}
          
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveMatch(item)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      );
    }
    
    if (matches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keine Matches gefunden</Text>
          <Text style={styles.emptySubtext}>Swipe weiter, um Weine zu finden die dir gefallen!</Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        style={styles.listStyle}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('ui.matches')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32, // Extra padding at bottom for better scrolling
  },
  emptyListContainer: {
    flexGrow: 1,
    padding: 16,
  },
  listStyle: {
    flex: 1, // Ensure FlatList takes available space
    backgroundColor: '#f8f9fa',
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wineImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  wineInfo: {
    flex: 1,
    marginLeft: 16,
  },
  wineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  wineDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
});