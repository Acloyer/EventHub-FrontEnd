# EventHub Localization Guide

## Overview

EventHub supports internationalization using `next-i18next`. The localization system includes:

- **3 languages**: English (en), Russian (ru), Azerbaijani (az)
- **localStorage**: Saving the selected language
- **SSR**: Server-side initialization of translations
- **Automatic switching**: Synchronization with URL

## Architecture

### 1. LanguageContext (`src/lib/LanguageContext.tsx`)
Main context for language management:
- Saving/loading language from localStorage
- Synchronization with Next.js router
- Loading state management

### 2. LanguageInitializer (`src/components/LanguageInitializer.tsx`)
Component for client-side language initialization:
- Checking localStorage on load
- Preventing hydration errors

### 3. LanguageSwitcher (`src/components/LanguageSwitcher.tsx`)
UI component for language switching:
- Uses `useIsClient` for SSR compatibility
- Displays static placeholder on server

### 4. useIsClient Hook (`src/lib/useIsClient.tsx`)
Hook for determining client-side:
- Prevents hydration errors
- Used in components with localStorage

## Translation Files

### Structure
```
public/locales/
├── en/common.json
├── ru/common.json
└── az/common.json
```

### Main Sections
- `navbar`: Navigation menu
- `common`: Common UI elements
- `auth`: Authentication
- `events`: Events
- `admin`: Admin panel
- `profile`: User profile
- `notifications`: Notifications
- `footer`: Site footer

## Usage

### 1. Adding translations to component

```tsx
import { useTranslation } from 'next-i18next'

export default function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  )
}
```

### 2. Adding getServerSideProps

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
```

### 3. Using LanguageContext

```tsx
import { useLanguage } from '../lib/LanguageContext'

export default function MyComponent() {
  const { currentLanguage, setLanguage, isLoading } = useLanguage()
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
  }
  
  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => handleLanguageChange('ru')}>
        Switch to Russian
      </button>
    </div>
  )
}
```

## Adding New Translations

### 1. Add key to English file
```json
{
  "common": {
    "newKey": "New translation"
  }
}
```

### 2. Add translations to other languages
```json
// ru/common.json
{
  "common": {
    "newKey": "Новый перевод"
  }
}

// az/common.json
{
  "common": {
    "newKey": "Yeni tərcümə"
  }
}
```

### 3. Use in component
```tsx
const { t } = useTranslation()
return <p>{t('common.newKey')}</p>
```

## Automation

### add-i18n.js script
Automatically adds `getServerSideProps` and imports to pages:

```bash
node scripts/add-i18n.js
```

## Testing

### LocalizationTest component
Component for testing translations is available on the main page.

### Checking localStorage
```javascript
// In browser
localStorage.getItem('eventhub-language')
```

## Best Practices

1. **Always use getServerSideProps** for pages with translations
2. **Check client-side** before accessing localStorage
3. **Use useIsClient** for components with localStorage
4. **Add translations to all languages** simultaneously
5. **Test on all languages** before deployment

## Troubleshooting

### Hydration errors
- Use `useIsClient` hook
- Check availability of `window` object

### Translations not loading
- Check for presence of `getServerSideProps`
- Ensure correct path to translation files

### Language not saving
- Check localStorage in browser
- Ensure correct key `eventhub-language`

## Configuration

### next-i18next.config.js
```javascript
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'az'],
  },
  localePath: typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : '/locales',
}
```

### _app.tsx
```tsx
import { appWithTranslation } from 'next-i18next'
import { LanguageProvider } from '../lib/LanguageContext'

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  )
}

export default appWithTranslation(MyApp)
``` 