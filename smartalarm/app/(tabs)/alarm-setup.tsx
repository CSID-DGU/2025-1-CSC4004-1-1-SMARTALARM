import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AlarmSetupPage = () => {
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('Car');
  const [arrivalTime, setArrivalTime] = useState('00:00');
  const [wakeUpTime, setWakeUpTime] = useState('7:00 AM');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Alarm</Text>

      {/* Destination Input */}
      <Text style={styles.label}>Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter destination"
        value={destination}
        onChangeText={setDestination}
      />

      {/* Transport Mode */}
      <Text style={styles.label}>Transport Mode</Text>
      <View style={styles.transportModeContainer}>
        <TouchableOpacity
          style={[styles.transportModeButton, transportMode === 'Car' && styles.selectedButton]}
          onPress={() => setTransportMode('Car')}>
          <Text style={styles.transportModeText}>Car</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transportModeButton, transportMode === 'Public Transport' && styles.selectedButton]}
          onPress={() => setTransportMode('Public Transport')}>
          <Text style={styles.transportModeText}>Public Transport</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transportModeButton, transportMode === 'Walking' && styles.selectedButton]}
          onPress={() => setTransportMode('Walking')}>
          <Text style={styles.transportModeText}>Walking</Text>
        </TouchableOpacity>
      </View>

      {/* Arrival Time */}
      <Text style={styles.label}>Arrival Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={arrivalTime}
          style={styles.picker}
          onValueChange={(itemValue) => setArrivalTime(itemValue)}>
          <Picker.Item label="00:00" value="00:00" />
          <Picker.Item label="01:00" value="01:00" />
          <Picker.Item label="02:00" value="02:00" />
          {/* Add more options as needed */}
        </Picker>
      </View>

      {/* Save Alarm Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save alarm</Text>
      </TouchableOpacity>

      {/* Calendar Integration */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Calendar Integration</Text>
      </TouchableOpacity>

      {/* Estimated Wake-Up Time */}
      <Text style={styles.label}>Estimated Wake-Up Time</Text>
      <Text style={styles.wakeUpTime}>{wakeUpTime}</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity style={styles.switchButton}>
          <Text style={styles.buttonText}>Smart Alarm</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 20,
    color: '#000000',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  transportModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  transportModeButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#000000',
  },
  transportModeText: {
    color: '#000000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  wakeUpTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlarmSetupPage;
