import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';

const LocationPreferences = () => {
  const [homeLocation, setHomeLocation] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [transportMode, setTransportMode] = useState('Public Transport');
  const [trafficUpdates, setTrafficUpdates] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);

  const modes = ['Public Transport', 'Driving', 'Walking', 'Cycling'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Location & Preferences</Text>

      <Text style={styles.label}>Save Home Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={homeLocation}
        onChangeText={setHomeLocation}
      />

      <Text style={styles.label}>Save Work Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={workLocation}
        onChangeText={setWorkLocation}
      />

      <Text style={styles.label}>Transport Mode Preferences</Text>
      <View style={styles.modeContainer}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              transportMode === mode && styles.selectedMode,
            ]}
            onPress={() => setTransportMode(mode)}
          >
            <Text
              style={
                transportMode === mode
                  ? styles.selectedModeText
                  : styles.modeButtonText
              }
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notification Settings</Text>
      <View style={styles.settingRow}>
        <Text>🚦 Traffic Updates</Text>
        <Switch value={trafficUpdates} onValueChange={setTrafficUpdates} />
      </View>
      <View style={styles.settingRow}>
        <Text>☀️ Weather Alerts</Text>
        <Switch value={weatherAlerts} onValueChange={setWeatherAlerts} />
      </View>

      <TouchableOpacity style={styles.outlinedButton}>
        <Text>Reset</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlinedButton}>
        <Text>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filledButton}>
        <Text style={{ color: '#fff' }}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 20, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
  },
  modeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  modeButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedMode: {
    backgroundColor: '#000',
  },
  modeButtonText: {
    color: '#000',
  },
  selectedModeText: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  filledButton: {
    backgroundColor: '#000',
    padding: 12,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});

export default LocationPreferences;
