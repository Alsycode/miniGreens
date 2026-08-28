import { Product, Category, Banner, LifestyleArticle, Testimonial, SubscriptionPlan, Order, Address, Profile, FAQ } from '../types';

// Product images
const wheatgrassImg = require('../assets/wheatgrass.webp');
const whiteRadishImg = require('../assets/whiteraddish.webp');
const redRadishImg = require('../assets/redraddish.jpg');
const beetrootImg = require('../assets/beetroot.jpeg');
const bokChoyImg = require('../assets/bokchoy.jpg');
const sunflowerImg = require('../assets/sunflowershoots.webp');
const redCabbageImg = require('../assets/redcabbage.webp');
const strawberryBananaImg = require('../assets/strawberry-banana.jpg');
const mangoFreshImg = require('../assets/Mango Fresh.jpg');
const chocChillImg = require('../assets/choco-chill.jpg');
const papayaGlowImg = require('../assets/papaya-glow.jpg');
const mintMelonImg = require('../assets/mint-melon.jpg');
const carrotLemonJuiceImg = require('../assets/carrot-lemon-juice.webp');
const cucumberSplashImg = require('../assets/cucumber-splash.jpg');
const appleSproutImg = require('../assets/apple-sprout.jpg');
const sweetLimeImg = require('../assets/sweet-lime.webp');
const watermelonFreshImg = require('../assets/watermelon-fresh.jpg');
const mustardImg = require('../assets/mustard.jpeg');
const fenugreekImg = require('../assets/fenugreek.jpg');
const broccoliImg = require('../assets/broccoli.jpg');
const arugulaImg = require('../assets/arugula.webp');
const turnipImg = require('../assets/turnip.jpg');
const redAmaranthImg = require('../assets/red-amaranth.jpg');
const heroBannerImg = require('../assets/banner.png');

// SVG placeholder generator - works without network
function ph(name: string, color: string, w = 400, h = 400): string {
  const s = name.replace(/["<>&]/g, '');
  const c = color || '#2E7D32';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/><rect x="${w*0.05}" y="${h*0.05}" width="${w*0.9}" height="${h*0.9}" rx="${w*0.04}" fill="rgba(255,255,255,0.1)"/><text x="${w/2}" y="${h*0.5}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="${Math.min(w,h)*0.15}" font-weight="bold" font-family="system-ui">${s[0]||'?'}</text><text x="${w/2}" y="${h*0.65}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="${Math.min(w,h)*0.045}" font-family="system-ui">${s}</text></svg>`;
}
function avatarPh(name: string): string {
  const s = name[0]?.toUpperCase() || '?';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="100" fill="%23388E3C"/><text x="100" y="125" text-anchor="middle" fill="white" font-size="80" font-weight="bold" font-family="system-ui">${s}</text></svg>`;
}
function bannerPh(title: string): string {
  const t = title.replace(/["<>&]/g, '');
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231B5E20"/><stop offset="100%" stop-color="%234CAF50"/></linearGradient></defs><rect width="1200" height="600" fill="url(#g)"/><rect x="30" y="30" width="1140" height="540" rx="24" fill="rgba(255,255,255,0.08)"/><text x="80" y="300" fill="rgba(255,255,255,0.12)" font-size="200" font-weight="bold" font-family="system-ui">🌿</text><text x="600" y="260" text-anchor="middle" fill="white" font-size="52" font-weight="bold" font-family="system-ui">${t}</text><text x="600" y="340" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="24" font-family="system-ui">Premium wellness, delivered fresh</text></svg>`;
}

export const categories: Category[] = [
  { id: 'cat-1', name: 'Smoothies', slug: 'smoothies', description: 'Creamy, nutritious blends made from fresh fruits and natural ingredients', image: mangoFreshImg as any, icon: 'cafe', productCount: 5, color: '#00BFA5' },
  { id: 'cat-2', name: 'Juices', slug: 'juices', description: 'Cold-pressed fresh juices packed with vitamins and refreshing flavors', image: watermelonFreshImg as any, icon: 'flask', productCount: 5, color: '#FF8F00' },
  { id: 'cat-3', name: 'Microgreens', slug: 'microgreens', description: 'Fresh, nutrient-packed microgreens grown locally and harvested at peak for maximum flavor and wellness', image: wheatgrassImg as any, icon: 'leaf', productCount: 13, color: '#2E7D32' },
];

export const products: Product[] = [
  {
    id: 'prod-1', name: 'Strawberry Banana Glow', slug: 'strawberry-banana-glow',
    description: 'A creamy, dreamy blend of ripe strawberries and sweet bananas, whirled into a luscious smoothie. Packed with natural sweetness, potassium, and antioxidants — the perfect glow-up in a glass.',
    price: 99, categoryId: 'cat-1',
    images: [strawberryBananaImg],
    unit: '350ml', weight: '350ml',
    nutrition: { calories: 210, protein: '4g', carbs: '44g', fat: '2.5g', fiber: '4g', vitamins: ['Vitamin C', 'Potassium', 'Vitamin B6', 'Manganese'] },
    benefits: ['Rich in antioxidants', 'Boosts skin glow', 'Natural energy source', 'Supports heart health'],
    storage: 'Refrigerate at 2-4°C. Best consumed within 24 hours.',
    consumptionTips: ['Enjoy as a breakfast smoothie', 'Perfect post-workout refuel', 'Add a scoop of protein for extra nutrition', 'Serve chilled with a strawberry garnish'],
    isFeatured: true, isSeasonal: false, isBestSeller: true, rating: 4.7, reviewCount: 156, tags: ['popular', 'creamy', 'fruit-blend'], createdAt: '2024-01-15',
  },
  {
    id: 'prod-2', name: 'Mango Fresh', slug: 'mango-fresh',
    description: 'Pure sunshine in a bottle. Made with handpicked Alphonso mangoes blended to silky perfection. Every sip is a tropical escape — rich, velvety, and irresistibly refreshing.',
    price: 110, categoryId: 'cat-1',
    images: [mangoFreshImg],
    unit: '350ml', weight: '350ml',
    nutrition: { calories: 230, protein: '3g', carbs: '50g', fat: '1.5g', fiber: '3g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin E', 'Folate'] },
    benefits: ['Excellent source of Vitamin A', 'Supports eye health', 'Boosts immunity', 'Natural digestive aid'],
    storage: 'Refrigerate at 2-4°C. Best consumed within 24 hours.',
    consumptionTips: ['Perfect summer refresher', 'Pair with a light breakfast', 'Add chia seeds for extra fiber', 'Serve with a mint leaf'],
    isFeatured: true, isSeasonal: false, isBestSeller: true, rating: 4.8, reviewCount: 203, tags: ['tropical', 'mango', 'customer-favorite'], createdAt: '2024-01-20',
  },
  {
    id: 'prod-3', name: 'Choco Chill', slug: 'choco-chill',
    description: 'For the chocolate lovers who want it healthy. A decadent blend of premium cocoa, banana, and almond milk — creamy, chocolatey, and surprisingly nutritious. Dessert without the guilt.',
    price: 115, categoryId: 'cat-1',
    images: [chocChillImg],
    unit: '350ml', weight: '350ml',
    nutrition: { calories: 250, protein: '8g', carbs: '38g', fat: '7g', fiber: '5g', vitamins: ['Iron', 'Magnesium', 'Calcium', 'Vitamin B12'] },
    benefits: ['Rich in antioxidants from cocoa', 'Natural mood booster', 'Good source of protein', 'Satisfies sweet cravings healthily'],
    storage: 'Refrigerate at 2-4°C. Best consumed within 24 hours.',
    consumptionTips: ['Perfect as a healthy dessert', 'Great pre-workout energy boost', 'Top with cacao nibs for crunch', 'Enjoy as an afternoon pick-me-up'],
    isFeatured: true, isSeasonal: false, isBestSeller: true, rating: 4.9, reviewCount: 189, tags: ['chocolate', 'protein-rich', 'indulgent'], createdAt: '2024-02-01',
  },
  {
    id: 'prod-4', name: 'Papaya Glow', slug: 'papaya-glow',
    description: 'Light, refreshing, and glow-boosting. Fresh papaya blended with a hint of lime creates a smoothie that is as good for your skin as it is for your taste buds. Nature\'s beauty secret.',
    price: 95, categoryId: 'cat-1',
    images: [papayaGlowImg],
    unit: '350ml', weight: '350ml',
    nutrition: { calories: 160, protein: '2g', carbs: '36g', fat: '1g', fiber: '5g', vitamins: ['Vitamin C', 'Vitamin A', 'Folate', 'Papain Enzyme'] },
    benefits: ['Contains natural papain enzyme', 'Supports digestion', 'Promotes glowing skin', 'Low calorie & refreshing'],
    storage: 'Refrigerate at 2-4°C. Best consumed within 24 hours.',
    consumptionTips: ['Ideal light breakfast', 'Great for skin health routine', 'Add a squeeze of lime', 'Blend with ice for a thicker texture'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.5, reviewCount: 98, tags: ['light', 'digestion', 'skin-health'], createdAt: '2024-02-15',
  },
  {
    id: 'prod-5', name: 'Mint Melon Smoothie', slug: 'mint-melon-smoothie',
    description: 'The ultimate summer cooldown. Sweet melon blended with fresh mint leaves creates a crisp, hydrating smoothie that beats the heat like nothing else. Clean, green, and refreshing.',
    price: 105, categoryId: 'cat-1',
    images: [mintMelonImg],
    unit: '350ml', weight: '350ml',
    nutrition: { calories: 145, protein: '3g', carbs: '32g', fat: '0.5g', fiber: '2g', vitamins: ['Vitamin C', 'Vitamin A', 'Potassium', 'Iron'] },
    benefits: ['Ultra-hydrating', 'Natural cooling effect', 'Low in calories', 'Rich in electrolytes'],
    storage: 'Refrigerate at 2-4°C. Best consumed within 24 hours.',
    consumptionTips: ['Perfect summer cooler', 'Post-yoga refresher', 'Add cucumber for extra hydration', 'Garnish with fresh mint sprig'],
    isFeatured: true, isSeasonal: true, isBestSeller: false, rating: 4.6, reviewCount: 87, tags: ['refreshing', 'seasonal', 'light'], createdAt: '2024-03-01',
  },
  {
    id: 'prod-6', name: 'Carrot, Lemon & Radish Microgreens Juice', slug: 'carrot-lemon-radish-microgreens-juice',
    description: 'A powerhouse wellness shot in a bottle. Fresh carrot juice blended with zesty lemon and the peppery kick of radish microgreens — cold-pressed to lock in every nutrient. Bold, bright, and packed with goodness.',
    price: 85, categoryId: 'cat-2',
    images: [carrotLemonJuiceImg],
    unit: '300ml', weight: '300ml',
    nutrition: { calories: 100, protein: '2.5g', carbs: '22g', fat: '0.5g', fiber: '3g', vitamins: ['Vitamin A', 'Vitamin C', 'Iron', 'Potassium'] },
    benefits: ['Excellent for eye health', 'Boosts immune system', 'Natural detox support', 'Anti-inflammatory properties'],
    storage: 'Refrigerate at all times. Consume within 48 hours of opening.',
    consumptionTips: ['Drink on an empty stomach', 'Shake well before serving', 'Best enjoyed fresh and cold', 'Pair with a light meal'],
    isFeatured: true, isSeasonal: false, isBestSeller: false, rating: 4.8, reviewCount: 134, tags: ['cold-pressed', 'immune-boost', 'microgreens'], createdAt: '2024-01-25',
  },
  {
    id: 'prod-7', name: 'Cucumber Splash', slug: 'cucumber-splash',
    description: 'Pure hydration in every sip. Cool cucumber, a hint of lemon, and a whisper of ginger come together in this ultra-refreshing cold-pressed juice. Clean, crisp, and incredibly revitalizing.',
    price: 90, categoryId: 'cat-2',
    images: [cucumberSplashImg],
    unit: '300ml', weight: '300ml',
    nutrition: { calories: 75, protein: '2g', carbs: '16g', fat: '0.3g', fiber: '1g', vitamins: ['Vitamin K', 'Vitamin C', 'Potassium', 'Magnesium'] },
    benefits: ['Deep hydration', 'Natural detoxifier', 'Supports skin health', 'Aids digestion'],
    storage: 'Refrigerate at all times. Consume within 48 hours of opening.',
    consumptionTips: ['Perfect morning detox drink', 'Enjoy post-meal for digestion', 'Add a pinch of black salt', 'Serve over ice on hot days'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.4, reviewCount: 76, tags: ['hydrating', 'detox', 'light'], createdAt: '2024-02-10',
  },
  {
    id: 'prod-8', name: 'Apple Sprout', slug: 'apple-sprout',
    description: 'A crisp, naturally sweet juice that combines the goodness of fresh apples with the nutritional punch of microgreen sprouts. Cold-pressed for maximum flavor and nutrient retention — a delicious way to get your greens.',
    price: 99, categoryId: 'cat-2',
    images: [appleSproutImg],
    unit: '300ml', weight: '300ml',
    nutrition: { calories: 110, protein: '1.5g', carbs: '26g', fat: '0.3g', fiber: '2g', vitamins: ['Vitamin C', 'Vitamin K', 'Iron', 'Calcium'] },
    benefits: ['Natural sweetness without added sugar', 'Rich in phytonutrients', 'Supports heart health', 'Gentle energy boost'],
    storage: 'Refrigerate at all times. Consume within 48 hours of opening.',
    consumptionTips: ['Great for kids and adults alike', 'Perfect mid-morning refresher', 'Pair with breakfast', 'Serve slightly chilled'],
    isFeatured: true, isSeasonal: false, isBestSeller: false, rating: 4.6, reviewCount: 112, tags: ['sweet', 'kid-friendly', 'cold-pressed'], createdAt: '2024-03-05',
  },
  {
    id: 'prod-9', name: 'Sweet Lime Spark', slug: 'sweet-lime-spark',
    description: 'A zesty, citrusy burst of freshness. Made from sweet limes (mosambi) cold-pressed at their peak ripeness, with just a hint of mint. Light, tangy, and utterly refreshing — the classic Indian refresher, elevated.',
    price: 90, categoryId: 'cat-2',
    images: [sweetLimeImg],
    unit: '300ml', weight: '300ml',
    nutrition: { calories: 85, protein: '1g', carbs: '20g', fat: '0.2g', fiber: '0.5g', vitamins: ['Vitamin C', 'Folate', 'Potassium', 'Flavonoids'] },
    benefits: ['Excellent source of Vitamin C', 'Natural coolant', 'Aids digestion', 'Boosts immunity'],
    storage: 'Refrigerate at all times. Consume within 48 hours of opening.',
    consumptionTips: ['Perfect summer thirst quencher', 'Great with a pinch of black salt', 'Enjoy before meals', 'Serve with crushed ice'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.5, reviewCount: 94, tags: ['citrus', 'refreshing', 'immunity'], createdAt: '2024-02-20',
  },
  {
    id: 'prod-10', name: 'Watermelon Fresh', slug: 'watermelon-fresh',
    description: 'Summer in a bottle. Fresh, juicy watermelon cold-pressed with a touch of mint and lime for a crisp, hydrating juice that tastes like pure sunshine. No added sugar — just nature\'s candy at its best.',
    price: 95, categoryId: 'cat-2',
    images: [watermelonFreshImg],
    unit: '300ml', weight: '300ml',
    nutrition: { calories: 90, protein: '2g', carbs: '20g', fat: '0.2g', fiber: '1g', vitamins: ['Vitamin C', 'Vitamin A', 'Lycopene', 'Potassium'] },
    benefits: ['Deeply hydrating', 'Rich in lycopene', 'Natural post-workout recovery', 'Heart-healthy'],
    storage: 'Refrigerate at all times. Consume within 48 hours of opening.',
    consumptionTips: ['The ultimate summer drink', 'Perfect post-workout hydrator', 'Freeze into ice pops for kids', 'Add a sprig of basil'],
    isFeatured: false, isSeasonal: true, isBestSeller: true, rating: 4.7, reviewCount: 145, tags: ['hydrating', 'summer', 'popular'], createdAt: '2024-03-10',
  },
  // Microgreens
  {
    id: 'prod-11', name: 'Pink Radish', slug: 'pink-radish',
    description: 'Crisp and peppery microgreens packed with antioxidants. Supports digestion and boosts immunity.',
    price: 120, categoryId: 'cat-3',
    images: [redRadishImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 15, protein: '1.5g', carbs: '2g', fat: '0.5g', fiber: '1g', vitamins: ['Vitamin C', 'Vitamin E', 'Vitamin K', 'Iron'] },
    benefits: ['Rich in antioxidants', 'Supports digestion', 'Boosts immunity', 'Anti-inflammatory properties'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to salads for a peppery kick', 'Garnish soups and sandwiches', 'Blend into green smoothies', 'Top avocado toast for crunch'],
    isFeatured: false, isSeasonal: false, isBestSeller: true, rating: 4.6, reviewCount: 54, tags: ['microgreens', 'peppery', 'digestion'], createdAt: '2024-04-01',
  },
  {
    id: 'prod-12', name: 'White Radish', slug: 'white-radish',
    description: 'Mild yet nutrient-dense, rich in vitamins and minerals. Enhances detoxification and gut health.',
    price: 120, categoryId: 'cat-3',
    images: [whiteRadishImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 12, protein: '1g', carbs: '2.5g', fat: '0.3g', fiber: '1g', vitamins: ['Vitamin C', 'Vitamin B6', 'Potassium', 'Calcium'] },
    benefits: ['Supports detoxification', 'Promotes gut health', 'Rich in minerals', 'Low calorie & refreshing'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Toss into Asian-style salads', 'Use as a crunchy garnish', 'Pair with citrus dressings', 'Add to spring rolls for texture'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.3, reviewCount: 28, tags: ['microgreens', 'mild', 'detox'], createdAt: '2024-04-05',
  },
  {
    id: 'prod-13', name: 'Wheatgrass', slug: 'wheatgrass',
    description: 'A powerhouse of chlorophyll and enzymes. Aids in detox, boosts energy, and supports digestion.',
    price: 70, categoryId: 'cat-3',
    images: [wheatgrassImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 20, protein: '2g', carbs: '4g', fat: '0.5g', fiber: '2g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin E', 'Iron', 'Magnesium'] },
    benefits: ['Powerful detox support', 'Boosts natural energy', 'Rich in chlorophyll', 'Supports digestion'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Juice with apple and ginger', 'Add to morning smoothies', 'Mix into lemon water for a wellness shot', 'Start with small amounts'],
    isFeatured: false, isSeasonal: true, isBestSeller: false, rating: 4.8, reviewCount: 72, tags: ['microgreens', 'detox', 'energy'], createdAt: '2024-04-10',
  },
  {
    id: 'prod-14', name: 'Beetroot', slug: 'beetroot',
    description: 'Earthy and vibrant, loaded with iron and folate. Improves blood circulation and endurance.',
    price: 199, categoryId: 'cat-3',
    images: [beetrootImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 22, protein: '2g', carbs: '4g', fat: '0.3g', fiber: '1.5g', vitamins: ['Vitamin A', 'Vitamin C', 'Iron', 'Folate'] },
    benefits: ['Improves blood circulation', 'Rich in iron and folate', 'Supports endurance', 'Natural detoxifier'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to smoothies for vibrant color', 'Top grain bowls with a handful', 'Pair with goat cheese in salads', 'Juice with carrot and apple'],
    isFeatured: true, isSeasonal: false, isBestSeller: false, rating: 4.7, reviewCount: 63, tags: ['microgreens', 'vibrant', 'iron-rich'], createdAt: '2024-04-15',
  },
  {
    id: 'prod-15', name: 'Pak Choi', slug: 'pak-choi',
    description: 'Tender and mildly sweet, full of vitamins A, C, and K. Supports bone health and immunity.',
    price: 180, categoryId: 'cat-3',
    images: [bokChoyImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 13, protein: '1.5g', carbs: '2g', fat: '0.3g', fiber: '1g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Calcium'] },
    benefits: ['Supports bone health', 'Boosts immunity', 'Mild and versatile', 'Low calorie'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Stir-fry lightly with garlic', 'Add to noodle bowls', 'Use as a microgreen bed for proteins', 'Toss into warm salads'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.4, reviewCount: 32, tags: ['microgreens', 'mild', 'versatile'], createdAt: '2024-04-20',
  },
  {
    id: 'prod-16', name: 'Sunflower', slug: 'sunflower',
    description: 'Nutty and crunchy, packed with protein and healthy fats. Promotes muscle recovery and heart health.',
    price: 170, categoryId: 'cat-3',
    images: [sunflowerImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 25, protein: '3g', carbs: '3g', fat: '1.5g', fiber: '1.5g', vitamins: ['Vitamin E', 'Vitamin B1', 'Vitamin B6', 'Zinc', 'Selenium'] },
    benefits: ['Promotes muscle recovery', 'Supports heart health', 'High in protein', 'Rich in healthy fats'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to sandwiches for crunch', 'Sprinkle over hummus bowls', 'Blend into pesto for a twist', 'Use as a salad topper'],
    isFeatured: false, isSeasonal: true, isBestSeller: false, rating: 4.6, reviewCount: 48, tags: ['microgreens', 'nutty', 'protein-rich'], createdAt: '2024-05-01',
  },
  {
    id: 'prod-17', name: 'Mustard', slug: 'mustard',
    description: 'Spicy and bold, rich in glucosinolates. Aids metabolism and strengthens immunity.',
    price: 110, categoryId: 'cat-3',
    images: [mustardImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 15, protein: '1.5g', carbs: '2g', fat: '0.5g', fiber: '1g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Calcium'] },
    benefits: ['Aids metabolism', 'Strengthens immunity', 'Bold, spicy flavor', 'Rich in glucosinolates'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Use as a spicy garnish for curries', 'Add to rice bowls for a kick', 'Pair with eggs for breakfast', 'Mix into cream cheese spreads'],
    isFeatured: false, isSeasonal: false, isBestSeller: true, rating: 4.5, reviewCount: 41, tags: ['microgreens', 'spicy', 'immunity'], createdAt: '2024-05-05',
  },
  {
    id: 'prod-18', name: 'Fenugreek', slug: 'fenugreek',
    description: 'Mildly bitter with a hint of maple, supports digestion and blood sugar balance.',
    price: 110, categoryId: 'cat-3',
    images: [fenugreekImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 18, protein: '2g', carbs: '3g', fat: '0.5g', fiber: '2g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Iron'] },
    benefits: ['Supports blood sugar balance', 'Aids digestion', 'Promotes lactation', 'Anti-inflammatory'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Sauté lightly with ghee', 'Add to lentil soups', 'Blend into green smoothies', 'Pair with sweet potatoes'],
    isFeatured: false, isSeasonal: false, isBestSeller: true, rating: 4.5, reviewCount: 37, tags: ['microgreens', 'digestion', 'blood-sugar'], createdAt: '2024-05-10',
  },
  {
    id: 'prod-19', name: 'Broccoli', slug: 'broccoli',
    description: 'Mild and nutrient-dense, packed with sulforaphane. Supports detoxification and cellular health.',
    price: 220, categoryId: 'cat-3',
    images: [broccoliImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 17, protein: '2g', carbs: '2.5g', fat: '0.4g', fiber: '1.5g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Sulforaphane'] },
    benefits: ['Packed with sulforaphane', 'Supports detoxification', 'Promotes cellular health', 'Premium superfood'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to wraps and sandwiches', 'Sprinkle over roasted vegetables', 'Blend into pesto', 'Use as a garnish for any savory dish'],
    isFeatured: true, isSeasonal: false, isBestSeller: false, rating: 4.9, reviewCount: 81, tags: ['microgreens', 'superfood', 'detox'], createdAt: '2024-05-15',
  },
  {
    id: 'prod-20', name: 'Arugula', slug: 'arugula',
    description: 'Peppery and aromatic, high in antioxidants and nitrates. Boosts heart health and digestion.',
    price: 220, categoryId: 'cat-3',
    images: [arugulaImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 14, protein: '1.5g', carbs: '2g', fat: '0.4g', fiber: '1g', vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Calcium'] },
    benefits: ['Boosts heart health', 'Supports digestion', 'High in antioxidants', 'Peppery aromatic flavor'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Perfect for peppery salads', 'Top pizzas after baking', 'Pair with lemon vinaigrette', 'Layer into gourmet sandwiches'],
    isFeatured: true, isSeasonal: false, isBestSeller: false, rating: 4.7, reviewCount: 59, tags: ['microgreens', 'peppery', 'heart-health'], createdAt: '2024-05-20',
  },
  {
    id: 'prod-21', name: 'Turnip', slug: 'turnip',
    description: 'Mild and slightly sweet, rich in fiber and vitamin C. Supports gut health and immunity.',
    price: 99, categoryId: 'cat-3',
    images: [turnipImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 12, protein: '1g', carbs: '2.5g', fat: '0.3g', fiber: '1g', vitamins: ['Vitamin C', 'Vitamin B6', 'Calcium', 'Fiber'] },
    benefits: ['Supports gut health', 'Rich in vitamin C', 'Boosts immunity', 'Mild and versatile'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to fresh spring salads', 'Use as a garnish for soups', 'Mix into coleslaw for crunch', 'Pair with creamy dressings'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.2, reviewCount: 22, tags: ['microgreens', 'mild', 'budget-friendly'], createdAt: '2024-05-25',
  },
  {
    id: 'prod-22', name: 'Red Amaranth', slug: 'red-amaranth',
    description: 'Vibrant and earthy, packed with iron and amino acids. Promotes blood health and muscle recovery.',
    price: 199, categoryId: 'cat-3',
    images: [redAmaranthImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 20, protein: '2.5g', carbs: '3g', fat: '0.5g', fiber: '1.5g', vitamins: ['Vitamin A', 'Vitamin C', 'Iron', 'Calcium'] },
    benefits: ['Promotes blood health', 'Supports muscle recovery', 'Packed with iron', 'Vibrant color and flavor'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Use as a colorful garnish', 'Add to grain bowls', 'Toss into warm stir-fries', 'Blend into fruit smoothies'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.5, reviewCount: 35, tags: ['microgreens', 'vibrant', 'iron-rich'], createdAt: '2024-06-01',
  },
  {
    id: 'prod-23', name: 'Red Cabbage', slug: 'red-cabbage',
    description: 'Mild and slightly sweet, loaded with anthocyanins. Supports brain function and reduces inflammation.',
    price: 220, categoryId: 'cat-3',
    images: [redCabbageImg],
    unit: '50gm', weight: '50gm',
    nutrition: { calories: 16, protein: '1.5g', carbs: '3g', fat: '0.3g', fiber: '1.5g', vitamins: ['Vitamin C', 'Vitamin K', 'Anthocyanins', 'Fiber'] },
    benefits: ['Supports brain function', 'Reduces inflammation', 'Loaded with anthocyanins', 'Rich in fiber'],
    storage: 'Refrigerate at 2-4°C in a sealed container. Best consumed within 3-4 days.',
    consumptionTips: ['Add to crunchy slaws', 'Use as a vibrant garnish', 'Pair with tangy dressings', 'Layer into tacos and wraps'],
    isFeatured: false, isSeasonal: false, isBestSeller: false, rating: 4.4, reviewCount: 26, tags: ['microgreens', 'anti-inflammatory', 'brain-health'], createdAt: '2024-06-10',
  },
];

export const banners: Banner[] = [
  { id: 'banner-1', title: '', subtitle: '', image: heroBannerImg as any, cta: 'Shop Now', ctaLink: '/explore', textColor: '#FFFFFF', gradientStart: '#1B5E20', gradientEnd: '#2E7D32' },
  { id: 'banner-2', title: 'Summer Cooler Collection', subtitle: 'Beat the heat with our refreshing mint melon & watermelon specials', image: bannerPh('Summer Coolers'), cta: 'Explore Juices', ctaLink: '/category/smoothies', textColor: '#FFFFFF', gradientStart: '#FF8F00', gradientEnd: '#FFC107' },
  { id: 'banner-3', title: 'Start Your Wellness Journey', subtitle: 'Subscribe and save up to 15% on every order', image: bannerPh('Start Your Journey'), cta: 'Learn More', ctaLink: '/subscriptions', textColor: '#FFFFFF', gradientStart: '#00BFA5', gradientEnd: '#2E7D32' },
];

export const lifestyleArticles: LifestyleArticle[] = [
  { id: 'article-1', title: 'Why Cold-Pressed Juice is Worth It', excerpt: 'Discover how our cold-press process preserves nutrients and flavor better than traditional juicing.', image: ph('Cold Pressed', '#FF8F00'), category: 'Wellness', readTime: '5 min' },
  { id: 'article-2', title: 'Smoothies vs Juices: Which Is Right for You?', excerpt: 'Understanding the difference so you can pick what your body needs.', image: ph('Smoothie vs Juice', '#00BFA5'), category: 'Nutrition', readTime: '4 min' },
  { id: 'article-3', title: 'Morning Rituals for a Healthier You', excerpt: 'Simple routines that transform your energy and focus — starting with the right breakfast drink.', image: ph('Morning Rituals', '#2E7D32'), category: 'Lifestyle', readTime: '6 min' },
  { id: 'article-4', title: 'Sustainable Sipping: Good for You, Good for Earth', excerpt: 'How choosing fresh, local ingredients helps the planet while nourishing your body.', image: ph('Sustainable', '#4CAF50'), category: 'Sustainability', readTime: '3 min' },
];

export const testimonials: Testimonial[] = [
  { id: 'test-1', name: 'Priya Sharma', avatar: avatarPh('P'), role: 'Wellness Coach', content: 'MiniGreens smoothies are my daily go-to. The Mango Fresh is absolutely divine — tastes like real Alphonso mangoes!', rating: 5 },
  { id: 'test-2', name: 'Rohan Mehta', avatar: avatarPh('R'), role: 'Fitness Enthusiast', content: 'The Choco Chill changed my post-workout game. Tastes like dessert but packed with protein. I\'m hooked.', rating: 5 },
  { id: 'test-3', name: 'Ananya Patel', avatar: avatarPh('A'), role: 'Busy Mom', content: 'Finally, healthy drinks my kids actually love! The Apple Sprout and Strawberry Banana Glow are household favorites.', rating: 5 },
  { id: 'test-4', name: 'Vikram Rao', avatar: avatarPh('V'), role: 'Chef', content: 'As a chef, I appreciate the freshness. The Carrot, Lemon & Radish Microgreens Juice is bold and beautifully balanced.', rating: 5 },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: 'sub-1', name: 'Starter', description: 'Perfect for individuals starting their wellness journey', price: 399, unit: 'week', deliveryFrequency: 'Weekly', items: ['2 smoothies of your choice', '1 fresh juice', 'Free delivery'], benefits: ['Free delivery', 'Flexible skip', 'Cancel anytime'], isPopular: false, color: '#4CAF50' },
  { id: 'sub-2', name: 'Wellness', description: 'Our most popular plan for daily freshness', price: 699, unit: 'week', deliveryFrequency: 'Weekly', items: ['4 smoothies of your choice', '3 fresh juices', '1 seasonal special'], benefits: ['Free delivery', 'Priority support', 'Exclusive recipes', 'Cancel anytime'], isPopular: true, color: '#2E7D32' },
  { id: 'sub-3', name: 'Family', description: 'Complete freshness for the whole family', price: 1199, unit: 'week', deliveryFrequency: 'Weekly', items: ['6 smoothies of your choice', '6 fresh juices', '2 seasonal specials', 'Family-size portions'], benefits: ['Free delivery', 'Priority support', '15% off add-ons', 'Family recipes', 'Cancel anytime'], isPopular: false, color: '#1B5E20' },
  { id: 'sub-4', name: 'Active Greens Box', description: 'Curated microgreens box for the health-conscious — fresh, vibrant, and nutrient-dense', price: 499, unit: 'week', deliveryFrequency: 'Weekly', items: ['3 microgreens of your choice', '1 seasonal special', 'Care instructions & recipes'], benefits: ['Free delivery', 'Flexible skip', 'Cancel anytime'], isPopular: false, color: '#66BB6A' },
  { id: 'sub-5', name: 'Golden Years Box', description: 'Nourishing microgreens crafted for senior wellness — gentle on digestion, big on nutrition', price: 599, unit: 'week', deliveryFrequency: 'Weekly', items: ['2 nutrient-dense microgreens', '1 wellness shot pack', 'Senior-friendly recipes'], benefits: ['Free delivery', 'Flexible skip', 'Cancel anytime'], isPopular: false, color: '#FFA726' },
  { id: 'sub-6', name: 'Workplace Wellness Box', description: 'Keep your team thriving with fresh microgreens delivered to the office every week', price: 699, unit: 'week', deliveryFrequency: 'Weekly', items: ['5 assorted microgreens', '2 wellness shots', 'Team recipes & tips'], benefits: ['Free delivery', 'Priority support', 'Bulk ordering', 'Cancel anytime'], isPopular: true, color: '#42A5F5' },
];

export const orders: Order[] = [
  { id: 'ORD-2024-001', items: [{ productId: 'prod-2', productName: 'Mango Fresh', quantity: 2, price: 110, image: ph('Mango', '#FF9800') }, { productId: 'prod-6', productName: 'Carrot, Lemon & Radish Microgreens Juice', quantity: 1, price: 85, image: ph('Carrot Lemon', '#FF8F00') }], status: 'delivered', total: 340.49, subtotal: 305, deliveryFee: 35.49, deliveryAddress: { id: 'addr-1', label: 'Home', fullName: 'Riya Kapoor', phone: '+91 98765 43210', street: '42 Green Park', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true }, deliveryDate: '2024-12-15', deliveryTime: '08:00 - 10:00', createdAt: '2024-12-14T10:30:00Z', updatedAt: '2024-12-15T09:00:00Z' },
  { id: 'ORD-2024-002', items: [{ productId: 'prod-3', productName: 'Choco Chill', quantity: 1, price: 115, image: ph('Choco', '#5D4037') }, { productId: 'prod-5', productName: 'Mint Melon Smoothie', quantity: 1, price: 105, image: ph('Mint Melon', '#4CAF50') }], status: 'shipped', total: 255.49, subtotal: 220, deliveryFee: 35.49, deliveryAddress: { id: 'addr-1', label: 'Home', fullName: 'Riya Kapoor', phone: '+91 98765 43210', street: '42 Green Park', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true }, deliveryDate: '2024-12-20', deliveryTime: '10:00 - 12:00', createdAt: '2024-12-18T14:00:00Z', updatedAt: '2024-12-19T11:00:00Z' },
  { id: 'ORD-2024-003', items: [{ productId: 'prod-10', productName: 'Watermelon Fresh', quantity: 2, price: 95, image: ph('Watermelon', '#E53935') }, { productId: 'prod-1', productName: 'Strawberry Banana Glow', quantity: 1, price: 99, image: ph('Strawberry Banana', '#E91E63') }], status: 'processing', total: 324.49, subtotal: 289, deliveryFee: 35.49, deliveryAddress: { id: 'addr-1', label: 'Home', fullName: 'Riya Kapoor', phone: '+91 98765 43210', street: '42 Green Park', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true }, deliveryDate: '2024-12-22', deliveryTime: '14:00 - 16:00', notes: 'Please ring the bell twice', createdAt: '2024-12-20T09:15:00Z', updatedAt: '2024-12-20T09:15:00Z' },
];

export const addresses: Address[] = [
  { id: 'addr-1', label: 'Home', fullName: 'Riya Kapoor', phone: '+91 98765 43210', street: '42 Green Park', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true },
  { id: 'addr-2', label: 'Work', fullName: 'Riya Kapoor', phone: '+91 87654 32109', street: 'Unit 12, Tech Park, Andheri East', city: 'Mumbai', state: 'MH', zipCode: '400069', isDefault: false },
];

export const profile: Profile = {
  id: 'user-1', fullName: 'Riya Kapoor', email: 'riya@minigreens.com', phone: '+91 98765 43210',
  avatar: avatarPh('R'),
  dateOfBirth: '1995-08-22', preferences: ['Smoothies', 'Organic', 'Seasonal'],
};

export const faqs: FAQ[] = [
  { id: 'faq-1', question: 'How are your smoothies and juices made?', answer: 'All our products are made fresh daily using premium fruits and vegetables. Our juices are cold-pressed to preserve nutrients, and our smoothies are blended to order for maximum freshness.', category: 'Products' },
  { id: 'faq-2', question: 'How long do the smoothies and juices last?', answer: 'Our products are made fresh and delivered immediately. Smoothies are best consumed within 24 hours. Cold-pressed juices stay fresh for up to 48 hours when refrigerated properly.', category: 'Products' },
  { id: 'faq-3', question: 'What areas do you deliver to?', answer: 'We currently deliver within Mumbai city limits and are expanding to new areas every month. Enter your pincode at checkout to check availability.', category: 'Delivery' },
  { id: 'faq-4', question: 'Can I skip or cancel my subscription?', answer: 'Yes, you can skip any delivery or cancel your subscription anytime with no fees. Just adjust your preferences in your account settings.', category: 'Subscriptions' },
  { id: 'faq-5', question: 'Do you add any sugar or preservatives?', answer: 'Never. Our smoothies and juices are made with 100% whole fruits and vegetables — no added sugar, no preservatives, no artificial anything.', category: 'Products' },
  { id: 'faq-6', question: 'What is your refund policy?', answer: 'If you are not satisfied with any product, contact us within 24 hours of delivery and we will make it right with a refund or replacement.', category: 'Orders' },
  { id: 'faq-7', question: 'Do you offer catering or bulk orders?', answer: 'Yes, we partner with offices, gyms, and events. Contact us at hello@minigreens.com for bulk pricing and custom packages.', category: 'Business' },
  { id: 'faq-8', question: 'How should I store my drinks?', answer: 'Keep them refrigerated at 2-4°C at all times. Shake well before drinking. For best taste, consume your smoothie the same day and your juice within 48 hours.', category: 'Products' },
];

export const searchSuggestions = [
  { id: 'sg-1', text: 'Strawberry Banana Glow', type: 'product' as const },
  { id: 'sg-2', text: 'Mango Fresh', type: 'product' as const },
  { id: 'sg-3', text: 'Smoothies', type: 'category' as const },
  { id: 'sg-4', text: 'Choco Chill', type: 'product' as const },
  { id: 'sg-5', text: 'Juices', type: 'category' as const },
  { id: 'sg-6', text: 'Watermelon Fresh', type: 'product' as const },
  { id: 'sg-7', text: 'Microgreens', type: 'category' as const },
  { id: 'sg-8', text: 'Broccoli', type: 'product' as const },
  { id: 'sg-9', text: 'Beetroot', type: 'product' as const },
  { id: 'sg-10', text: 'Wheatgrass', type: 'product' as const },
  { id: 'sg-11', text: 'Arugula', type: 'product' as const },
  { id: 'sg-12', text: 'Sunflower', type: 'product' as const },
  { id: 'sg-13', text: 'Fenugreek', type: 'product' as const },
  { id: 'sg-14', text: 'Pink Radish', type: 'product' as const },
];

export const onboardingSlides = [
  { id: 'onboard-1', title: 'Sip Fresh, Live Well', subtitle: 'Premium smoothies and cold-pressed juices, crafted fresh daily and delivered straight to your door.', image: ph('Sip Fresh', '#1B5E20', 800, 800) },
  { id: 'onboard-2', title: '100% Natural Goodness', subtitle: 'Every drink is made from handpicked fruits and vegetables. No added sugar. No preservatives. Just pure, delicious nutrition.', image: ph('100% Natural', '#2E7D32', 800, 800) },
  { id: 'onboard-3', title: 'Your Daily Wellness', subtitle: 'From creamy smoothies to refreshing cold-pressed juices, discover delicious ways to nourish your body every day.', image: ph('Daily Wellness', '#1B5E20', 800, 800) },
];

export const whyChooseUs = [
  { id: 'why-1', title: 'Made Fresh Daily', description: 'Every smoothie and juice is prepared fresh each morning and delivered same-day for peak flavor and nutrition.', icon: 'sunny' },
  { id: 'why-2', title: '100% Natural', description: 'No added sugar, no preservatives, no artificial flavors. Just real fruits and vegetables in every sip.', icon: 'leaf' },
  { id: 'why-3', title: 'Cold-Pressed Juices', description: 'Our hydraulic cold-press preserves enzymes and nutrients that traditional juicing destroys.', icon: 'thermometer' },
  { id: 'why-4', title: 'Eco-Friendly Packing', description: '100% recyclable glass bottles. Because loving your body should also mean loving the planet.', icon: 'recycle' },
];
