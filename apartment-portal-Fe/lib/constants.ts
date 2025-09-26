// Facility Location Constants
export const FACILITY_LOCATIONS = [
  // Common Areas
  { value: "Ground Floor - Main Lobby", label: "Ground Floor - Main Lobby" },
  { value: "Ground Floor - Outdoor Area", label: "Ground Floor - Outdoor Area" },
  { value: "Ground Floor - Parking Area", label: "Ground Floor - Parking Area" },
  
  // Tower A - Golden Tower
  { value: "Tower A - Floor 1", label: "Tower A - Floor 1" },
  { value: "Tower A - Floor 2", label: "Tower A - Floor 2" },
  { value: "Tower A - Floor 3", label: "Tower A - Floor 3" },
  { value: "Tower A - Floor 4", label: "Tower A - Floor 4" },
  { value: "Tower A - Floor 5", label: "Tower A - Floor 5" },
  { value: "Tower A - Rooftop", label: "Tower A - Rooftop" },
  
  // Tower B - Silver Residence
  { value: "Tower B - Floor 1", label: "Tower B - Floor 1" },
  { value: "Tower B - Floor 2", label: "Tower B - Floor 2" },
  { value: "Tower B - Floor 3", label: "Tower B - Floor 3" },
  { value: "Tower B - Floor 4", label: "Tower B - Floor 4" },
  { value: "Tower B - Floor 5", label: "Tower B - Floor 5" },
  { value: "Tower B - Rooftop", label: "Tower B - Rooftop" },
  
  // Tower C - Diamond Complex
  { value: "Tower C - Floor 1", label: "Tower C - Floor 1" },
  { value: "Tower C - Floor 2", label: "Tower C - Floor 2" },
  { value: "Tower C - Floor 3", label: "Tower C - Floor 3" },
  { value: "Tower C - Floor 4", label: "Tower C - Floor 4" },
  { value: "Tower C - Floor 5", label: "Tower C - Floor 5" },
  { value: "Tower C - Rooftop", label: "Tower C - Rooftop" },
  
  // Tower D - Emerald Garden
  { value: "Tower D - Floor 1", label: "Tower D - Floor 1" },
  { value: "Tower D - Floor 2", label: "Tower D - Floor 2" },
  { value: "Tower D - Floor 3", label: "Tower D - Floor 3" },
  { value: "Tower D - Floor 4", label: "Tower D - Floor 4" },
  { value: "Tower D - Floor 5", label: "Tower D - Floor 5" },
  { value: "Tower D - Rooftop", label: "Tower D - Rooftop" },
  
  // Tower E - Platinum Heights
  { value: "Tower E - Floor 1", label: "Tower E - Floor 1" },
  { value: "Tower E - Floor 2", label: "Tower E - Floor 2" },
  { value: "Tower E - Floor 3", label: "Tower E - Floor 3" },
  { value: "Tower E - Floor 4", label: "Tower E - Floor 4" },
  { value: "Tower E - Floor 5", label: "Tower E - Floor 5" },
  { value: "Tower E - Rooftop", label: "Tower E - Rooftop" },
  
  // Specific Facility Areas
  { value: "Basement - Parking", label: "Basement - Parking" },
  { value: "Basement - Storage", label: "Basement - Storage" },
  { value: "Ground Floor - Gym", label: "Ground Floor - Gym" },
  { value: "Ground Floor - Pool", label: "Ground Floor - Pool" },
  { value: "Ground Floor - Garden", label: "Ground Floor - Garden" },
  { value: "Ground Floor - Playground", label: "Ground Floor - Playground" },
  { value: "Ground Floor - BBQ Area", label: "Ground Floor - BBQ Area" },
  { value: "Ground Floor - Tennis Court", label: "Ground Floor - Tennis Court" },
  { value: "Ground Floor - Basketball Court", label: "Ground Floor - Basketball Court" },
  { value: "Ground Floor - Community Hall", label: "Ground Floor - Community Hall" },
  
  // Other
  { value: "Other - Please specify", label: "Other - Please specify" }
];

// Capacity Type Constants
export const CAPACITY_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "GROUP", label: "Group" }
];

// Helper function to get location label by value
export const getLocationLabel = (value: string): string => {
  const location = FACILITY_LOCATIONS.find(loc => loc.value === value);
  return location ? location.label : value;
};

// Helper function to get location value by label
export const getLocationValue = (label: string): string => {
  const location = FACILITY_LOCATIONS.find(loc => loc.label === label);
  return location ? location.value : label;
};
