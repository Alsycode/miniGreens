import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, textVariants, typography, jakartaByWeight, DISPLAY_VARIANTS } from '../../theme';

type Variant = keyof typeof textVariants;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: keyof typeof typography.fontWeight;
  uppercase?: boolean;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = colors.text,
  align,
  weight,
  uppercase,
  style,
  children,
  ...props
}: TypographyProps) {
  const variantStyle = textVariants[variant];

  const additionalStyles: TextStyle = {
    color,
    textAlign: align,
    textTransform: uppercase ? 'uppercase' : undefined,
  };

  // For display variants (h1, h2), weight overrides are ignored to preserve the serif italic.
  // For sans variants, the weight prop also swaps the fontFamily to the correct weight file.
  if (weight && !DISPLAY_VARIANTS.has(variant)) {
    additionalStyles.fontWeight = typography.fontWeight[weight];
    const weightFamily = jakartaByWeight[weight];
    if (weightFamily) additionalStyles.fontFamily = weightFamily;
  }

  return (
    <Text style={[variantStyle as TextStyle, additionalStyles, style]} {...props}>
      {children}
    </Text>
  );
}
