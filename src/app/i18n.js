import RNLanguages from 'react-native-languages';
// import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';

import en from '../translations/en.json';
import fr from '../translations/fr.json';
import ht from '../translations/ht.json';

// import en from "../locales/en";
// import fr from "../locales/fr";
// import ht from "../locales/ht";


i18n.locale = RNLanguages.language;
// const locales = RNLocalize.getLocales();

// if (Array.isArray(locales)) {
//   I18n.locale = locales[0].languageTag;
// }

i18n.fallbacks = true;
i18n.translations = { en, fr, ht };

export default i18n;
