import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AlarmSetup = () => {
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('Car');
  const [arrivalTime, setArrivalTime] = useState('00:00');
  const [wakeUpTime, setWakeUpTime] = useState('07:00 AM');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Alarm Setup</Text>

      <Text style={styles.label}>Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter destination"
        value={destination}
        onChangeText={setDestination}
      />

      <Text style={styles.label}>Transport Mode</Text>
      <View style={styles.transportContainer}>
        {['Car', 'Public Transport', 'Walking'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              transportMode === mode && styles.selectedMode,
            ]}
            onPress={() => setTransportMode(mode)}
          >
            <Text style={styles.modeText}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Arrival Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={arrivalTime}
          style={styles.picker}
          onValueChange={(value) => setArrivalTime(value)}
        >
          <Picker.Item label="00:00" value="00:00" />
          <Picker.Item label="07:30" value="07:30" />
          <Picker.Item label="08:00" value="08:00" />
          <Picker.Item label="09:00" value="09:00" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.buttonText}>Save Alarm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    borderRadius: 5, marginBottom: 20,
  },
  transportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: '#000',
  },
  modeText: {
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AlarmSetup;
