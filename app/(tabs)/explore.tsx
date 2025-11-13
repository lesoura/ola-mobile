import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { getData, saveData } from '@/utils/storage';
import axios from 'axios';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TabTwoScreen() {
  const [personalInfo, setPersonalInfo] = useState([
    { label: 'Account Number', value: '' },
    { label: 'Employee Number', value: '' },
    { label: 'First Name', value: '' },
    { label: 'Middle Name', value: '' },
    { label: 'Last Name, Suffix', value: '' },
    { label: 'Mobile Number', value: '' },
    { label: 'Email Address', value: '' },
    { label: 'Online Registration Date', value: '' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const storedUser = await getData('user');
      console.log('Stored user:', storedUser);

      if (!storedUser?.token || !storedUser?.username) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}api/OLMS/User/Details`,
          {
            USERNAME: storedUser.username, // Base64 encoded
            DEVICEID: '1',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedUser.token}`,
            },
          }
        );

        const data = response.data?.[0];
        console.log('RAW User/Details response:', data);

        if (data) {
          const formattedInfo = [
            { label: 'Account Number', value: data.ACCNO || '' },
            { label: 'Employee Number', value: data.EMPNO || '' },
            { label: 'First Name', value: data.FNAME || '' },
            { label: 'Middle Name', value: data.MNAME || '' },
            { label: 'Last Name, Suffix', value: data.LNAME || '' },
            { label: 'Mobile Number', value: data.CONTACT_NO || '' },
            { label: 'Email Address', value: data.EMAIL_ADDRESS || '' },
            { label: 'Online Registration Date', value: data.DATE_OF_REG || '' },
          ];

          setPersonalInfo(formattedInfo);
          await saveData('personalInfo', formattedInfo);
          console.log('Formatted personal info:', formattedInfo);
        }
      } catch (error) {
        console.error('Error fetching personal info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff5a5f" />
        <Text style={{ marginTop: 10 }}>Loading personal details...</Text>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f2f2f2', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/components/ui/munchkin.jpeg')}
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontFamily: Fonts.rounded }}>
          {`${personalInfo.find(i => i.label === 'First Name')?.value} ${personalInfo.find(i => i.label === 'Last Name, Suffix')?.value}`}
        </ThemedText>
      </ThemedView>

      <ThemedText style={{ marginBottom: 5, textAlign: 'justify' }}>
        <ThemedText style={{ fontWeight: 'bold', color: '#ff5a5f' }}>Note:</ThemedText> Your personal information is shown below. You may visit your designated branch office if you wish to update a specific information.
      </ThemedText>

      <ScrollView>
        {personalInfo.map((item, index) => (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.floatingLabel}>{item.label}</Text>
            <TextInput
              value={item.value}
              editable={false}
              style={styles.input}
              placeholder="-"
              placeholderTextColor="rgba(0,0,0,0.3)"
            />
          </View>
        ))}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
  },
  fieldContainer: {
    marginTop: 15,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#555',
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
});
