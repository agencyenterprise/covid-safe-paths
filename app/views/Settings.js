import styled, { css } from '@emotion/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Linking, ScrollView, View } from 'react-native';

import checkmarkIcon from '../assets/svgs/checkmarkIcon';
import languagesIcon from '../assets/svgs/languagesIcon';
import xmarkIcon from '../assets/svgs/xmarkIcon';
import { Divider } from '../components/Divider';
import { Feature } from '../components/Feature';
import NativePicker from '../components/NativePicker';
import NavigationBarWrapper from '../components/NavigationBarWrapper';
import Colors from '../constants/colors';
import { PARTICIPATE } from '../constants/storage';
import { GetStoreData, SetStoreData } from '../helpers/General';
import {
  LOCALE_LIST,
  getUserLocaleOverride,
  setUserLocaleOverride,
  supportedDeviceLanguageOrEnglish,
} from '../locales/languages';
import LocationServices from '../services/LocationService';
import { GoogleMapsImport } from './Settings/GoogleMapsImport';
import { SettingsItem as Item } from './Settings/SettingsItem';

export const SettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [isLogging, setIsLogging] = useState(undefined);
  const [userLocale, setUserLocale] = useState(
    supportedDeviceLanguageOrEnglish(),
  );

  const toHawaiiNews = () =>
    Linking.openURL('https://health.hawaii.gov/coronavirusdisease2019/');

  const backToMain = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const handleBackPress = () => {
      navigation.goBack();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // TODO: this should be a service or hook
    GetStoreData(PARTICIPATE)
      .then(isParticipating => setIsLogging(isParticipating === 'true'))
      .catch(error => console.log(error));

    // TODO: extract into service or hook
    getUserLocaleOverride().then(locale => locale && setUserLocale(locale));

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [navigation]);

  const locationToggleButtonPressed = async () => {
    try {
      isLogging ? LocationServices.stop() : LocationServices.start();
      await SetStoreData(PARTICIPATE, !isLogging);
      setIsLogging(!isLogging);
    } catch (e) {
      console.log(e);
    }
  };

  const localeChanged = async locale => {
    // If user picks manual lang, update and store setting
    try {
      await setUserLocaleOverride(locale);
      setUserLocale(locale);
    } catch (e) {
      console.log('something went wrong in lang change', e);
    }
  };

  return (
    <NavigationBarWrapper
      title={t('label.settings_title')}
      onBackPress={backToMain}>
      <ScrollView>
        <Section>
          <Item
            label={
              isLogging
                ? t('label.logging_active')
                : t('label.logging_inactive')
            }
            icon={isLogging ? checkmarkIcon : xmarkIcon}
            onPress={locationToggleButtonPressed}
          />
          <NativePicker
            items={LOCALE_LIST}
            value={userLocale}
            onValueChange={localeChanged}>
            {({ label, openPicker }) => (
              <Item
                last
                label={label || t('label.home_unknown_header')}
                icon={languagesIcon}
                onPress={openPicker}
              />
            )}
          </NativePicker>
        </Section>
        <Section>
          <Item
            label='Receiving Updates from Aloha Trace'
            description='This app will notify you of possible exposures to COVID-19.'
            onPress={() => {
              console.log('receiving updates');
            }}
          />
          <Item
            label={t('label.news_title')}
            description={t('label.news_subtitle')}
            onPress={() => toHawaiiNews()}
          />
          <Item
            label={t('label.event_history_title')}
            description={t('label.event_history_subtitle')}
            onPress={() => navigation.navigate('ExposureHistoryScreen')}
          />
          <Item
            label={t('share.title')}
            description={t('share.subtitle')}
            onPress={() => navigation.navigate('ExportScreen')}
            last
          />
        </Section>

        <Feature name='google_import'>
          <Section>
            <GoogleMapsImport navigation={navigation} />
          </Section>
        </Feature>

        <Section last>
          <Item
            label={t('label.about_title')}
            onPress={() => navigation.navigate('AboutScreen')}
          />
          <Item
            label={t('label.legal_page_title')}
            onPress={() => navigation.navigate('LicensesScreen')}
            last
          />
        </Section>
      </ScrollView>
    </NavigationBarWrapper>
  );
};

/**
 * Render a white section with blue spacer at the bottom (unless `last == true`)
 *
 * @param {{last?: boolean}} param0
 */
export const Section = ({ last, children }) => (
  <>
    <SectionWrapper>{children}</SectionWrapper>

    <Divider />

    {!last && (
      <>
        <View
          style={css`
            margin: 2% 0;
          `}
        />
        <Divider />
      </>
    )}
  </>
);

const SectionWrapper = styled.View`
  background-color: ${Colors.WHITE};
  padding: 0px 6.25%;
`;
