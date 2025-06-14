import { City } from 'country-state-city';

// Cache for cities to prevent repeated API calls
let cachedIndianCities: { value: string; label: string }[] | null = null;

// Get all Indian cities
export const getIndianCities = () => {
  if (cachedIndianCities) {
    return cachedIndianCities;
  }

  const cities = City.getCitiesOfCountry('IN');
  if (!cities) return [];
  
  // Create a map to deduplicate by city name (case-insensitive)
  const cityMap = new Map();
  
  cities.forEach(city => {
    const normalizedName = city.name.toLowerCase().trim();
    if (!cityMap.has(normalizedName)) {
      cityMap.set(normalizedName, {
        value: city.name,
        label: city.name
      });
    }
  });
  
  cachedIndianCities = Array.from(cityMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  return cachedIndianCities;
};

// Popular Indian cities for faster selection
export const popularIndianCities = [
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Chennai", label: "Chennai" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Pune", label: "Pune" },
  { value: "Ahmedabad", label: "Ahmedabad" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Surat", label: "Surat" },
  { value: "Lucknow", label: "Lucknow" },
  { value: "Kanpur", label: "Kanpur" },
  { value: "Nagpur", label: "Nagpur" },
  { value: "Indore", label: "Indore" },
  { value: "Thane", label: "Thane" },
  { value: "Bhopal", label: "Bhopal" },
  { value: "Visakhapatnam", label: "Visakhapatnam" },
  { value: "Pimpri-Chinchwad", label: "Pimpri-Chinchwad" },
  { value: "Patna", label: "Patna" },
  { value: "Vadodara", label: "Vadodara" },
];

// Cache for combined cities
let cachedCombinedCities: any[] | null = null;

export const getCombinedCities = () => {
  if (cachedCombinedCities) {
    return cachedCombinedCities;
  }

  const allCities = getIndianCities();
  const popularCityNames = new Set(popularIndianCities.map(city => city.value.toLowerCase().trim()));
  
  // Remove popular cities from all cities and ensure no duplicates
  const otherCities = allCities
    .filter(city => !popularCityNames.has(city.value.toLowerCase().trim()))
    .reduce((unique: { value: string; label: string }[], city) => {
      // Check if city already exists in the unique array (case-insensitive)
      const exists = unique.some((existingCity: { value: string; label: string }) => 
        existingCity.value.toLowerCase().trim() === city.value.toLowerCase().trim()
      );
      if (!exists) {
        unique.push(city);
      }
      return unique;
    }, [])
    .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
  
  cachedCombinedCities = [
    ...popularIndianCities,
    { value: "separator", label: "─────── Other Cities ───────", disabled: true },
    ...otherCities
  ];
  
  return cachedCombinedCities;
};
