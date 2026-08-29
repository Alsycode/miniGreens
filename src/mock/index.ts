import { Product, Category, Banner, LifestyleArticle, Testimonial, SubscriptionPlan, Order, Address, Profile, FAQ } from '../types';

// Product images
const wheatgrassImg = require('../assets/wheatgrass.png');
const whiteRadishImg = require('../assets/whiteraddish.webp');
const redRadishImg = require('../assets/redraddish.png');
const beetrootImg = require('../assets/beetroot.png');
const bokChoyImg = require('../assets/bokchoy.png');
const sunflowerImg = require('../assets/sunflowershoots.png');
const redCabbageImg = require('../assets/redcabbage.png');
const strawberryBananaImg = require('../assets/strawberry-banana.png');
const mangoFreshImg = require('../assets/Mango Fresh.png');
const chocChillImg = require('../assets/choco-chill.jpg');
const papayaGlowImg = require('../assets/papaya-glow.png');
const mintMelonImg = require('../assets/mint-melon.png');
const carrotLemonJuiceImg = require('../assets/carrot-lemon-juice.png');
const cucumberSplashImg = require('../assets/cucumber-splash.png');
const appleSproutImg = require('../assets/apple-sprout.png');
const sweetLimeImg = require('../assets/sweet-lime.png');
const watermelonFreshImg = require('../assets/watermelon-fresh.png');
const mustardImg = require('../assets/mustard.jpeg');
const fenugreekImg = require('../assets/fenugreek.png');
const broccoliImg = require('../assets/broccoli.png');
const arugulaImg = require('../assets/arugula.png');
const turnipImg = require('../assets/turnip.png');
const redAmaranthImg = require('../assets/red-amaranth.png');
const heroBannerImg = require('../assets/bannerpic.jpeg');

// Category + editorial imagery
const smoothieImg = require('../assets/smoothie.jpeg');
const juiceImg = require('../assets/juice.jpeg');
const microgreensImg = require('../assets/microgreens.jpeg');
const bowlsImg = require('../assets/bowls.jpeg');

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

// NOTE: `categories` and `products` now come from Supabase via `src/services/catalog.ts`
// (TASK_PLAN.md T1). The remaining exports below are still mock-only (T11 covers them).

export const banners: Banner[] = [
  { id: 'banner-1', title: '', subtitle: '', image: heroBannerImg as any, cta: 'Shop Now', ctaLink: '/explore', textColor: '#FFFFFF', gradientStart: '#1B5E20', gradientEnd: '#2E7D32' },
  { id: 'banner-2', title: 'Summer Cooler Collection', subtitle: 'Beat the heat with our refreshing mint melon & watermelon specials', image: bannerPh('Summer Coolers'), cta: 'Explore Juices', ctaLink: '/category/smoothies', textColor: '#FFFFFF', gradientStart: '#FF8F00', gradientEnd: '#FFC107' },
  { id: 'banner-3', title: 'Start Your Wellness Journey', subtitle: 'Subscribe and save up to 15% on every order', image: bannerPh('Start Your Journey'), cta: 'Learn More', ctaLink: '/subscriptions', textColor: '#FFFFFF', gradientStart: '#00BFA5', gradientEnd: '#2E7D32' },
];

export const lifestyleArticles: LifestyleArticle[] = [
  {
    id: 'article-1',
    slug: 'why-cold-pressed-juice-is-a-game-changer',
    title: 'Why Cold-Pressed Juice is a Game Changer',
    excerpt: 'Discover how our cold-press process preserves nutrients and flavor better than traditional juicing.',
    image: heroBannerImg as any,
    category: 'Wellness',
    readTime: '5 min',
    author: 'Dr. Anjali Rao',
    publishedAt: '2026-08-12',
    content: [
      { body: 'Most supermarket juice is made with a centrifugal juicer — a fast-spinning blade that shreds produce and flings the juice out through a mesh. It is quick and cheap, but that speed comes at a cost: the blade generates heat and whips air into the juice, and both heat and oxygen break down the delicate enzymes and vitamins you are drinking juice for in the first place.' },
      { heading: 'How cold-pressing is different', body: 'A hydraulic cold-press works in two slow stages. First the fruit and vegetables are ground into a fine pulp. Then thousands of pounds of pressure squeeze that pulp against a filter cloth, extracting the juice without ever spinning it or heating it. No blade, almost no oxidation, no added heat.' },
      { heading: 'What that means for you', body: 'Cold-pressed juice holds on to noticeably more vitamin C, folate and plant enzymes, and because it is not aerated it separates less and tastes brighter. Independent lab comparisons routinely show cold-pressed juice retaining 3 to 5 times more of certain micronutrients than centrifugal juice pressed from the same produce.' },
      { heading: 'The trade-off', body: 'Cold-pressing is slower, wastes less but costs more per bottle, and the juice has a short shelf life — it is a fresh food, not a shelf-stable product. That is why we press in small batches every morning and deliver the same day. Keep it refrigerated and drink it within 48 hours for the full benefit.' },
      { heading: 'Bottom line', body: 'If you are buying juice for nutrition rather than just sugar and flavour, the extraction method matters more than the fruit on the label. Cold-pressed is the closest you can get to eating the produce itself.' },
    ],
  },
  {
    id: 'article-2',
    slug: 'smoothies-vs-juices-which-is-better',
    title: 'Smoothies vs Juices: Which is Better?',
    excerpt: 'Understanding the difference so you can pick what your body needs.',
    image: bowlsImg as any,
    category: 'Nutrition',
    readTime: '4 min',
    author: 'Meera Nair',
    publishedAt: '2026-08-05',
    content: [
      { body: 'People use "juice" and "smoothie" almost interchangeably, but nutritionally they are very different drinks that suit different goals.' },
      { heading: 'Juice: concentrated nutrition, no fibre', body: 'Juicing removes the insoluble fibre and leaves you with water, sugars, vitamins and minerals in a form the body absorbs almost instantly. That makes juice a great fast delivery of micronutrients — a "wellness shot" — but the lack of fibre means the natural sugars hit your bloodstream quickly. Best on an empty stomach, in modest amounts.' },
      { heading: 'Smoothies: whole food in a glass', body: 'A smoothie blends the entire fruit or vegetable, fibre included. That fibre slows sugar absorption, keeps you full for hours, and feeds your gut bacteria. Add protein or healthy fat and a smoothie becomes a genuine meal replacement.' },
      { heading: 'Which should you choose?', body: 'Reach for a juice when you want a light, nutrient-dense pick-me-up between meals. Reach for a smoothie when you want something filling — breakfast, a post-workout refuel, or a meal you can drink on a busy day.' },
      { body: 'Neither is "healthier" in the abstract. The right choice depends on whether you need fuel or a nutrient top-up in that moment.' },
    ],
  },
  {
    id: 'article-3',
    slug: 'morning-rituals-for-a-healthier-you',
    title: 'Morning Rituals for a Healthier You',
    excerpt: 'Simple routines that transform your energy and focus — starting with the right breakfast drink.',
    image: juiceImg as any,
    category: 'Lifestyle',
    readTime: '6 min',
    author: 'Kabir Menon',
    publishedAt: '2026-07-28',
    content: [
      { body: 'How you spend the first thirty minutes after waking sets the tone for the whole day. You do not need an elaborate routine — just a few small, repeatable habits.' },
      { heading: 'Hydrate before caffeine', body: 'You wake up mildly dehydrated after 7 to 8 hours without water. A large glass of water — or a light, low-sugar juice like sweet lime or cucumber — rehydrates you and gently wakes the digestive system before coffee does.' },
      { heading: 'Get light on your face', body: 'Ten minutes of daylight within an hour of waking anchors your circadian rhythm, which improves both daytime alertness and that night\'s sleep. Step onto a balcony with your drink instead of scrolling in bed.' },
      { heading: 'Eat protein early', body: 'A protein-forward breakfast — a smoothie with nuts or yoghurt, for example — blunts mid-morning cravings and keeps energy steady. Sugary breakfasts spike and crash.' },
      { heading: 'Move for five minutes', body: 'Not a workout — just light movement. A short walk or a few stretches raises your core temperature and circulation, which sharpens focus far more reliably than a second coffee.' },
      { body: 'Pick one of these and do it every day for two weeks before adding the next. Consistency beats intensity.' },
    ],
  },
  {
    id: 'article-4',
    slug: 'sustainable-sipping-good-for-you-good-for-earth',
    title: 'Sustainable Sipping: Good for You, Good for Earth',
    excerpt: 'How choosing fresh, local ingredients helps the planet while nourishing your body.',
    image: microgreensImg as any,
    category: 'Sustainability',
    readTime: '3 min',
    author: 'Tara Iyer',
    publishedAt: '2026-07-15',
    content: [
      { body: 'The environmental footprint of a drink is decided long before it reaches your glass — in how the produce was grown, how far it travelled, and what it is served in.' },
      { heading: 'Local and seasonal cuts transport emissions', body: 'Produce that is grown nearby and in season needs no long-haul refrigerated freight and no energy-intensive cold storage for months. Buying what is in season is one of the simplest ways to lower the carbon cost of what you eat and drink.' },
      { heading: 'Microgreens are remarkably efficient', body: 'Because they are harvested in 7 to 14 days, microgreens use a fraction of the water, land and fertiliser of mature vegetables while delivering a higher concentration of nutrients per gram.' },
      { heading: 'Packaging is the easy win', body: 'We deliver in recyclable glass and compostable trays and take the glass back to reuse it. Choosing refill and return over single-use plastic removes the part of a drink\'s footprint that lingers longest.' },
      { body: 'Small, repeated choices — seasonal produce, reusable packaging, minimal waste — add up faster than any single grand gesture.' },
    ],
  },
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
  { id: 'why-3', title: 'Cold-Pressed Goodness', description: 'Our hydraulic cold-press process preserves maximum nutrients and natural taste.', icon: 'thermometer' },
  { id: 'why-4', title: 'Sustainable Packaging', description: '100% recyclable glass bottles. Because loving your health should never cost the planet.', icon: 'sync' },
];
