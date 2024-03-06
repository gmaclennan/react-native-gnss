import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";
import { useSyncExternalStore } from "react";

import ReactNativeGnssModule from "./ReactNativeGnssModule";

export interface SatelliteType {
  svid: number;
  constellationType: number;
  elevationDegrees: number;
  azimuthDegrees: number;
  usedInFix: boolean;
}

interface SatelliteEventPayload {
  satellites: SatelliteType[];
}

const emitter = new EventEmitter(
  ReactNativeGnssModule ?? NativeModulesProxy.ReactNativeGnss,
);
const { subscribe, getSnapshot } = createGnssState(emitter);

export function useSatellites() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function createGnssState(emitter: EventEmitter) {
  const listeners = new Set<() => void>();
  let satellites: SatelliteType[] = [];
  let subscription: null | Subscription = null;

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!subscription) {
      subscription = emitter.addListener<SatelliteEventPayload>(
        "satellites",
        (event) => {
          satellites = event.satellites;
          listeners.forEach((listener) => listener());
        },
      );
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        subscription?.remove();
        subscription = null;
      }
    };
  }

  return {
    subscribe,
    getSnapshot: () => satellites,
  };
}
