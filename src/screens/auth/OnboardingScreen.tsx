import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌱',
    title: 'Welcome to PlantPal!',
    subtitle: 'Your personal plant care companion.\nNever let a plant go thirsty again.',
  },
  {
    id: '2',
    emoji: '📸',
    title: 'Snap & Identify',
    subtitle: 'Take a photo of any plant and we\'ll identify it instantly using AI.',
  },
  {
    id: '3',
    emoji: '💧',
    title: 'Get Reminded',
    subtitle: 'We\'ll send you (very judgemental) reminders when your plants need water.',
  },
];

/** Onboarding screen with swipeable slides. */
export const OnboardingScreen = ({ navigation }: Props) => {
  const { colors, typography } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      flatListRef.current?.scrollToIndex({ index: next });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.skip, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={[styles.slideTitle, typography.title1, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text
              style={[styles.slideSubtitle, typography.body, { color: colors.textSecondary }]}
            >
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? colors.primary : colors.border,
                width: i === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started 🌿' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.signupRow}
          activeOpacity={0.7}
        >
          <Text style={[styles.signupText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skip: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    flex: 1,
    gap: 16,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  slideTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  slideSubtitle: {
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  signupRow: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
  },
});
