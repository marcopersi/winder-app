import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wine, WineFilter } from '../types';
import { WineCard } from './WineCard';
import { MatchesScreen } from './MatchesScreen';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { i18n } from '../utils/i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeContainerProps {
  wines: Wine[];
  filter?: WineFilter;
  onMatch?: (wine: Wine) => void;
  loading?: boolean;
}

export const SwipeContainer: React.FC<SwipeContainerProps> = ({ 
  wines, 
  filter, 
  onMatch,
  loading = false 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredWines, setFilteredWines] = useState<Wine[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const { user } = useSupabaseAuth();
  const insets = useSafeAreaInsets();

  // Filter wines based on the provided filter
  const filterWines = useCallback((wineList: Wine[], wineFilter: WineFilter) => {
    return wineList.filter(wine => {
      // Wine type filter
      if (wineFilter.wineTypes.length > 0 && !wineFilter.wineTypes.includes(wine.wine_type)) {
        return false;
      }
      
      // Price filter
      if (wine.price !== null && wine.price !== undefined) {
        if (wine.price < wineFilter.minPrice || wine.price > wineFilter.maxPrice) {
          return false;
        }
      }
      
      // Region filter
      if (wineFilter.regions.length > 0 && !wineFilter.regions.includes(wine.region)) {
        return false;
      }
      
      // Vintage filter
      if (wine.vintage !== null && wine.vintage !== undefined) {
        if (wine.vintage < wineFilter.vintageRange[0] || wine.vintage > wineFilter.vintageRange[1]) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

  // Shuffle wines for user-specific randomization
  const shuffleWines = useCallback((wineList: Wine[], userId?: string) => {
    const shuffled = [...wineList];
    // Simple shuffle algorithm - you can improve this with user-specific seeding
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Helper function to get default filter
  const getDefaultFilter = (): WineFilter => ({
    // New-style filters matching Web App
    grape: [],
    country: [],
    region: [],
    producer: [],
    wineType: [],
    color: [],
    sweetness: [],
    productionType: [],
    unit: [],
    alcohol: [],
    price: [],
    
    // Legacy compatibility
    wineTypes: [],
    maxPrice: 1000,
    minPrice: 0,
    regions: [],
    grapeVarieties: [],
    vintageRange: [1990, new Date().getFullYear()],
    alcoholRange: [0, 20],
  });

  // Update filtered wines when wines or filter changes
  useEffect(() => {
    const filtered = filterWines(wines, filter || getDefaultFilter());
    const shuffled = shuffleWines(filtered, user?.id);
    setFilteredWines(shuffled);
    setCurrentIndex(0);
  }, [wines, filter, user?.id, filterWines, shuffleWines]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const currentWine = filteredWines[currentIndex];
    
    if (direction === 'right' && currentWine && onMatch) {
      // Wine liked - trigger match
      onMatch(currentWine);
    }
    
    // Move to next wine after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, filteredWines, onMatch, isAnimating]);

  const currentWine = filteredWines[currentIndex];

  if (!currentWine) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🍷</Text>
          <Text style={styles.emptyText}>
            {filteredWines.length === 0 
              ? "Keine Weine gefunden.\nPassen Sie Ihre Filter an."
              : "Alle Weine angesehen!\nGlückwunsch! 🎉"
            }
          </Text>
          <Text style={styles.emptySubtext}>
            Swipe right für Weine die Ihnen gefallen
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wines...</Text>
        </View>
      )}
      
      {/* Wine Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} von {filteredWines.length}
        </Text>
        <TouchableOpacity 
          style={styles.matchesButton}
          onPress={() => setShowMatches(true)}
        >
          <Text style={styles.matchesButtonText}>♥ {i18n.t('ui.matches')}</Text>
        </TouchableOpacity>
      </View>

      {/* Wine Card */}
      <View style={styles.cardContainer}>
        <WineCard
          wine={currentWine}
          onSwipe={handleSwipe}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe right um zu liken ♥ • Swipe left um zu skippen ✕
        </Text>
      </View>

      {/* Matches Modal */}
      <Modal
        visible={showMatches}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MatchesScreen onClose={() => setShowMatches(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  matchesButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  matchesButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 18,
    color: '#721c24',
    fontWeight: '600',
  },
});