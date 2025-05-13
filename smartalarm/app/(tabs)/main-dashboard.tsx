import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const MainDashboard = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Smart Alarm</Text>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Today's Alarm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* 요약 카드 */}
      <Text style={styles.sectionTitle}>Today's Alarm Summary</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>⏰</Text>
          <Text style={styles.cardTitle}>Wake-Up Time</Text>
          <Text style={styles.cardValue}>7:30 AM</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📍</Text>
          <Text style={styles.cardTitle}>Destination</Text>
          <Text style={styles.cardValue}>Work</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🕒</Text>
          <Text style={styles.cardTitle}>Estimated</Text>
          <Text style={styles.cardValue}>8:45 AM</Text>
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.outlinedButton}>
          <Text style={styles.outlinedText}>Disable Alarm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filledButton}>
          <Text style={styles.filledText}>Edit Alarm</Text>
        </TouchableOpacity>
      </View>

      {/* Alarm Mode */}
      <Text style={styles.sectionTitle}>Alarm Mode</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.modeButton}>
          <Text style={styles.cardIcon}>🧠</Text>
          <Text style={styles.cardValue}>Smart Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton}>
          <Text style={styles.cardIcon}>🔔</Text>
          <Text style={styles.cardValue}>Manual Mode</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 버튼들 */}
      <TouchableOpacity
        style={styles.outlinedButton}
        onPress={() => router.push('/(tabs)/location-preferences')}
      >
        <Text style={styles.outlinedText}>Location Preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.outlinedButton}
        onPress={() => router.push('/(tabs)/settings')}
      >
        <Text style={styles.outlinedText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filledButton}
        onPress={() => router.push('/(tabs)/alarm-setup')}
      >
        <Text style={styles.filledText}>Alarm Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // 항상 흰 배경
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000', // 항상 검정 글씨
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  tabText: {
    textAlign: 'center',
    color: '#000000',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 5,
    color: '#000000',
  },
  cardTitle: {
    color: '#555555',
    fontSize: 14,
  },
  cardValue: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filledButton: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  outlinedButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  filledText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  outlinedText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
});

export default MainDashboard;