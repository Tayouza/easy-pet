import { memo, useEffect, useRef, useState, type ComponentRef } from "react";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import type { EasyMapProps, MapMarker } from "./types";
export default function EasyMap({
  region,
  markers = [],
  userLocation,
  mode = "map",
  interactive = true,
  style,
  onMarkerPress,
  onMapPress,
  onPickerChange,
}: EasyMapProps) {
  const map = useRef<MapView>(null);
  const [initialRegion] = useState(region);
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  useEffect(() => {
    map.current?.animateToRegion(
      { latitude, longitude, latitudeDelta, longitudeDelta },
      350,
    );
  }, [latitude, longitude, latitudeDelta, longitudeDelta]);
  return (
    <MapView
      ref={map}
      provider={PROVIDER_DEFAULT}
      style={style}
      initialRegion={initialRegion}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
      onMapReady={() => map.current?.animateToRegion(region, 350)}
      onPress={() => onMapPress?.()}
    >
      {markers.map((marker) => (
        <StoreMarker
          key={`${marker.id}:${marker.logo_url ?? ""}:${marker.cor}:${marker.destaque}`}
          marker={marker}
          onPress={onMarkerPress}
        />
      ))}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }}
          title="Você está aqui"
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#2B7FFF",
              borderWidth: 3,
              borderColor: "white",
            }}
          />
        </Marker>
      )}
      {mode === "picker" && (
        <Marker
          draggable
          coordinate={{ latitude, longitude }}
          pinColor="#FF6B35"
          onDragEnd={(event) =>
            onPickerChange?.({
              lat: event.nativeEvent.coordinate.latitude,
              lng: event.nativeEvent.coordinate.longitude,
            })
          }
        />
      )}
    </MapView>
  );
}

const StoreMarker = memo(function StoreMarker({
  marker,
  onPress,
}: {
  marker: MapMarker;
  onPress?: (id: string) => void;
}) {
  const nativeMarker = useRef<ComponentRef<typeof Marker>>(null);
  const [tracking, setTracking] = useState(!!marker.logo_url);
  const [failed, setFailed] = useState(false);
  const hasLogo = !!marker.logo_url && !failed;
  const size = marker.destaque ? 52 : 44;
  const finish = () => {
    requestAnimationFrame(() => {
      nativeMarker.current?.redraw();
      setTracking(false);
    });
  };
  useEffect(() => {
    if (!marker.logo_url) return;
    const timer = setTimeout(() => setTracking(false), 12000);
    return () => clearTimeout(timer);
  }, [marker.logo_url]);
  return (
    <Marker
      ref={nativeMarker}
      coordinate={{ latitude: marker.lat, longitude: marker.lng }}
      tracksViewChanges={tracking}
      anchor={hasLogo ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
      onPress={(event) => {
        event.stopPropagation();
        onPress?.(marker.id);
      }}
    >
      {hasLogo ? (
        <View
          collapsable={false}
          style={{ width: size + 12, height: size + 14 }}
        >
          <View
            style={{
              position: "absolute",
              top: size + 3,
              left: size / 2,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 9,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: marker.cor,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 4,
              left: 6,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
              borderColor: marker.cor,
              backgroundColor: "white",
              shadowColor: "#1E1B18",
              shadowOpacity: 0.25,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Image
              source={marker.logo_url}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
              style={{
                width: size - 6,
                height: size - 6,
                borderRadius: (size - 6) / 2,
              }}
              onDisplay={finish}
              onError={() => {
                setFailed(true);
                finish();
              }}
            />
          </View>
          {marker.destaque && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: "white",
                backgroundColor: "#FFC857",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#1E1B18" }}>★</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: marker.cor,
            borderRadius: 30,
            borderWidth: 3,
            borderColor: "white",
            padding: marker.destaque ? 13 : 9,
          }}
        >
          <Text style={{ color: "white", fontSize: marker.destaque ? 22 : 17 }}>
            {marker.destaque ? "★" : "🐾"}
          </Text>
        </View>
      )}
    </Marker>
  );
});
