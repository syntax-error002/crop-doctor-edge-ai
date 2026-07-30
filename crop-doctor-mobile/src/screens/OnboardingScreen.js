import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#e6f7e6', '#cbf3d2', '#a3e8b3']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.titleThin}>Identify</Text>
          <Text style={styles.titleMedium}>Protect</Text>
          <Text style={styles.titleBold}>Harvest</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop' }}
            style={styles.plantImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.subtitle}>
            Smart crop care made simple with disease tracking, organic treatments & tips.
          </Text>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: 20,
  },
  titleThin: {
    fontSize: 42,
    fontWeight: '300',
    color: '#064e3b',
    lineHeight: 48,
  },
  titleMedium: {
    fontSize: 42,
    fontWeight: '500',
    color: '#064e3b',
    lineHeight: 48,
  },
  titleBold: {
    fontSize: 42,
    fontWeight: '800',
    color: '#064e3b',
    lineHeight: 48,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantImage: {
    width: width * 0.9,
    height: width * 1.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#064e3b',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#064e3b',
    fontSize: 15,
    fontWeight: '500',
  },
});
