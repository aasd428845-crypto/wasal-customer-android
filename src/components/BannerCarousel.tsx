import React, { useState, useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import type { DeliveryBanner } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 24;

interface Props {
  banners: DeliveryBanner[];
  onBannerPress?: (banner: DeliveryBanner) => void;
}

export default function BannerCarousel({ banners, onBannerPress }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIdx(idx);
  };

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.slide}
            onPress={() => onBannerPress?.(banner)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: banner.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
            {banner.badge_text && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{banner.badge_text}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIdx && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Need Text import
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  slide: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#52B788',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#52B788',
  },
});
