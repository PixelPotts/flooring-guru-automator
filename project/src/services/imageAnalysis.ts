// Mock image analysis service
export const analyzeImage = async (imageData: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real implementation, this would call a computer vision API
  // For now, return different descriptions based on a random selection
  const descriptions = [
    "Premium hardwood flooring with natural oak finish, showing detailed wood grain patterns",
    "Luxury vinyl planks with stone-look texture, featuring a modern gray marble design",
    "Commercial-grade carpet tiles with geometric patterns in neutral tones",
    "Ceramic floor tiles with textured surface, displaying a natural slate appearance",
    "Engineered hardwood flooring with wide planks and rustic distressed finish",
    "High-durability laminate flooring with realistic wood grain appearance",
    "Porcelain tiles with polished finish, showcasing elegant veining patterns",
    "Bamboo flooring with strand-woven construction and caramel coloring",
    "Cork flooring tiles with unique natural patterns and warm tones",
    "Waterproof vinyl flooring with embossed wood-look texture"
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};