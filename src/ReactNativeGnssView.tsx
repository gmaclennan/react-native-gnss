import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ReactNativeGnssViewProps } from './ReactNativeGnss.types';

const NativeView: React.ComponentType<ReactNativeGnssViewProps> =
  requireNativeViewManager('ReactNativeGnss');

export default function ReactNativeGnssView(props: ReactNativeGnssViewProps) {
  return <NativeView {...props} />;
}
