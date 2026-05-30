const PROVINCE_NAME_TO_CA_CODE: Record<string, string> = {
    'salta': 'A',
    'buenos aires': 'B',
    'provincia de buenos aires': 'B',
    'capital federal': 'C',
    'ciudad autonoma de buenos aires': 'C',
    'caba': 'C',
    'san luis': 'D',
    'entre rios': 'E',
    'entre ríos': 'E',
    'la rioja': 'F',
    'santiago del estero': 'G',
    'chaco': 'H',
    'san juan': 'J',
    'catamarca': 'K',
    'la pampa': 'L',
    'mendoza': 'M',
    'misiones': 'N',
    'formosa': 'P',
    'neuquen': 'Q',
    'neuquén': 'Q',
    'rio negro': 'R',
    'río negro': 'R',
    'santa fe': 'S',
    'tucuman': 'T',
    'tucumán': 'T',
    'chubut': 'U',
    'tierra del fuego': 'V',
    'corrientes': 'W',
    'cordoba': 'X',
    'córdoba': 'X',
    'jujuy': 'Y',
    'santa cruz': 'Z',
};

export function provinceNameToCACode(name: string): string {
    const normalized = name.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Buscar exacto primero
    for (const [key, code] of Object.entries(PROVINCE_NAME_TO_CA_CODE)) {
        const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedKey === normalized) return code;
    }

    // Buscar parcial
    for (const [key, code] of Object.entries(PROVINCE_NAME_TO_CA_CODE)) {
        const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) return code;
    }

    return 'X'; // default Córdoba
}