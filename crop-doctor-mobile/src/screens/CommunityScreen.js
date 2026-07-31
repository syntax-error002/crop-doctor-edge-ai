import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function CommunityScreen({ navigation }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // In a real app, you would use PostGIS for geospatial queries.
      // For now, we fetch all profiles except the current user's.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (error) throw error;
      setFarmers(data || []);
    } catch (e) {
      console.error('Error fetching farmers:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderFarmer = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Chat', { recipient: item })}
    >
      <Image 
        source={{ uri: item.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }} 
        style={styles.avatar} 
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name || 'Anonymous Farmer'}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color="#1a4314" />
          <Text style={styles.locationText}>{item.location || 'Nearby'}</Text>
        </View>
        <Text style={styles.cropText}>Grows: {item.primary_crop || 'Various Crops'}</Text>
      </View>
      <View style={styles.actionBtn}>
        <Ionicons name="chatbubbles" size={20} color="#1a4314" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Farmers</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a4314" />
        </View>
      ) : farmers.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={60} color="#cbd5e1" />
          <Text style={styles.emptyText}>No nearby farmers found.</Text>
        </View>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fbf2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 10 },
  
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  locationText: { fontSize: 12, color: '#1a4314', fontWeight: '500' },
  cropText: { fontSize: 12, color: '#64748b' },
  
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eef6e1', alignItems: 'center', justifyContent: 'center' }
});
