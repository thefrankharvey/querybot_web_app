"use client";

import { COUNTRY_FLAG_LABELS } from "@/app/constants";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/ui-primitives/select";
import { useState } from "react";

interface CountryFilterProps {
    value: string;
    onValueChange: (value: string) => void;
}


export const CountryFilter = ({ value, onValueChange }: CountryFilterProps) => {
    const [selectedCountry, setSelectedCountry] = useState(value);
    const selectedCountryData = COUNTRY_FLAG_LABELS[selectedCountry as keyof typeof COUNTRY_FLAG_LABELS]

    return (
        <Select value={selectedCountry} onValueChange={(value) => {
            setSelectedCountry(value);
            onValueChange(value);
        }}>
            <SelectTrigger className="bg-white w-full min-w-[186px] text-center">
                <SelectValue placeholder="Filter by country" className="flex items-center gap-1">
                    <span>{selectedCountryData?.flag}</span> <span>{selectedCountryData?.label}</span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectItem value="all"><span>🌎</span> <span>All Countries</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="US"><span>🇺🇸</span> <span>United States</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="CA"><span>🇨🇦</span> <span>Canada</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="UK"><span>🇬🇧</span> <span>United Kingdom</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="AU"><span>🇦🇺</span> <span>Australia</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="NZ"><span>🇳🇿</span> <span>New Zealand</span></SelectItem>
                <SelectItem className="flex items-center gap-1" value="ZA"><span>🇿🇦</span> <span>South Africa</span></SelectItem>
            </SelectContent>
        </Select>
    );
};

export default CountryFilter;