import { useColorScheme } from 'react-native';

const light = {
  bg: '#F6F7F9',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  track: '#E5E7EB',
  primary: '#10B981',
};

const dark = {
  bg: '#0B0F14',
  card: '#151B23',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: '#232B36',
  track: '#2A3340',
  primary: '#34D399',
};

export type Theme = typeof light;

export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);
