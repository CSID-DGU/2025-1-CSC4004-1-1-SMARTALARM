import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';

const SignUpLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Keyboard.dismiss();
    router.replace('../index'); // 로그인 성공 시 이동
  };

  const handleReturnKey = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Alarm</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={handleReturnKey}
        returnKeyType="done"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.subLabel}>Your email will be used for login</Text>

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleReturnKey}
        returnKeyType="done"
        secureTextEntry
      />
      <Text style={styles.subLabel}>Password must be at least 8 characters</Text>

      <TouchableOpacity style={styles.outlinedButton}>
        <Text style={styles.outlinedButtonText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlinedButton}>
        <Text style={styles.outlinedButtonText}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filledButton} onPress={handleLogin}>
        <Text style={styles.filledButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  subLabel: { fontSize: 12, color: '#777', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    borderRadius: 5, marginBottom: 10,
  },
  outlinedButton: {
    borderWidth: 1, borderColor: '#000',
    padding: 15, borderRadius: 5, marginBottom: 10,
    alignItems: 'center',
  },
  outlinedButtonText: { color: '#000', fontWeight: 'bold' },
  filledButton: {
    backgroundColor: '#000', padding: 15,
    borderRadius: 5, alignItems: 'center', marginTop: 10,
  },
  filledButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default SignUpLogin;
