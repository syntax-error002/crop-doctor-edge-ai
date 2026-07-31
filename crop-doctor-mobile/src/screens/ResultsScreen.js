import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import treatmentsData from '../data/treatments.json';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const { diseaseId = 'Unknown', confidence = 0.95, imageUri: passedImageUri } = route.params || {};
  
  // Normalize by replacing spaces with underscores and lowercasing for comparison
  const normalizedSearchId = diseaseId.toLowerCase().replace(/ /g, '_').replace(/_+/g, '_');
  
  const foundKey = Object.keys(treatmentsData).find(key => {
    const normalizedKey = key.toLowerCase().replace(/_+/g, '_');
    return normalizedKey === normalizedSearchId || normalizedKey.includes(normalizedSearchId) || normalizedSearchId.includes(normalizedKey);
  });
  
  const isHealthy = diseaseId.toLowerCase().includes('healthy');
  
  // Create a dynamic fallback if not found in treatments.json
  const cropParts = diseaseId.split(' ');
  const fallbackCrop = cropParts[0];
  const fallbackName = cropParts.slice(1).join(' ') || (isHealthy ? 'Healthy' : 'Unknown Condition');

  const diseaseInfo = foundKey ? treatmentsData[foundKey] : {
    name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
    crop: fallbackCrop.charAt(0).toUpperCase() + fallbackCrop.slice(1),
    severity: isHealthy ? 'None' : 'Moderate',
    description: `The AI has identified this as ${diseaseId}. Please consult a local agronomist for targeted treatments.`,
    symptoms: [],
    treatments: [],
    prevention: isHealthy ? 'Maintain current healthy farming practices.' : 'Monitor crops regularly and ensure proper watering and soil nutrition.'
  };
  
  const confPercent = Math.round(confidence * 100);
  
  // Use the scanned image, fallback to placeholder if accessed without a scan
  const imageUri = passedImageUri || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Details</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.heroImage} />
            <View style={styles.fadeOverlay} />
          </View>
          
          <View style={styles.sideStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Crop</Text>
              <Text style={styles.statValue}>{diseaseInfo.crop}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={styles.statValue}>{confPercent}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{isHealthy ? 'Healthy' : 'Infected'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Severity</Text>
              <Text style={[styles.statValue, { color: diseaseInfo.severity === 'High' ? '#ef4444' : '#1a4314' }]}>{diseaseInfo.severity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>
            <Text style={styles.priceTag}>{isHealthy ? 'Safe' : 'Alert'}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tagItem}>
              <Ionicons name="water-outline" size={14} color="#3b82f6" />
              <Text style={styles.tagText}>{isHealthy ? 'Optimal' : 'Needs Care'}</Text>
            </View>
            <View style={styles.tagDivider} />
            <View style={styles.tagItem}>
              <Ionicons name="time-outline" size={14} color="#111827" />
              <Text style={styles.tagText}>{isHealthy ? 'Routine' : 'Apply ASAP'}</Text>
            </View>
            <View style={styles.tagDivider} />
            <View style={styles.tagItem}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.tagText}>Organic</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {diseaseInfo.description} <Text style={styles.readMore}>Read more</Text>
          </Text>

          {diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Key Symptoms</Text>
                <TouchableOpacity><Text style={styles.moreDetailsText}>More Details ⌄</Text></TouchableOpacity>
              </View>
              {diseaseInfo.symptoms.map((symp, idx) => (
                <View key={idx} style={styles.symptomRow}>
                  <View style={styles.symptomDot} />
                  <Text style={styles.symptomText}>{symp}</Text>
                </View>
              ))}
            </>
          )}

          {diseaseInfo.treatments && diseaseInfo.treatments.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Treatment Plan</Text>
              </View>
              {diseaseInfo.treatments.map((treatment, idx) => (
                <View key={idx} style={styles.treatmentCard}>
                  <View style={styles.treatmentIconBox}>
                    <Ionicons name="leaf" size={20} color="#1a4314" />
                  </View>
                  <View style={styles.treatmentContent}>
                    <Text style={styles.treatmentTitle}>{treatment.title}</Text>
                    <Text style={styles.treatmentDesc}>{treatment.desc}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {diseaseInfo.prevention && (
            <>
              <Text style={styles.sectionTitle}>Prevention</Text>
              <View style={styles.preventionBox}>
                <Ionicons name="shield-checkmark" size={20} color="#1a4314" style={{ marginTop: 2 }} />
                <Text style={styles.preventionText}>{diseaseInfo.prevention}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={24} color="#1a4314" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buyButtonText}>Save Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fbf2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  container: { paddingBottom: 100 },
  
  heroSection: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, justifyContent: 'space-between' },
  imageWrapper: { width: width * 0.6, height: 320, borderRadius: 30, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  fadeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(249, 251, 242, 0.4)' },
  
  sideStats: { width: width * 0.28, justifyContent: 'center', paddingVertical: 10, gap: 20 },
  statBox: { marginBottom: 5 },
  statLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: '600', color: '#1a4314' },

  detailsContainer: { paddingHorizontal: 20, marginTop: 15 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  diseaseName: { fontSize: 26, fontWeight: '800', color: '#111827', flex: 1, paddingRight: 10 },
  priceTag: { fontSize: 20, fontWeight: '800', color: '#1a4314' },

  tagsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  tagItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },
  tagDivider: { width: 1, height: 12, backgroundColor: '#d1d5db', marginHorizontal: 12 },

  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 15 },
  moreDetailsText: { fontSize: 13, fontWeight: '600', color: '#1a4314' },
  descriptionText: { fontSize: 14, color: '#6b7280', lineHeight: 24, marginBottom: 15 },
  readMore: { color: '#111827', fontWeight: '600', textDecorationLine: 'underline' },
  
  symptomRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  symptomDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a4314', marginTop: 9, marginRight: 10 },
  symptomText: { fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 },

  treatmentCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  treatmentIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eef6e1', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  treatmentContent: { flex: 1 },
  treatmentTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  treatmentDesc: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  
  preventionBox: { flexDirection: 'row', backgroundColor: '#eef6e1', padding: 16, borderRadius: 20, marginBottom: 20, gap: 12 },
  preventionText: { flex: 1, fontSize: 14, color: '#1a4314', lineHeight: 22, fontWeight: '500' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f9fbf2', flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20, gap: 15, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  likeButton: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#eef6e1', alignItems: 'center', justifyContent: 'center' },
  buyButton: { flex: 1, height: 60, borderRadius: 20, backgroundColor: '#1a4314', alignItems: 'center', justifyContent: 'center', shadowColor: '#1a4314', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  buyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
