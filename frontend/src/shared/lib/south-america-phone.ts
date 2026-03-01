export type SouthAmericaPhoneOption = {
  country: string;
  dialCode: string;
};

export const SOUTH_AMERICA_PHONE_OPTIONS: SouthAmericaPhoneOption[] = [
  { country: "Argentina", dialCode: "+54" },
  { country: "Bolivia", dialCode: "+591" },
  { country: "Brasil", dialCode: "+55" },
  { country: "Chile", dialCode: "+56" },
  { country: "Colombia", dialCode: "+57" },
  { country: "Ecuador", dialCode: "+593" },
  { country: "Guyana", dialCode: "+592" },
  { country: "Paraguay", dialCode: "+595" },
  { country: "Perú", dialCode: "+51" },
  { country: "Surinam", dialCode: "+597" },
  { country: "Uruguay", dialCode: "+598" },
  { country: "Venezuela", dialCode: "+58" },
];

export const DEFAULT_SOUTH_AMERICA_DIAL_CODE = "+54";

const getDigits = (value: string): string => value.replace(/\D/g, "");

export const buildSouthAmericaPhone = (dialCode: string, localNumber: string): string => {
  const localDigits = getDigits(localNumber);
  if (!localDigits) {
    return "";
  }

  const normalizedDialCode = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return `${normalizedDialCode}${localDigits}`;
};

export const splitSouthAmericaPhone = (
  rawPhone?: string | null,
): { dialCode: string; localNumber: string } => {
  if (!rawPhone?.trim()) {
    return {
      dialCode: DEFAULT_SOUTH_AMERICA_DIAL_CODE,
      localNumber: "",
    };
  }

  const rawDigits = getDigits(rawPhone);
  const sortedByLongestCode = [...SOUTH_AMERICA_PHONE_OPTIONS].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );

  for (const option of sortedByLongestCode) {
    const dialDigits = getDigits(option.dialCode);
    if (rawDigits.startsWith(dialDigits)) {
      return {
        dialCode: option.dialCode,
        localNumber: rawDigits.slice(dialDigits.length),
      };
    }
  }

  return {
    dialCode: DEFAULT_SOUTH_AMERICA_DIAL_CODE,
    localNumber: rawDigits,
  };
};
