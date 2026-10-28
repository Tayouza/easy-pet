"use client";

import dynamic from "next/dynamic";

// Só no navegador: a apresentação lê a URL (#slide), mede a janela e conversa com o modo apresentador.
export const PitchDeckClient = dynamic(() => import("./PitchDeck"), { ssr: false });
export const PresenterClient = dynamic(() => import("./PresenterView"), { ssr: false });
