import { City } from 'country-state-city';

// Get all Indian cities
export const getIndianCities = () => {
  const cities = City.getCitiesOfCountry('IN');
  return cities?.map(city => ({
    value: city.name,
    label: city.name
  })).sort((a, b) => a.label.localeCompare(b.label)) || [];
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

export const getCombinedCities = () => {
  const allCities = getIndianCities();
  const popularCityNames = new Set(popularIndianCities.map(city => city.value));
  
  // Remove popular cities from all cities to avoid duplicates
  const otherCities = allCities.filter(city => !popularCityNames.has(city.value));
  
  return [
    ...popularIndianCities,
    { value: "separator", label: "─────── Other Cities ───────", disabled: true },
    ...otherCities
  ];
};
