/** Sincroniza a janela da apresentação com o modo apresentador (mesmo navegador, mesma origem). */

export type PitchMessage = { type: "state"; index: number } | { type: "goto"; index: number } | { type: "hello" };

const CHANNEL = "easypet-pitch";

export function openPitchChannel(onMessage: (message: PitchMessage) => void) {
  if (typeof BroadcastChannel === "undefined") return { post: () => {}, close: () => {} };
  const channel = new BroadcastChannel(CHANNEL);
  let open = true;
  channel.onmessage = (event: MessageEvent<PitchMessage>) => onMessage(event.data);
  return {
    post: (message: PitchMessage) => {
      if (open) channel.postMessage(message);
    },
    close: () => {
      open = false;
      channel.close();
    },
  };
}

export const PRESENTER_WINDOW = "easypet-apresentador";
