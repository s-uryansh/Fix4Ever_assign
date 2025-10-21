export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

export const countryCodes: CountryCode[] = [
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
];