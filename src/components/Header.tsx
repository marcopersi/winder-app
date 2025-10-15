import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  onOpenFilter: () => void;
  onLogout?: () => void;
  onLogin?: () => void;
  filterCount?: number;
  isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenFilter, 
  onLogout, 
  onLogin, 
  filterCount = 0,
  isAuthenticated = false 
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Winder</Text>
        
        <View style={styles.rightButtons}>
          {/* Show logout button if authenticated, otherwise show login button */}
          {isAuthenticated && onLogout && (
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={onLogout}
            >
              <Text style={styles.logoutIcon}>⏻</Text>
            </TouchableOpacity>
          )}
          
          {!isAuthenticated && onLogin && (
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={onLogin}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={onOpenFilter}
          >
            <Text style={styles.filterIcon}>☰</Text>
            {filterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#721c24',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#721c24',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'serif',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 16,
    color: '#fff',
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIcon: {
    fontSize: 20,
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#721c24',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;