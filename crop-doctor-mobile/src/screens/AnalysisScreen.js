import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyzeImage } from '../services/imageProcessing';

export default function AnalysisScreen({ route, navigation }) {
  const { imageUri } = route.params || {};
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Scanning line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 200, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Run inference and navigate to Results
    const runInference = async () => {
      try {
        const result = await analyzeImage(imageUri);
        navigation.replace('Results', { ...result, imageUri });
      } catch (e) {
        alert("Failed to analyze image. Ensure backend is running.");
        navigation.goBack();
      }
    };

    if (imageUri) {
      runInference();
    } else {
      navigation.goBack();
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="scan-outline" size={64} color="#064e3b" />
        </Animated.View>
        
        <Text style={styles.title}>Diagnosing Crop...</Text>
        <Text style={styles.subtitle}>Running AI models against 22 distinct disease profiles.</Text>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#d1fae5' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrapper: { marginBottom: 20, backgroundColor: '#a3e8b3', padding: 20, borderRadius: 50 },
  title: { fontSize: 24, fontWeight: '800', color: '#064e3b', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  imageContainer: { width: 200, height: 200, borderRadius: 24, overflow: 'hidden', borderWidth: 4, borderColor: '#064e3b', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
});
