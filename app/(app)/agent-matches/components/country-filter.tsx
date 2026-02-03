"use client";

import { COUNTRY_FLAG_LABELS } from "@/app/constants";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/ui-primitives/select";

interface CountryFilterProps {
    value: string;
    onValueChange: (value: string) => void;
}

export const CountryFilter = ({ value, onValueChange }: CountryFilterProps) => {
    const selectedCountryData = COUNTRY_FLAG_LABELS[value as keyof typeof COUNTRY_FLAG_LABELS];

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="bg-white w-full min-w-[186px] text-center">
                <SelectValue placeholder="Filter by country" className="flex items-center gap-1">
                    <span>{selectedCountryData?.flag}</span> <span>{selectedCountryData?.label}</span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
                {Object.values(COUNTRY_FLAG_LABELS).map((country) => (
                    <SelectItem key={country.key} value={country.key}>
                        <span>{country.flag}</span> <span>{country.label}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default CountryFilter;