import * as ExpoLocation from "expo-location";
import React, { useEffect } from "react";
import { StyleSheet, Text as RNText, View, type ViewStyle } from "react-native";
import { useSatellites, type SatelliteType } from "react-native-gnss";
import Animated, {
  useAnimatedStyle,
  useAnimatedSensor,
  SensorType,
} from "react-native-reanimated";
import Svg, { Circle, Line, Text, Rect } from "react-native-svg";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function App() {
  useEffect(() => {
    let cancelled = false;
    let subscription: ExpoLocation.LocationSubscription | null = null;
    ExpoLocation.requestForegroundPermissionsAsync().then((permission) => {
      if (cancelled) return;
      if (permission.granted) {
        ExpoLocation.watchPositionAsync(
          {
            accuracy: ExpoLocation.LocationAccuracy.BestForNavigation,
          },
          (location) => {
            // console.log(location);
          },
        ).then((sub) => {
          if (cancelled) return sub.remove();
          subscription = sub;
        });
      } else {
        console.log("no permissions");
      }
    });
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Scanner diameter={300} />
    </View>
  );
}

const c = {
  radarStroke: "#C6A438",
  label: "#C6A438",
  value: "white",
};

const s = {
  radarRadius: 120,
  w: 300,
  h: 300,
  radarStrokeWidth: 1.5,
  tick: 7,
  cardinalOffset: 5,
  cardinalSize: 20,
  interCardinalSize: 14,
};

const cardinals = ["N", "E", "S", "W"];
const interCardinals = ["NE", "SE", "SW", "NW"];

const InfoLabel = ({ children }: { children: React.ReactNode }) => (
  <RNText
    style={{
      color: c.label,
      fontSize: 14,
      lineHeight: 14,
    }}
  >
    {children}
  </RNText>
);
const InfoValue = ({ children }: { children: React.ReactNode }) => (
  <RNText
    style={{
      color: "white",
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "bold",
    }}
  >
    {children}
  </RNText>
);

const InfoField = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => (
  <View
    style={[
      {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 7,
        paddingHorizontal: 10,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const Satellite = ({
  cx,
  cy,
  type,
  usedInFix,
  rotation,
}: {
  cx: number;
  cy: number;
  type: number;
  usedInFix: boolean;
  rotation: number;
}) => {
  const color = usedInFix ? "#75FA4C" : "#7D83F7";
  const strokeWidth = usedInFix ? 2 : 0;
  switch (type) {
    case 1:
      return (
        <Circle
          cx={cx}
          cy={cy}
          r={3}
          fill={color}
          strokeWidth={strokeWidth}
          stroke={color}
        />
      );
    case 3:
      return (
        <AnimatedRect
          width={6}
          height={6}
          x={cx - 3}
          y={cy - 3}
          fill={color}
          strokeWidth={strokeWidth}
          stroke={color}
          rotation={rotation}
          origin={`${cx},${cy}`}
        />
      );
    case 5:
      return (
        <>
          <AnimatedLine
            x1={cx}
            y1={cy - 4}
            x2={cx}
            y2={cy + 4}
            fill={color}
            stroke={color}
            strokeWidth={2}
            rotation={rotation}
            origin={`${cx},${cy}`}
          />
          <AnimatedLine
            x1={cx - 4}
            y1={cy}
            x2={cx + 4}
            y2={cy}
            fill={color}
            stroke={color}
            strokeWidth={2}
            rotation={rotation}
            origin={`${cx},${cy}`}
          />
        </>
      );
    case 6:
      return (
        <>
          <AnimatedLine
            x1={cx - 3}
            y1={cy - 3}
            x2={cx + 3}
            y2={cy + 3}
            fill={color}
            stroke={color}
            strokeWidth={2}
            rotation={rotation}
            origin={`${cx},${cy}`}
          />
          <AnimatedLine
            x1={cx + 3}
            y1={cy - 3}
            x2={cx - 3}
            y2={cy + 3}
            fill={color}
            stroke={color}
            strokeWidth={2}
            rotation={rotation}
            origin={`${cx},${cy}`}
          />
        </>
      );
    default:
    // console.warn("Unknown type", type);
  }
  return null;
};

const RadarSatellites = React.memo(
  ({ satellites }: { satellites: SatelliteType[] }) => {
    return (
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${s.w} ${s.h}`}>
        {satellites.map((d) => {
          const cx =
            s.w / 2 +
            Math.cos((d.azimuthDegrees / 180) * Math.PI - Math.PI / 2) *
              elevationToRadius(d.elevationDegrees);
          const cy =
            s.w / 2 +
            Math.sin((d.azimuthDegrees / 180) * Math.PI - Math.PI / 2) *
              elevationToRadius(d.elevationDegrees);
          return (
            <React.Fragment key={d.svid + "" + d.constellationType}>
              <Satellite
                cx={cx}
                cy={cy}
                type={d.constellationType}
                usedInFix={d.usedInFix}
                rotation={0}
              />
              <AnimatedText
                x={cx + 3}
                y={cy - 6}
                fontSize={8}
                origin={`${cx},${cy}`}
                fill="white"
              >
                {d.svid}
              </AnimatedText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  },
);

const RadarBackground = React.memo(() => {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${s.w} ${s.h}`}>
      <Circle
        cx={s.w / 2}
        cy={s.w / 2}
        r={s.radarRadius}
        fill="none"
        stroke={c.radarStroke}
        strokeWidth={s.radarStrokeWidth}
      />
      <Circle
        cx={s.w / 2}
        cy={s.w / 2}
        r={(s.radarRadius / 3) * 2}
        fill="none"
        stroke={c.radarStroke}
        strokeWidth={s.radarStrokeWidth}
      />
      <Circle
        cx={s.w / 2}
        cy={s.w / 2}
        r={s.radarRadius / 3}
        fill="none"
        stroke={c.radarStroke}
        strokeWidth={s.radarStrokeWidth}
      />
      <Line
        x1={s.w / 2}
        y1={s.h / 2 - s.radarRadius}
        x2={s.w / 2}
        y2={s.h / 2 + s.radarRadius}
        stroke={c.radarStroke}
        strokeWidth={s.radarStrokeWidth}
      />
      <Line
        y1={s.h / 2}
        x1={s.w / 2 - s.radarRadius}
        y2={s.h / 2}
        x2={s.w / 2 + s.radarRadius}
        stroke={c.radarStroke}
        strokeWidth={s.radarStrokeWidth}
      />
      {new Array(16).fill(null).map((_, i) => (
        <Line
          key={i}
          x1={s.w / 2}
          y1={s.h / 2 - s.radarRadius}
          x2={s.w / 2}
          y2={s.h / 2 - s.radarRadius + s.tick}
          rotation={i * 22.5}
          origin={s.w / 2 + "," + s.h / 2}
          stroke={c.radarStroke}
          strokeWidth={s.radarStrokeWidth}
        />
      ))}
      {cardinals.map((c, i) => (
        <Text
          key={i}
          fill="white"
          x={s.w / 2}
          y={s.h / 2 - s.radarRadius - s.cardinalOffset}
          fontSize={s.cardinalSize}
          rotation={i * 90}
          origin={s.w / 2 + "," + s.h / 2}
          fontWeight="bold"
          textAnchor="middle"
        >
          {c}
        </Text>
      ))}
      {interCardinals.map((c, i) => (
        <Text
          key={i}
          fill="white"
          x={s.w / 2}
          y={s.h / 2 - s.radarRadius - s.cardinalOffset}
          fontSize={s.interCardinalSize}
          rotation={i * 90 + 45}
          origin={s.w / 2 + "," + s.h / 2}
          fontWeight="bold"
          textAnchor="middle"
        >
          {c}
        </Text>
      ))}
    </Svg>
  );
});

function elevationToRadius(e: number) {
  // Degrees:
  // 0° has radius of 110
  // 90° has radius of 0

  return s.radarRadius * (1 - e / 90);
}

const Scanner = ({ diameter = 300 }: { diameter: number }) => {
  const satellites = useSatellites();
  const fixCount = satellites.filter((s) => s.usedInFix).length;
  const satCount = satellites.length;
  const { sensor: rotation } = useAnimatedSensor(SensorType.ROTATION, {
    adjustToInterfaceOrientation: true,
  });

  const radarWrapperStyle = React.useMemo(() => {
    return {
      width: diameter,
      height: diameter,
    };
  }, [diameter]);

  const rotationStyle = useAnimatedStyle(() => {
    const { yaw } = rotation.value;
    return {
      transform: [{ rotate: `${yaw}rad` }],
    };
  });

  return (
    <View
      style={{
        position: "relative",
        flex: 1,
        alignSelf: "stretch",
        alignItems: "center",
        minHeight: 300,
      }}
    >
      <Animated.View style={[radarWrapperStyle, rotationStyle]}>
        <RadarBackground />
        <RadarSatellites satellites={satellites} />
      </Animated.View>
      <InfoField style={{ bottom: 0, right: 0 }}>
        <InfoValue>
          {fixCount}/{satCount}
        </InfoValue>
        <InfoLabel>Fix/Sats</InfoLabel>
      </InfoField>
      <InfoField style={{ bottom: 0, left: 0 }}>
        <InfoValue>10</InfoValue>
        <InfoLabel>Error (m)</InfoLabel>
      </InfoField>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
