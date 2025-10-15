module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-url-polyfill|@supabase)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
