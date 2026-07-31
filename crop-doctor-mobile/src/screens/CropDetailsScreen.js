import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export default function CropDetailsScreen({ route, navigation }) {
  const { cropName, location, temp } = route.params;
  const [guideText, setGuideText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIGuide = async () => {
      try {
        const prompt = `Act as an expert agronomist. Give a short, encouraging guide (in about 3 paragraphs) on how to grow ${cropName} in ${location} where the current temperature is ${temp}. Include 3 bullet points for quick tips. Use a professional, warm tone. Format without markdown asterisks so it displays cleanly in a basic text view, or use basic text bullet points like '- '.`;
        
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText) {
          setGuideText(generatedText);
        } else {
          setGuideText('Could not generate guide at this time.');
        }
      } catch (error) {
        console.error("Gemini AI fetch error:", error);
        setGuideText('Error connecting to AI service.');
      } finally {
        setLoading(false);
      }
    };

    fetchAIGuide();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Crop Guide</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="sparkles" size={20} color="#1a4314" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.cropTitle}>Growing {cropName}</Text>
          <View style={styles.locationBadgeRow}>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={14} color="#3b82f6" />
              <Text style={styles.badgeText}>{location}</Text>
            </View>
            <View style={styles.tempBadge}>
              <Ionicons name="thermometer" size={14} color="#ef4444" />
              <Text style={styles.badgeText}>{temp}</Text>
            </View>
          </View>
        </View>

        <View style={styles.guideCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={18} color="#f59e0b" />
            <Text style={styles.aiHeaderText}>Gemini AI Recommendations</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1a4314" />
              <Text style={styles.loadingText}>Analyzing regional data...</Text>
            </View>
          ) : (
            <Text style={styles.guideText}>{guideText}</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.saveButtonText}>Got it, thanks!</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fbf2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  
  titleSection: { marginBottom: 25 },
  cropTitle: { fontSize: 28, fontWeight: '800', color: '#1a4314', marginBottom: 15 },
  locationBadgeRow: { flexDirection: 'row', gap: 10 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  tempBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#111827' },

  guideCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 30 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  aiHeaderText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 14, color: '#6b7280', fontWeight: '500' },
  
  guideText: { fontSize: 15, color: '#4b5563', lineHeight: 26 },

  saveButton: { height: 56, borderRadius: 16, backgroundColor: '#1a4314', alignItems: 'center', justifyContent: 'center', shadowColor: '#1a4314', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
