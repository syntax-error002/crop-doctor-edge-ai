import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ChatScreen({ route, navigation }) {
  const { recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    let subscription;

    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch existing messages between these two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }

      // Subscribe to new messages
      subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === recipient.id) ||
            (newMessage.sender_id === recipient.id && newMessage.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        })
        .subscribe();
    };

    setupChat();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [recipient.id]);

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;

    const text = inputText.trim();
    setInputText('');

    const newMsg = {
      sender_id: currentUser.id,
      receiver_id: recipient.id,
      content: text,
      created_at: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, { ...newMsg, id: Date.now().toString() }]);

    const { error } = await supabase.from('messages').insert([newMsg]);
    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === currentUser?.id;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{recipient.full_name || 'Anonymous Farmer'}</Text>
          <View style={styles.iconButton}>
            <Ionicons name="call-outline" size={20} color="#1a4314" />
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="image-outline" size={24} color="#64748b" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fbf2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  
  chatContainer: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  
  messageWrapper: { marginBottom: 15, width: '100%' },
  messageWrapperLeft: { alignItems: 'flex-start' },
  messageWrapperRight: { alignItems: 'flex-end' },
  
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  messageBubbleLeft: { backgroundColor: '#fff', borderBottomLeftRadius: 5 },
  messageBubbleRight: { backgroundColor: '#1a4314', borderBottomRightRadius: 5 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextLeft: { color: '#111827' },
  messageTextRight: { color: '#fff' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  attachBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  input: { flex: 1, height: 46, backgroundColor: '#f8fafc', borderRadius: 23, paddingHorizontal: 20, fontSize: 15, color: '#111827' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a4314', alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});
