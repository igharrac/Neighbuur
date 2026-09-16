/** Duidelijk zichtbare placeholder voor juridische tekst die nog echte bedrijfsgegevens nodig heeft vóór livegang. */
export function InvullenVoorPublicatie({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border-2 border-dashed border-terracotta bg-terracotta-50 p-4">
      <p className="text-body-xs font-bold uppercase tracking-wider text-terracotta mb-1.5">
        ⚠ Nog invullen vóór publicatie
      </p>
      <p className="text-body-sm text-warmzwart">{children}</p>
    </div>
  );
}
