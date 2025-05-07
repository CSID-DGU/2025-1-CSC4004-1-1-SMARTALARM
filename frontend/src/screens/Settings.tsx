import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';

const Settings = () => {
  const [name, setName] = useState('Kim');
  const [email, setEmail] = useState('kim@example.com');
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [editingField, setEditingField] = useState<'name' | 'email' | null>(null);

  const handleSaveChanges = () => {
    setName(tempName);
    setEmail(tempEmail);
    setEditingField(null);
    Keyboard.dismiss();
  };

  const handleReturnKey = () => {
    setEditingField(null);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionTitle}>Account Information</Text>

      <TouchableOpacity onPress={() => setEditingField('name')}>
        <View style={styles.row}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.label}>Name</Text>
          {editingField === 'name' ? (
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              onSubmitEditing={handleReturnKey}
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.value}>{tempName}</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEditingField('email')}>
        <View style={styles.row}>
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.label}>Email</Text>
          {editingField === 'email' ? (
            <TextInput
              style={styles.input}
              value={tempEmail}
              onChangeText={setTempEmail}
              onSubmitEditing={handleReturnKey}
              returnKeyType="done"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{tempEmail}</Text>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>API Permissions</Text>
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionButton}>Calendar</Text>
        <Text style={styles.permissionButton}>GPS</Text>
        <Text style={styles.permissionButton}>Traffic</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  icon: { fontSize: 20, marginRight: 10 },
  label: { fontSize: 16, flex: 1 },
  value: { fontSize: 16 },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    paddingVertical: 2,
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default Settings;
