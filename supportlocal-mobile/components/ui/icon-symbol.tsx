// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'square.grid.2x2.fill': 'grid-view',
  'cart.fill': 'shopping-cart',
  'list.bullet.rectangle.fill': 'receipt-long',
  'person.fill': 'person',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'star.fill': 'star',
  'magnifyingglass': 'search',
  'xmark': 'close',
  'plus': 'add',
  'minus': 'remove',
  'trash': 'delete',
  'pencil': 'edit',
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
  'checkmark': 'check',
  'exclamationmark.triangle': 'warning',
  'info.circle': 'info',
  'bell.fill': 'notifications',
  'gear': 'settings',
  'location.fill': 'location-on',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'sparkles': 'auto-awesome',
  'storefront.fill': 'storefront',
  'cube.fill': 'inventory-2',
  'document.text.fill': 'description',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
