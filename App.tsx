import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SwipeContainer } from './src/components/SwipeContainer';
import Header from './src/components/Header';
import FilterMenu from './src/components/FilterMenu';
import { Wine, WineFilter } from './src/types';
import { userPreferenceService } from './src/services/userPreferenceService';
import { useSupabaseAuth } from './src/hooks/useSupabaseAuth';
import { createDefaultFilter, convertToDBFilter } from './src/utils/filterUtils';
import { referenceDataService } from './src/services/referenceDataService';

// Sample initial filter - in production this would come from user preferences
const initialFilter: WineFilter = createDefaultFilter();

function App(): React.JSX.Element {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<WineFilter>(initialFilter);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { user, loading: authLoading, signOut } = useSupabaseAuth();

  // Fetch wines with filters applied - works with or without user login
  const fetchWinesWithFilters = async (filter: WineFilter) => {
    try {
      setLoading(true);
      console.log('Fetching wines with filter:', filter);
      
      // Convert frontend filter to database filter
      const dbFilter = await convertToDBFilter(filter);
      
      // If user is logged in, get unrated wines for them
      if (user?.id) {
        const unratedWines = await userPreferenceService.getUnratedWinesWithFilters(user.id, dbFilter, 100);
        console.log('Fetched filtered wines for user:', unratedWines.length);
        setWines(unratedWines);
      } else {
        // Guest mode: load all wines with filters applied
        const { fetchWines } = await import('./src/services/wineQueries');
        const allWines = await fetchWines(dbFilter);
        console.log('Fetched filtered wines for guest:', allWines.length);
        setWines(allWines);
      }
    } catch (error) {
      console.error('Error fetching filtered wines:', error);
      console.log('Using sample wine data as fallback');
      setSampleWines();
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = async (newFilter: WineFilter) => {
    setCurrentFilter(newFilter);
    await fetchWinesWithFilters(newFilter);
  };

  // Count active filters for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilter.wineTypes.length > 0) count++;
    if (currentFilter.regions.length > 0) count++;
    if (currentFilter.grapeVarieties.length > 0) count++;
    if (currentFilter.grape?.length > 0) count++;
    if (currentFilter.country?.length > 0) count++;
    if (currentFilter.region?.length > 0) count++;
    if (currentFilter.wineType?.length > 0) count++;
    if (currentFilter.color?.length > 0) count++;
    if (currentFilter.productionType?.length > 0) count++;
    if (currentFilter.minPrice > 0 || currentFilter.maxPrice < 1000) count++;
    return count;
  };

  // Initialize reference data service on app start
  useEffect(() => {
    const initializeReferenceData = async () => {
      try {
        await referenceDataService.initialize();
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
      }
    };

    initializeReferenceData();
  }, []);

  // Fetch wines from Supabase - works for both logged-in users and guests
  useEffect(() => {
    const fetchWines = async () => {
      try {
        // Load wines with current filter (works for both logged-in and guest users)
        if (user?.id) {
          console.log('Fetching wines for user:', user.id, 'Email:', user.email);
        } else {
          console.log('Fetching wines for guest user');
        }
        await fetchWinesWithFilters(currentFilter);
      } catch (error) {
        console.error('Error fetching wines:', error);
        console.log('Using sample wine data as fallback');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch wines, regardless of authentication status
    fetchWines();
  }, [user]);

  const handleMatch = async (wine: Wine) => {
    console.log('Wine liked:', wine.name);
    
    // Guest mode: just skip to next wine without saving
    if (!user?.id) {
      console.log('Guest mode: Wine liked but not saved (no user logged in)');
      return;
    }

    // Logged-in user: save preference to database
    try {
      if (!wine.id) {
        console.error('Wine ID is missing:', wine);
        return;
      }

      console.log('Saving wine preference for user:', user.id, 'wine:', wine.id);
      
      // Speichere das Like in der Datenbank
      await userPreferenceService.likeWine(user.id, wine.id);
      console.log('Wine preference saved to database successfully');
      
    } catch (error) {
      console.error('Error saving wine preference:', error);
      
      // Detaillierte Fehleranalyse
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Show user-friendly error message
      console.log('Failed to save preference, but continuing with app flow');
    }
  };

  // Show loading screen while auth is initializing or wines are loading
  if (authLoading || loading) {
    return (
      <SafeAreaProvider>
        <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 50 }}>
          {authLoading ? 'Checking authentication...' : 'Loading wines...'}
        </Text>
      </SafeAreaProvider>
    );
  }

  // Main app - works for both logged-in users and guests
  // Guest users can swipe wines but cannot save preferences
  return (
    <SafeAreaProvider>
      <Header 
        onOpenFilter={() => setIsFilterVisible(true)}
        onLogout={async () => {
          try {
            if (user) {
              await signOut();
            }
          } catch (error) {
            console.error('Logout failed:', error);
          }
        }}
        onLogin={() => {
          console.log('Login requested - showing AuthScreen');
          // Navigate to auth screen by triggering state change
          // For now just log - full implementation would show AuthScreen modal or navigate
        }}
        filterCount={getActiveFilterCount()}
        isAuthenticated={!!user}
      />
      
      <SwipeContainer
        wines={wines}
        filter={currentFilter}
        onMatch={handleMatch}
        loading={loading}
      />

      <FilterMenu
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />
    </SafeAreaProvider>
  );
}

export default App;
