import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import treatmentsData from '../data/treatments.json';

const { width, height } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const { diseaseId = 'Unknown', confidence = 0.95, imageUri: passedImageUri, heatmapBase64, locationName = 'Unknown', temp = 'Unknown' } = route.params || {};
  
  const [showXAI, setShowXAI] = useState(false);
  const [aiTreatment, setAiTreatment] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  
  // Normalize by replacing spaces with underscores and lowercasing for comparison
  const normalizedSearchId = diseaseId.toLowerCase().replace(/ /g, '_').replace(/_+/g, '_');
  
  const foundKey = Object.keys(treatmentsData).find(key => {
    const normalizedKey = key.toLowerCase().replace(/_+/g, '_');
    return normalizedKey === normalizedSearchId || normalizedKey.includes(normalizedSearchId) || normalizedSearchId.includes(normalizedKey);
  });
  
  // Create a dynamic fallback if not found in treatments.json
  const cropParts = diseaseId.split(' ');
  const fallbackCrop = cropParts[0];
  const isHealthy = diseaseId.toLowerCase().includes('healthy');
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

  useEffect(() => {
    const fetchRAG = async () => {
      if (isHealthy) {
        setLoadingAI(false);
        return;
      }
      
      const baseTreatment = diseaseInfo.treatments && diseaseInfo.treatments.length > 0 ? diseaseInfo.treatments.map(t => t.desc).join(' ') : 'Standard agricultural care';
      const basePrevention = diseaseInfo.prevention;
      const prompt = `Act as an expert agronomist. The crop was diagnosed with ${diseaseInfo.name}. Here is standard baseline info:\nTreatment: ${baseTreatment}\nPrevention: ${basePrevention}\n\nThe user is in ${locationName} and the current temperature is ${temp}. Generate a highly personalized, practical action plan (3 short paragraphs) to save this crop based on this local weather and the provided baseline info. Use a warm, professional tone without markdown asterisks so it looks clean on a mobile UI.`;

      try {
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`;
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText) setAiTreatment(generatedText);
        else setAiTreatment('AI could not generate a localized guide. Fallback to standard treatment.');
      } catch (err) {
        console.error(err);
        setAiTreatment('AI could not generate a localized guide. Fallback to standard treatment.');
      } finally {
        setLoadingAI(false);
      }
    };
    
    fetchRAG();
  }, []);
  
  const confPercent = Math.round(confidence * 100);
  const imageUri = passedImageUri || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop';

  const handleSaveReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to save reports.');
        return;
      }
      
      const { error } = await supabase.from('scans').insert([{
        user_id: user.id,
        title: diseaseInfo.crop,
        status: diseaseInfo.name,
        conf: `${confPercent}%`,
        img: imageUri,
        date: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      Alert.alert('Success', 'Report saved to your cloud account!');
      navigation.navigate('Home');
    } catch (e) {
      console.error('Failed to save report', e);
      Alert.alert('Error', 'Could not save the report.');
    }
  };

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
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>AI Scanned</Text>
            </View>
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

        <TouchableOpacity style={styles.xaiButton} onPress={() => setShowXAI(true)}>
          <Ionicons name="scan-circle" size={20} color="#fff" />
          <Text style={styles.xaiButtonText}>View AI Heatmap</Text>
        </TouchableOpacity>

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

          <Text style={styles.descriptionText}>{diseaseInfo.description}</Text>

          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={16} color="#f59e0b" />
            <Text style={styles.aiHeaderText}>AI + RAG Personalized Plan</Text>
          </View>

          {isHealthy ? (
             <Text style={styles.sectionText}>Your crop looks great! No treatment needed. Keep up the good work.</Text>
          ) : loadingAI ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#1a4314" />
              <Text style={styles.loadingText}>Synthesizing local weather & botanical data...</Text>
            </View>
          ) : (
            <Text style={styles.sectionText}>{aiTreatment}</Text>
          )}

          {!isHealthy && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#1a4314" />
                <Text style={styles.sectionTitle}>Standard Prevention</Text>
              </View>
              <Text style={styles.sectionText}>{diseaseInfo.prevention}</Text>
            </>
          )}

          {diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Key Symptoms</Text>
              </View>
              {diseaseInfo.symptoms.map((symp, idx) => (
                <View key={idx} style={styles.symptomRow}>
                  <View style={styles.symptomDot} />
                  <Text style={styles.symptomText}>{symp}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={24} color="#1a4314" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={handleSaveReport}>
          <Text style={styles.buyButtonText}>Save Report</Text>
        </TouchableOpacity>
      </View>

      {/* XAI Modal */}
      <Modal visible={showXAI} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowXAI(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Explainable AI (XAI)</Text>
            <Text style={styles.modalDesc}>Model insights</Text>

            <View style={styles.xaiFlow}>
              <View style={styles.xaiStep}>
                <Image source={{ uri: imageUri }} style={styles.xaiImage} />
                <Text style={styles.xaiLabel}>Original Leaf</Text>
              </View>
              
              <Ionicons name="arrow-down" size={24} color="#6b7280" style={{ marginVertical: 10 }} />
              
              <View style={styles.xaiStep}>
                {heatmapBase64 ? (
                  <Image source={{ uri: heatmapBase64 }} style={styles.xaiImage} />
                ) : (
                  <View style={[styles.xaiImage, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{color: '#64748b'}}>No Heatmap</Text>
                  </View>
                )}
                <Text style={styles.xaiLabel}>Grad-CAM Heatmap</Text>
              </View>
            </View>
            
            <Text style={styles.modalFooterText}>The red regions indicate the specific disease lesions the EfficientNetV2 model used to make its prediction.</Text>
          </View>
        </View>
      </Modal>
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
  imageOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(26, 67, 20, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  imageOverlayText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  
  sideStats: { width: width * 0.28, justifyContent: 'center', paddingVertical: 10, gap: 20 },
  statBox: { marginBottom: 5 },
  statLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: '600', color: '#1a4314' },

  detailsContainer: { backgroundColor: '#fff', borderRadius: 30, padding: 25, marginTop: 10, minHeight: height * 0.5, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  diseaseName: { fontSize: 26, fontWeight: '800', color: '#111827', flex: 1, paddingRight: 10 },
  priceTag: { fontSize: 20, fontWeight: '800', color: '#1a4314' },

  tagsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  tagItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },
  tagDivider: { width: 1, height: 12, backgroundColor: '#d1d5db', marginHorizontal: 12 },

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
  buyButton: { flex: 1, backgroundColor: '#1a4314', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#1a4314', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  buyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  xaiButton: { flexDirection: 'row', backgroundColor: '#1a4314', alignSelf: 'flex-start', marginLeft: 20, marginTop: 15, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center', gap: 6, marginBottom: 20 },
  xaiButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#f9fbf2', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
  closeModalButton: { position: 'absolute', top: 15, right: 15, width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a4314', marginTop: 10, marginBottom: 4 },
  modalDesc: { fontSize: 14, color: '#6b7280', fontWeight: '500', marginBottom: 20 },
  xaiFlow: { alignItems: 'center', width: '100%' },
  xaiStep: { alignItems: 'center' },
  xaiImage: { width: 140, height: 140, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', resizeMode: 'cover' },
  xaiLabel: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#111827' },
  modalFooterText: { marginTop: 24, fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18, fontStyle: 'italic' },
});
