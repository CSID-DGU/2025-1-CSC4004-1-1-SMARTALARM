import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';

type MainDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainDashboard'>;
};



const MainDashboard = ({ navigation }: MainDashboardProps) => {
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
        onPress={() => navigation.navigate('LocationPreferences')}
      >
        <Text style={styles.outlinedText}>Location Preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.outlinedButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.outlinedText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filledButton}
        onPress={() => navigation.navigate('AlarmSetup')}
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
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  filledButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  filledText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabButton: {},
  tabText: {},
  sectionTitle: {},
  cardContainer: {},
  card: {},
  cardIcon: {},
  cardTitle: {},
  cardValue: {},
  buttonRow: {},
  outlinedButton: {},
  outlinedText: {},
  modeButton: {},
  
});

export default MainDashboard;
