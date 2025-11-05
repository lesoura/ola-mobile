import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TabTwoScreen() {
  const personalInfo = [
    { label: 'Account Number', value: '2-207-21-010869' },
    { label: 'Employee Number', value: '0092493' },
    { label: 'First Name', value: 'John' },
    { label: 'Middle Name', value: 'Rayquaza' },
    { label: 'Last Name, Suffix', value: 'Munchkin' },
    { label: 'Mobile Number', value: '0909-721-3646' },
    { label: 'Email Address', value: 'jrmunchkin@gmail.com' },
    { label: 'Online Registration Date', value: '8/23/2022 11:43:05 AM' },
  ];

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
