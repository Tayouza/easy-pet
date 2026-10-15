import { imageUrl } from "../../lib/images";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { Button, colors, Txt } from "../ui";
import { LEAFLET_HTML } from "./leaflet";
import type { EasyMapProps } from "./types";
const source = { html: LEAFLET_HTML, baseUrl: "https://easypet.local/" };
function mapPayload(props: EasyMapProps) {
  return JSON.stringify({
    region: props.region,
    markers: props.markers?.map((marker) => ({
      ...marker,
      logo_url: imageUrl(marker.logo_url),
    })),
    userLocation: props.userLocation,
    mode: props.mode ?? "map",
    interactive: props.interactive ?? true,
  });
}
export default function EasyMap(props: EasyMapProps) {
  const webview = useRef<WebView>(null);
  const ready = useRef(false);
  const latest = useRef(props);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const payload = mapPayload(props);
  const send = (data: string) =>
    webview.current?.injectJavaScript(
      `window.easyMapUpdate && window.easyMapUpdate(${data}); true;`,
    );
  useEffect(() => {
    latest.current = props;
  });
  useEffect(() => {
    if (ready.current) send(payload);
  }, [payload]);
  useEffect(() => {
    if (status !== "loading") return;
    const timeout = setTimeout(() => setStatus("error"), 20000);
    return () => clearTimeout(timeout);
  }, [status]);
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "ready") {
        ready.current = true;
        setStatus("ready");
        send(mapPayload(latest.current));
      } else if (message.type === "error") setStatus("error");
      else if (message.type === "marker" && typeof message.id === "string")
        props.onMarkerPress?.(message.id);
      else if (message.type === "map") props.onMapPress?.();
      else if (
        message.type === "picker" &&
        Number.isFinite(message.lat) &&
        Number.isFinite(message.lng) &&
        Math.abs(message.lat) <= 90 &&
        Math.abs(message.lng) <= 180
      )
        props.onPickerChange?.({ lat: message.lat, lng: message.lng });
    } catch {
      /* Ignore unrelated or malformed WebView messages. */
    }
  };
  return (
    <View style={[{ overflow: "hidden" }, props.style]}>
      <WebView
        ref={webview}
        source={source}
        style={{ flex: 1, backgroundColor: colors.bg }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        onMessage={onMessage}
        onLoadStart={() => {
          ready.current = false;
          setStatus("loading");
        }}
        onError={() => {
          ready.current = false;
          setStatus("error");
        }}
        onShouldStartLoadWithRequest={(request) => {
          if (
            request.url.startsWith("https://www.openstreetmap.org/copyright") ||
            request.url.startsWith("https://leafletjs.com")
          ) {
            void Linking.openURL(request.url).catch(() => {});
            return false;
          }
          return (
            request.url === "about:blank" ||
            request.url.startsWith("data:text/html") ||
            request.url.startsWith("https://easypet.local/")
          );
        }}
      />
      {status === "loading" && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.bg,
            },
          ]}
        >
          <ActivityIndicator color={colors.primary} />
          <Txt muted>Carregando mapa…</Txt>
        </View>
      )}
      {status === "error" && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              gap: 12,
              backgroundColor: colors.bg,
            },
          ]}
        >
          <Txt muted>
            Não foi possível carregar o mapa. Confira sua conexão.
          </Txt>
          <Button
            label="Tentar novamente"
            onPress={() => {
              ready.current = false;
              setStatus("loading");
              webview.current?.reload();
            }}
          />
        </View>
      )}
    </View>
  );
}
