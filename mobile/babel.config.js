module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/store': './src/store',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@/navigation': './src/navigation',
            '@/assets': './assets'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};