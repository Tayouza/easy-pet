import type { StyleProp, ViewStyle } from "react-native";
export type MapCoordinate = { lat: number; lng: number };
export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
export type MapMarker = MapCoordinate & {
  id: string;
  cor: string;
  destaque?: boolean;
};
export type EasyMapProps = {
  region: MapRegion;
  markers?: MapMarker[];
  userLocation?: MapCoordinate;
  mode?: "map" | "picker";
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  onMarkerPress?: (id: string) => void;
  onMapPress?: () => void;
  onPickerChange?: (coordinate: MapCoordinate) => void;
};
