import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Maize', 'Tomato', 'Cashew', 'Cassava'];

  const recentScans = [
    { id: 1, title: 'Maize Field', status: 'Healthy', conf: '99%', temp: '22°C', img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop' },
    { id: 2, title: 'Tomato Plot', status: 'Leaf Curl', conf: '87%', temp: '25°C', img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=600&auto=format&fit=crop' },
  ];

  const handleScan = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      navigation.navigate('Analysis', { imageUri: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=33' }} style={styles.profilePic} />
            <View>
              <Text style={styles.greetingText}>Hello 👋</Text>
              <Text style={styles.nameText}>Farmer Smith</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellIcon}>
            <Ionicons name="notifications-outline" size={24} color="#064e3b" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main Scan Card (Glassmorphism) */}
        <View style={styles.scanCardContainer}>
          <View style={styles.scanCardBlur}>
            <View style={styles.scanCardContent}>
              <View style={styles.scanTextContainer}>
                <Text style={styles.scanCardTitle}>Crop Health Overview</Text>
                <Text style={styles.scanCardSub}>AI Diagnostic Scanner</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Ionicons name="sunny-outline" size={16} color="#f59e0b" />
                    <Text style={styles.statLabel}>Light</Text>
                    <Text style={styles.statValue}>High</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Ionicons name="water-outline" size={16} color="#3b82f6" />
                    <Text style={styles.statLabel}>Humid</Text>
                    <Text style={styles.statValue}>60%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Ionicons name="thermometer-outline" size={16} color="#ef4444" />
                    <Text style={styles.statLabel}>Temp</Text>
                    <Text style={styles.statValue}>28°C</Text>
                  </View>
                </View>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=400&auto=format&fit=crop' }} style={styles.scanCardImage} />
            </View>
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.scanButtonText}>Scan New Crop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Scans Grid */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          
          <View style={styles.gridContainer}>
            {recentScans.map((scan) => (
              <TouchableOpacity key={scan.id} style={styles.gridCard} onPress={() => navigation.navigate('Results', { diseaseId: scan.status === 'Healthy' ? 'Maize healthy' : 'Tomato leaf curl', confidence: 0.95 })}>
                <Image source={{ uri: scan.img }} style={styles.gridImage} />
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons name="heart-outline" size={18} color="#064e3b" />
                </TouchableOpacity>
                <View style={styles.gridDetails}>
                  <View style={styles.gridBadgeRow}>
                    <View style={styles.gridBadge}><Ionicons name="sunny" size={12} color="#f59e0b" /><Text style={styles.gridBadgeText}>{scan.temp}</Text></View>
                    <View style={styles.gridBadge}><Ionicons name="analytics" size={12} color="#3b82f6" /><Text style={styles.gridBadgeText}>{scan.conf}</Text></View>
                  </View>
                  <Text style={styles.gridCardTitle}>{scan.title}</Text>
                  <Text style={styles.gridCardSub}>{scan.status}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>View Report</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 100 }} /> {/* Padding for tab bar */}
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <View style={styles.floatingTabContainer}>
        <BlurView intensity={80} tint="light" style={styles.floatingTab}>
          <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="time-outline" size={24} color="#064e3b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItemCentral} onPress={handleScan}>
            <Ionicons name="camera" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#064e3b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="person-outline" size={24} color="#064e3b" />
          </TouchableOpacity>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0fdf4' },
  container: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profilePic: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  greetingText: { fontSize: 14, color: '#475569' },
  nameText: { fontSize: 18, fontWeight: '700', color: '#064e3b' },
  bellIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  
  filterScroll: { marginBottom: 24, maxHeight: 40 },
  filterContainer: { paddingRight: 20, gap: 10 },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  filterPillActive: { backgroundColor: '#064e3b', borderColor: '#064e3b' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#475569' },
  filterTextActive: { color: '#fff' },

  scanCardContainer: { marginBottom: 30, borderRadius: 24, backgroundColor: '#d1fae5', padding: 16, overflow: 'hidden' },
  scanCardBlur: { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', padding: 16 },
  scanCardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  scanTextContainer: { flex: 1, paddingRight: 10 },
  scanCardTitle: { fontSize: 18, fontWeight: '700', color: '#064e3b', marginBottom: 4 },
  scanCardSub: { fontSize: 13, color: '#047857', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { backgroundColor: '#fff', padding: 8, borderRadius: 12, alignItems: 'center', minWidth: 50 },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 4 },
  statValue: { fontSize: 12, fontWeight: '700', color: '#064e3b' },
  scanCardImage: { width: 100, height: 140, borderRadius: 16, position: 'absolute', right: -10, top: -20 },
  scanButton: { backgroundColor: '#064e3b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, marginTop: 16 },
  scanButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#064e3b' },
  seeAll: { fontSize: 14, color: '#10b981', fontWeight: '600' },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCard: { width: (width - 55) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  gridImage: { width: '100%', height: 120, borderRadius: 16, marginBottom: 10 },
  heartIcon: { position: 'absolute', top: 18, right: 18, backgroundColor: 'rgba(255,255,255,0.8)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  gridDetails: { padding: 4 },
  gridBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  gridBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gridBadgeText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  gridCardTitle: { fontSize: 15, fontWeight: '700', color: '#064e3b', marginBottom: 2 },
  gridCardSub: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  statusPill: { backgroundColor: '#064e3b', paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  statusPillText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  floatingTabContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  floatingTab: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 30, padding: 8, alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  tabItem: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tabItemActive: { backgroundColor: '#064e3b' },
  tabItemCentral: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -15 }], shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});
