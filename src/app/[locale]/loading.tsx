/**
 * Ladezustand.
 *
 * Vorher stand hier ein kreisender Ring in der Mitte. Der sagt nur, dass
 * irgendetwas passiert, und der Inhalt springt beim Einsetzen an eine ganz
 * andere Stelle. Diese Platzhalter haben die Form dessen, was gleich kommt:
 * Überschrift, Zusammenfassung, ein paar Absätze, ein Codeblock.
 */
export default function Loading() {
  return (
    // Für Screenreader ausgeblendet: die Platzhalter tragen keine Aussage,
    // und der Routenwechsel wird ohnehin vom Router angekündigt.
    <div className="container-page py-12 md:py-16" aria-hidden="true">
      <div>
        <div className="skeleton h-4 w-40" />

        <div className="mt-8 border-b border-[var(--color-border)] pb-6">
          <div className="skeleton h-9 w-3/4" />
          <div className="skeleton mt-4 h-5 w-full max-w-xl" />
        </div>

        <div className="mt-10 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>

        <div className="skeleton mt-8 h-40 w-full rounded-md" />

        <div className="mt-8 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
