"use client";

import { setNonce } from "get-nonce";

/**
 * Reicht den CSP-Nonce an `react-style-singleton` weiter.
 *
 * Radix sperrt bei modalen Overlays (Suchdialog, mobile Navigation) das
 * Scrollen des Hintergrunds. Das erledigt `react-remove-scroll`, indem es zur
 * Laufzeit ein `<style>` in den `<head>` hängt. Ohne Nonce blockt
 * `style-src-elem 'self' 'nonce-…'` diesen Tag, und im Log stand bei jedem
 * Öffnen eine CSP-Verletzung. Wirkung war außerdem: der Hintergrund scrollte
 * hinter dem offenen Dialog weiter.
 *
 * `react-style-singleton` fragt den Nonce über `get-nonce` ab. Ein
 * `setNonce()` reicht deshalb aus, damit der eingehängte Tag den Nonce trägt
 * und die Policy ihn durchlässt.
 *
 * Der Aufruf steht bewusst im Render und nicht in einem Effect: die Dialoge
 * hängen ihren Tag beim ersten Öffnen ein, und das kann vor dem Effect
 * passieren. `setNonce` schreibt nur eine Modulvariable, ein zweiter Aufruf
 * mit demselben Wert kostet nichts.
 */
export function NonceSetup({ nonce }: { nonce?: string }) {
  if (nonce) setNonce(nonce);
  return null;
}
