import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import type { EasyMapProps } from "./types";
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
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          onPress={(event) => {
            event.stopPropagation();
            onMarkerPress?.(marker.id);
          }}
        >
          <View
            style={{
              backgroundColor: marker.cor,
              borderRadius: 30,
              borderWidth: 3,
              borderColor: "white",
              padding: marker.destaque ? 13 : 9,
            }}
          >
            <Text
              style={{ color: "white", fontSize: marker.destaque ? 22 : 17 }}
            >
              {marker.destaque ? "★" : "🐾"}
            </Text>
          </View>
        </Marker>
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
