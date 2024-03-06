import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ReactNativeGnss.web.ts
// and on native platforms to ReactNativeGnss.ts
import ReactNativeGnssModule from './ReactNativeGnssModule';
import ReactNativeGnssView from './ReactNativeGnssView';
import { ChangeEventPayload, ReactNativeGnssViewProps } from './ReactNativeGnss.types';

// Get the native constant value.
export const PI = ReactNativeGnssModule.PI;

export function hello(): string {
  return ReactNativeGnssModule.hello();
}

export async function setValueAsync(value: string) {
  return await ReactNativeGnssModule.setValueAsync(value);
}

const emitter = new EventEmitter(ReactNativeGnssModule ?? NativeModulesProxy.ReactNativeGnss);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ReactNativeGnssView, ReactNativeGnssViewProps, ChangeEventPayload };
