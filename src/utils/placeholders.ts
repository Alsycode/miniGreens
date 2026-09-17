// Generates inline SVG data URIs for placeholder images - works without network
// Uses colored backgrounds with text labels. Works in React Native (web/native).

const COLORS = [
  '#6f8f4a', '#6f8f4a', '#6f8f4a', '#FF8F00', '#00BFA5',
  '#6f8f4a', '#6f8f4a', '#6f8f4a', '#6f8f4a', '#6f8f4a',
  '#E91E63', '#9C27B0', '#3F51B5', '#FF5722', '#795548',
];

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function svgDataUri(text: string, bgColor: string, width = 400, height = 400): string {
  const safeText = text.replace(/["<>&]/g, '');
  const encoded = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${bgColor}"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="16" fill="rgba(255,255,255,0.1)"/>
    <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="48" font-weight="bold" font-family="system-ui">${safeText[0]?.toUpperCase() || '?'}</text>
    <text x="${width / 2}" y="${height / 2 + 40}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="18" font-family="system-ui">${safeText}</text>
  </svg>`;
  // encodeURIComponent is required — a raw '#' in a fill colour (e.g. #388E3C)
  // would otherwise be read as a URI fragment and the image renders blank on web.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(encoded.replace(/\n/g, '').replace(/\s+/g, ' '))}`;
}

export function getPlaceholder(name: string, customColor?: string): string {
  const color = customColor || hashColor(name);
  return svgDataUri(name, color);
}

export function getCategoryPlaceholder(name: string): string {
  const catColors: Record<string, string> = {
    'smoothies': '#00BFA5', 'juices': '#FF8F00',
  };
  // We get slug from name
  const key = name.toLowerCase().replace(/\s+/g, '-');
  return getPlaceholder(name, catColors[key] || hashColor(name));
}

export function getProductPlaceholder(name: string): string {
  return getPlaceholder(name, '#6f8f4a');
}

export function getBannerPlaceholder(title: string): string {
  const color = '#5a7539';
  const safeText = title.replace(/["<>&]/g, '');
  const width = 1200;
  const height = 600;
  const encoded = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5a7539"/><stop offset="100%" stop-color="#6f8f4a"/></linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="24" fill="rgba(255,255,255,0.08)"/>
    <text x="60" y="${height / 2 - 10}" fill="rgba(255,255,255,0.15)" font-size="200" font-weight="bold" font-family="system-ui">🌿</text>
    <text x="${width / 2}" y="${height / 2 - 20}" text-anchor="middle" fill="white" font-size="42" font-weight="bold" font-family="system-ui">${safeText}</text>
    <text x="${width / 2}" y="${height / 2 + 40}" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="22" font-family="system-ui">Premium wellness, delivered fresh</text>
  </svg>`;
  // encodeURIComponent is required — a raw '#' in a fill colour (e.g. #388E3C)
  // would otherwise be read as a URI fragment and the image renders blank on web.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(encoded.replace(/\n/g, '').replace(/\s+/g, ' '))}`;
}

export function getAvatarPlaceholder(name: string): string {
  const color = hashColor(name);
  const initial = name[0]?.toUpperCase() || '?';
  const encoded = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <circle cx="100" cy="100" r="100" fill="${color}"/>
    <text x="100" y="120" text-anchor="middle" fill="white" font-size="80" font-weight="bold" font-family="system-ui">${initial}</text>
  </svg>`;
  // encodeURIComponent is required — a raw '#' in a fill colour (e.g. #388E3C)
  // would otherwise be read as a URI fragment and the image renders blank on web.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(encoded.replace(/\n/g, '').replace(/\s+/g, ' '))}`;
}

// Maps product/category names to relevant emoji for visual variety
export const productEmojis: Record<string, string> = {
  'smoothies': '🥤', 'juices': '🧃',
  'strawberry-banana-glow': '🍓', 'mango-fresh': '🥭', 'choco-chill': '🍫',
  'papaya-glow': '✨', 'mint-melon-smoothie': '🍈',
  'carrot-lemon-radish-microgreens-juice': '🥕', 'cucumber-splash': '🥒',
  'apple-sprout': '🍎', 'sweet-lime-spark': '🍋', 'watermelon-fresh': '🍉',
};

export function getEmoji(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return productEmojis[slug] || '🌿';
}

// Resolve image source — handles both string URIs (SVG data URIs, remote URLs)
// and require() results (static asset references from React Native)
export function resolveImageSource(source: any) {
  if (typeof source === 'string') {
    return { uri: source };
  }
  return source;
}
