import { supabase } from '../lib/supabase';
import { Wine, DatabaseWineFilter } from '../types';
import { fetchWines } from './wineQueries';

/**
 * User wine match operations
 * Speichert gelikte Weine in user_wine_matches Tabelle
 * Schema: id, user_id, wine_id, created_at
 * Ein Eintrag = geliked, kein Eintrag = nicht geliked
 */

export interface UserWineMatch {
  id: string;
  user_id: string;
  wine_id: string;
  created_at: string;
  wine?: Wine; // Optional populated wine data
}

export const userPreferenceService = {
  // Gelikte Weine speichern
  likeWine: async (userId: string, wineId: string): Promise<void> => {
    try {
      console.log('Saving wine preference:', { userId, wineId });
      
      // Validate inputs
      if (!userId || !wineId) {
        throw new Error(`Invalid parameters: userId=${userId}, wineId=${wineId}`);
      }

      // Get the actual UUID for this wine from reference_id
      const { data: wineData, error: wineError } = await supabase
        .from('wines')
        .select('id')
        .eq('reference_id', wineId)
        .maybeSingle();
      
      if (wineError) {
        console.error('Error fetching wine UUID:', wineError);
        throw wineError;
      }
      
      if (!wineData) {
        console.error(`Wine with reference_id ${wineId} not found in database`);
        throw new Error(`Wine with reference_id ${wineId} not found in database`);
      }
      
      const actualWineId = wineData.id;
      console.log('Using actual wine UUID:', actualWineId);

      // Store in Supabase using the actual UUID
      const { error } = await supabase
        .from('user_wine_matches')
        .insert({ 
          user_id: userId, 
          wine_id: actualWineId 
        });

      if (error) {
        if (error.code === '23505') { // Unique violation - wine already matched
          console.log('Wine already matched - this is fine');
          return;
        }
        console.error('Error saving match to database:', error);
        throw error;
      }
      
      console.log('Wine preference saved successfully');
    } catch (error) {
      console.error('Error in likeWine function:', error);
      throw error;
    }
  },

  // Match entfernen / Unlike
  removeLike: async (userId: string, wineId: string): Promise<void> => {
    try {
      console.log('Removing wine preference:', { userId, wineId });
      
      // Get the actual UUID for this wine from reference_id
      const { data: wineData, error: wineError } = await supabase
        .from('wines')
        .select('id')
        .eq('reference_id', wineId)
        .maybeSingle();
      
      if (wineError) {
        console.error('Error fetching wine UUID:', wineError);
        throw wineError;
      }
      
      if (!wineData) {
        console.error(`Wine with reference_id ${wineId} not found in database`);
        throw new Error(`Wine with reference_id ${wineId} not found in database`);
      }
      
      const actualWineId = wineData.id;
      
      // Remove from Supabase using the actual UUID
      const { error } = await supabase
        .from('user_wine_matches')
        .delete()
        .eq('user_id', userId)
        .eq('wine_id', actualWineId);
      
      if (error) {
        console.error('Error removing wine preference:', error);
        throw error;
      }
      
      console.log('Wine preference removed successfully');
    } catch (error) {
      console.error('Error in removeLike function:', error);
      throw error;
    }
  },

  // Wein disliken (Match entfernen)
  dislikeWine: async (userId: string, wineId: string): Promise<void> => {
    // Disliken = Match entfernen
    return userPreferenceService.removeLike(userId, wineId);
  },

  // Alle gelikten Weine eines Users laden
  getLikedWines: async (userId: string): Promise<Wine[]> => {
    try {
      console.log('Loading liked wines for user:', userId);
      
      // Erst die Matches laden (ohne Join da keine FK-Beziehung)
      const { data: matchesData, error: matchesError } = await supabase
        .from('user_wine_matches')
        .select('wine_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (matchesError) {
        console.error('Error fetching wine matches:', matchesError);
        if (matchesError.message?.includes('relation') && matchesError.message?.includes('does not exist')) {
          console.warn('user_wine_matches table does not exist - returning empty array');
          return [];
        }
        throw matchesError;
      }

      if (!matchesData || matchesData.length === 0) {
        console.log('No wine matches found for user');
        return [];
      }

      // Get all wines and filter to matched ones
      // This is simpler - let fetchWines handle all the complexity
      const allWines = await fetchWines();
      const matchedWineIds = new Set(matchesData.map(m => m.wine_id));
      
      // Filter to only matched wines
      const likedWines = allWines.filter(wine => matchedWineIds.has(wine.id));

      console.log(`[getLikedWines] Loaded ${likedWines.length} liked wines for user`);
      return likedWines;
    } catch (error) {
      console.error('Error in getLikedWines:', error);
      return []; // Return empty array on error for graceful degradation
    }
  },

  // Prüfen ob User einen Wein bereits bewertet hat
  hasUserRatedWine: async (userId: string, wineId: string): Promise<boolean> => {
    try {
      // Get the actual UUID for this wine from reference_id
      const { data: wineData, error: wineError } = await supabase
        .from('wines')
        .select('id')
        .eq('reference_id', wineId)
        .maybeSingle();
      
      if (wineError) {
        console.error('Error fetching wine UUID:', wineError);
        return false;
      }
      
      if (!wineData) {
        console.error(`Wine with reference_id ${wineId} not found in database`);
        return false;
      }
      
      const actualWineId = wineData.id;
      
      const { data, error } = await supabase
        .from('user_wine_matches')
        .select('id')
        .eq('user_id', userId)
        .eq('wine_id', actualWineId);
      
      if (error) {
        console.error('Error checking wine rating:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error in hasUserRatedWine function:', error);
      return false;
    }
  },

  // Effiziente Unrated Weine mit Filtern für User laden
  /**
   * Get unrated wines with filters applied
   * Simplified version using the new wineQueries service
   */
  getUnratedWinesWithFilters: async (
    userId: string, 
    filters?: DatabaseWineFilter, 
    limit: number = 50
  ): Promise<Wine[]> => {
    try {
      console.log('[getUnratedWinesWithFilters] Fetching for user:', userId);
      
      // Get all wines with filters from the new unified service
      const allWines = await fetchWines(filters);
      
      // Get user's rated wines
      const { data: ratedData, error: ratedError } = await supabase
        .from('user_wine_matches')
        .select('wine_id')
        .eq('user_id', userId);

      if (ratedError) {
        console.error('[getUnratedWinesWithFilters] Error fetching rated wines:', ratedError);
        // If can't get rated wines, just return all filtered wines
        return allWines.slice(0, limit);
      }

      // Filter out rated wines
      const ratedWineIds = new Set((ratedData || []).map(r => r.wine_id));
      const unratedWines = allWines.filter(wine => !ratedWineIds.has(wine.id));
      
      console.log(`[getUnratedWinesWithFilters] Found ${unratedWines.length} unrated wines`);
      return unratedWines.slice(0, limit);
    } catch (error) {
      console.error('[getUnratedWinesWithFilters] Error:', error);
      return [];
    }
  },

  /**
   * Get unrated wines for user (no filters)
   * Simplified version - just calls getUnratedWinesWithFilters with no filters
   */
  getUnratedWines: async (userId: string, limit: number = 50): Promise<Wine[]> => {
    return await userPreferenceService.getUnratedWinesWithFilters(userId, undefined, limit);
  },

  // User Statistiken abrufen
  getUserStats: async (userId: string): Promise<{
    totalRated: number;
    totalLiked: number;
    likePercentage: number;
  }> => {
    try {
      const { data, error } = await supabase
        .from('user_wine_matches')
        .select('id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
      
      // In user_wine_matches table, every entry is a liked wine
      const totalLiked = data?.length || 0;
      
      // For totalRated, we would need additional info about dislikes
      // For now, we'll assume totalRated = totalLiked (only matches are stored)
      const totalRated = totalLiked;
      const likePercentage = totalRated > 0 ? totalLiked / totalRated : 0;
      
      return {
        totalRated,
        totalLiked,
        likePercentage: Math.round(likePercentage * 100) / 100,
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        totalRated: 0,
        totalLiked: 0,
        likePercentage: 0,
      };
    }
  },
};