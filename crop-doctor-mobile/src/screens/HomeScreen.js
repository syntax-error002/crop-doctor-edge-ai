import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const WEATHER_API_KEY = '1589f7e554414a26b8e142913242110';

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Maize', 'Tomato', 'Cashew'];
  
  const [recentScans, setRecentScans] = useState([]);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('Fetching location...');
  
  // Crop suggestions based on region
  const [suggestedCrops, setSuggestedCrops] = useState([
    { id: 1, name: 'Tomato', img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=200&auto=format&fit=crop' },
    { id: 2, name: 'Maize', img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=200&auto=format&fit=crop' },
    { id: 3, name: 'Wheat', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&auto=format&fit=crop' }
  ]);

  // Load Recent Scans
  useFocusEffect(
    useCallback(() => {
      const loadScans = async () => {
        try {
          const saved = await AsyncStorage.getItem('recentScans');
          if (saved) setRecentScans(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load scans', e);
        }
      };
      loadScans();
    }, [])
  );

  // Fetch Weather and Location on Mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location Access Denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`);
        const data = await response.json();
        setWeather({
          temp: `${data.current.temp_c}°C`,
          humidity: `${data.current.humidity}%`,
          cloud: `${data.current.cloud}%`
        });
        setLocationName(data.location.name + ', ' + data.location.country);
      } catch (error) {
        console.error("Weather fetch failed", error);
        setLocationName('Weather Unavailable');
      }
    })();
  }, []);

  const handleScan = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('Analysis', { imageUri: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }} style={styles.profileImage} />
            <View>
              <Text style={styles.helloText}>Current Location</Text>
              <Text style={styles.nameText}>{locationName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color="#1a4314" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero Card */}
        <TouchableOpacity style={styles.heroCard} onPress={handleScan}>
          <View style={styles.heroContent}>
            <Text style={styles.heroSubtitle}>AI Crop Doctor</Text>
            <Text style={styles.heroTitle}>Start Diagnosis</Text>
            
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Ionicons name="cloudy-outline" size={16} color="#6b7280" />
                <Text style={styles.heroStatLabel}>Cloud</Text>
                <Text style={styles.heroStatValue}>{weather ? weather.cloud : '--'}</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Ionicons name="water-outline" size={16} color="#3b82f6" />
                <Text style={styles.heroStatLabel}>Humid</Text>
                <Text style={styles.heroStatValue}>{weather ? weather.humidity : '--'}</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Ionicons name="thermometer-outline" size={16} color="#ef4444" />
                <Text style={styles.heroStatLabel}>Temp</Text>
                <Text style={styles.heroStatValue}>{weather ? weather.temp : '--'}</Text>
              </View>
            </View>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.heroImage} 
          />
        </TouchableOpacity>

        {/* AI Crop Suggestions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grows well near you</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContainer}>
          {suggestedCrops.map(crop => (
            <TouchableOpacity 
              key={crop.id} 
              style={styles.suggestionCard}
              onPress={() => navigation.navigate('CropDetails', { cropName: crop.name, location: locationName, temp: weather?.temp })}
            >
              <Image source={{ uri: crop.img }} style={styles.suggestionImg} />
              <View style={styles.suggestionOverlay}>
                <Text style={styles.suggestionTitle}>{crop.name}</Text>
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={10} color="#1a4314" />
                  <Text style={styles.aiBadgeText}>AI Guide</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Scans Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {recentScans.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 20 }}>
              <Text style={styles.emptyText}>No recent scans found.</Text>
            </View>
          ) : (
            recentScans.map((scan) => (
              <TouchableOpacity key={scan.id} style={styles.gridCard} onPress={() => navigation.navigate('Results', { diseaseId: scan.status === 'Healthy' ? 'Maize healthy' : scan.status, confidence: parseFloat(scan.conf)/100, imageUri: scan.img })}>
                <Image source={{ uri: scan.img }} style={styles.gridImage} />
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons name="heart" size={18} color="#1a4314" />
                </TouchableOpacity>
                <View style={styles.gridDetails}>
                  <Text style={styles.gridCardTitle}>{scan.title}</Text>
                  <View style={styles.gridBottomRow}>
                    <Text style={styles.gridCardSub}>{scan.status}</Text>
                    <View style={styles.pillBadge}>
                      <Text style={styles.pillBadgeText}>{scan.conf}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={styles.floatingNav}>
        <View style={styles.navInner}>
          <TouchableOpacity style={styles.navItemActive}>
            <Ionicons name="home" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="heart-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fbf2' },
  container: { paddingBottom: 30 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImage: { width: 44, height: 44, borderRadius: 22 },
  helloText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bellButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  
  filterContainer: { paddingHorizontal: 20, marginBottom: 25 },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#eef6e1', marginRight: 10 },
  activeFilterPill: { backgroundColor: '#1a4314' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  activeFilterText: { color: '#fff' },

  heroCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 30, overflow: 'hidden' },
  heroContent: { flex: 1, zIndex: 2 },
  heroSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 4, fontWeight: '500' },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#1a4314', marginBottom: 20 },
  heroStatsRow: { flexDirection: 'row', gap: 12 },
  heroStatItem: { alignItems: 'center', backgroundColor: '#f8fafc', padding: 8, borderRadius: 12, minWidth: 46 },
  heroStatLabel: { fontSize: 10, color: '#6b7280', marginTop: 4, marginBottom: 2 },
  heroStatValue: { fontSize: 11, fontWeight: '700', color: '#111827' },
  heroImage: { width: 120, height: 160, position: 'absolute', right: -20, bottom: -20, resizeMode: 'contain', zIndex: 1 },

  suggestionsContainer: { paddingHorizontal: 20, marginBottom: 30, gap: 15 },
  suggestionCard: { width: 140, height: 100, borderRadius: 16, overflow: 'hidden' },
  suggestionImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  suggestionOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  suggestionTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  aiBadge: { flexDirection: 'row', backgroundColor: '#eef6e1', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, alignItems: 'center', gap: 2 },
  aiBadgeText: { fontSize: 9, fontWeight: '700', color: '#1a4314' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#1a4314' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  gridCard: { width: (width - 55) / 2, backgroundColor: '#eef6e1', borderRadius: 20, padding: 12, marginBottom: 15 },
  gridImage: { width: '100%', height: 110, resizeMode: 'cover', borderRadius: 12, marginBottom: 10 },
  heartIcon: { position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  gridDetails: { marginTop: 4 },
  gridCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  gridBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridCardSub: { fontSize: 11, color: '#6b7280', flex: 1 },
  pillBadge: { backgroundColor: '#1a4314', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  pillBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },

  floatingNav: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  navInner: { flexDirection: 'row', backgroundColor: '#2d3748cc', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20, width: '80%', justifyContent: 'space-between', alignItems: 'center' },
  navItem: { padding: 10 },
  navItemActive: { backgroundColor: '#1a4314', padding: 12, borderRadius: 20 },
});
