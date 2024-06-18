/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const baseUrl = 'https://tough-terminally-koala.ngrok-free.app';

  const [jwtToken, setJwtToken] = useState('');
  const [data, setData] = useState({
    mobile: '',
    otp_code: '',
    message: '',
    language: 'EN',
  });

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const styles = StyleSheet.create({
    input: {
      height: 40,
      marginTop: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

  useEffect(() => {
    AsyncStorage.getItem('jwtToken').then(token => {
      if (token && token != '') {
        setJwtToken(token);
      }
    });
  }, [])

  const showToast = (message: string | null) => {
    if (message) {
      setData((prev) => ({ ...prev, message }));
      Toast.show({
        type: ALERT_TYPE.INFO,
        title: 'Notification',
        textBody: message,
        autoClose: 1500
      });
    }
  }

  const saveOnDb = async () => {
    try {
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // console.log('Authorization status:', authStatus);

      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log(`token`, token);

      const response = await axios.post(`${baseUrl}/api/device`, {
        "name": "2201117TG",
        "device_unique_id": Math.random() * 100,
        "device_unique_id_type": "androidId",
        "platform": "ANDROID",
        "fcm_token": token,
        "app_version": "1.0",
        "language": data.language,
      }, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      showToast(response.data?.meta?.message);

      const onMessage = async (message: FirebaseMessagingTypes.RemoteMessage) => {
        console.log(`message`, message);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `${message.data?.message}`,
          autoClose: 1500,
        })
      }

      messaging().onMessage(onMessage);
      messaging().setBackgroundMessageHandler(onMessage);

    } catch (error) {
      console.log(`error`, error);
    }
  }

  const login = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        "mobile": data.mobile
      });
      console.log('Status :', response.data?.meta?.message);
      showToast(response.data?.meta?.message);
      setData((prev) => ({ ...prev, otp_code: response.data?.data?.otp_code }));

    } catch (error) {
      console.log(`error`, error);
    }
  }

  const verifyOtp = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/verify`, {
        "otp_code": data.otp_code
      });
      console.log('Status :', response.data?.meta?.message);
      console.log(`Verify Otp`, response.data);
      showToast(response.data?.meta?.message);

      if (response.data?.status) {
        const token = response.data.data.access_token;
        setJwtToken(token);
        await AsyncStorage.setItem('jwtToken', token);
      }

    } catch (error) {
      console.log(`error`, error);
    }
  }

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          {/* <Header /> */}
          <View
            style={{
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
              paddingTop: 50
            }}>
            <View style={{ marginHorizontal: 100, marginTop: 20, flexDirection: 'column', justifyContent: 'space-between', height: 500 }}>
              <TextInput value={data.mobile} style={styles.input} placeholder='mobile' onChangeText={(text) => setData((prev) => ({ ...prev, mobile: text }))} />
              <Button title='Login' onPress={login} />

              <TextInput value={data.otp_code} style={styles.input} placeholder='otp' onChangeText={(text) => setData((prev) => ({ ...prev, otp_code: text }))} />
              <Button title='Verify Otp' onPress={verifyOtp} />
              <View style={{ marginBottom: 20 }} />

              <Button color={data.language == 'TA' ? 'green' : undefined} title='Tamil' onPress={() => setData((prev) => ({ ...prev, language: 'TA' }))} />
              <Button color={data.language == 'EN' ? 'green' : undefined} title='English' onPress={() => setData((prev) => ({ ...prev, language: 'EN' }))} />

              <View style={{ marginBottom: 20 }} />
              <Button title='Save on DB' onPress={saveOnDb} />
              <View style={{ marginBottom: 20 }} />

              <Button
                title={'toast notification'}
                onPress={() =>
                  Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Congrats! this is toast notification success',
                  })
                }
              />
              <View style={{ marginBottom: 20 }} />
              {/* <Button
                title={'play mp3'}
                onPress={() => {
                  try {
                    SoundPlayer.playUrl('https://masstamilan.dev/downloader/z_A8xeDajnMSEyHvv-ofTg/1718198730/d320_cdn/10590/MTEyLjEzNC4xODUuNjA=')
                  } catch (e) {
                    console.log(`cannot play the sound file`, e)
                  }
                }}
              />
              <View style={{ marginBottom: 20 }} />
              <Button
                title={'pause mp3'}
                onPress={() => {
                  try {
                    SoundPlayer.pause()
                  } catch (e) {
                    console.log(`cannot play the sound file`, e)
                  }
                }}
              />
              <View style={{ marginBottom: 20 }} />
              <Button
                title={'resume mp3'}
                onPress={() => {
                  try {
                    SoundPlayer.resume()
                  } catch (e) {
                    console.log(`cannot play the sound file`, e)
                  }
                }}
              /> */}
            </View>
            <View style={{ marginBottom: 20 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
