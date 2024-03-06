import * as React from 'react';

import { ReactNativeGnssViewProps } from './ReactNativeGnss.types';

export default function ReactNativeGnssView(props: ReactNativeGnssViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
