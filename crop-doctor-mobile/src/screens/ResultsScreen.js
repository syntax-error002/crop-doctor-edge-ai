import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import treatmentsData from '../data/treatments.json';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const { diseaseId = 'Tomato leaf curl', confidence = 0.95 } = route.params || {};
  const safeDiseaseId = Object.keys(treatmentsData).find(key => key.toLowerCase() === diseaseId.toLowerCase()) || 'Tomato healthy'; const diseaseInfo = treatmentsData[safeDiseaseId] || treatmentsData['Tomato healthy'];
  
  const isHealthy = diseaseId.toLowerCase().includes('healthy');
  const confPercent = Math.round(confidence * 100);
  
  // Use a nice placeholder image for the results matching the vibe
  const imageUri = 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#064e3b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Details</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={22} color="#064e3b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Crop Type</Text>
              <Text style={styles.statValue}>{diseaseInfo.crop}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Severity</Text>
              <Text style={[styles.statValue, { color: diseaseInfo.severity === 'High' ? '#ef4444' : '#f59e0b' }]}>
                {diseaseInfo.severity}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={styles.statValue}>{confPercent}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{isHealthy ? 'Healthy' : 'Infected'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.titleRow}>
            <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>Organic</Text>
            </View>
          </View>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="water-outline" size={14} color="#3b82f6" />
              <Text style={styles.quickInfoText}>Needs Treatment</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.quickInfoText}>Apply ASAP</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {diseaseInfo.description}
          </Text>

          {diseaseInfo.symptoms && (
            <>
              <Text style={styles.sectionTitle}>Key Symptoms</Text>
              {diseaseInfo.symptoms.map((symp, idx) => (
                <View key={idx} style={styles.symptomRow}>
                  <View style={styles.symptomDot} />
                  <Text style={styles.symptomText}>{symp}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="heart-outline" size={24} color="#064e3b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>View Treatment Plan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0fdf4' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#064e3b' },
  container: { paddingBottom: 30 },
  
  heroSection: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, justifyContent: 'space-between' },
  heroImage: { width: width * 0.55, height: width * 0.75, borderRadius: 24, resizeMode: 'cover' },
  statsContainer: { width: width * 0.3, justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { marginBottom: 15 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#064e3b' },

  detailsSection: { paddingHorizontal: 20, marginTop: 30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 30, flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  diseaseName: { fontSize: 24, fontWeight: '800', color: '#064e3b', flex: 1, paddingRight: 10 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#d97706' },

  quickInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickInfoText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  divider: { width: 1, height: 12, backgroundColor: '#cbd5e1', marginHorizontal: 15 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#064e3b', marginBottom: 8, marginTop: 10 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 15 },
  
  symptomRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  symptomDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginTop: 8, marginRight: 10 },
  symptomText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 },

  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 15 },
  saveButton: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d1fae5' },
  primaryButton: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#064e3b', alignItems: 'center', justifyContent: 'center', shadowColor: '#064e3b', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
