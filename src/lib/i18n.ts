import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from '#/locales/en.json'

export const SUPPORTED_LANGUAGES = ['en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

i18next
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: { en: { translation: en } },
		lng: DEFAULT_LANGUAGE,
		fallbackLng: DEFAULT_LANGUAGE,
		supportedLngs: SUPPORTED_LANGUAGES,
		interpolation: { escapeValue: false },
		detection: {
			order: ['htmlTag', 'navigator'],
		},
	})

export { i18next }
