'use client';

import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
}

const REGIONS = [
  { code: 'GLOBAL', label: 'Global', flag: '🌍' },
  { code: 'KR', label: 'South Korea', flag: '🇰🇷' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
];

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  const t = useTranslations('shorts');

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-5 h-5 text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {REGIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.flag} {region.label}
          </option>
        ))}
      </select>
    </div>
  );
}
