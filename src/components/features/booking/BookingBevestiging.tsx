/* eslint-disable @next/next/no-img-element */
interface BookingBevestigingProps {
  companyName: string;
  logoUrl: string | null;
  datum: string | null;
  categoryName: string | null;
  description: string;
  photoUrls: string[];
}

export function BookingBevestiging({
  companyName,
  logoUrl,
  datum,
  categoryName,
  description,
  photoUrls,
}: BookingBevestigingProps) {
  const datumLabel = datum
    ? new Date(datum).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
    : "Nog af te stemmen via het gesprek";

  return (
    <div>
      <h3 className="font-display text-display-sm mb-4">Controleer je aanvraag</h3>
      <div className="card-flat p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-11 h-11 rounded-sm object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-sage to-sage-700 flex items-center justify-center text-white font-display font-bold">
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-body">{companyName}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-body-sm">
          <div>
            <span className="block text-body-xs text-warmgrijs uppercase font-semibold">Datum</span>
            <span className={datum ? "capitalize" : ""}>{datumLabel}</span>
          </div>
          {categoryName && (
            <div>
              <span className="block text-body-xs text-warmgrijs uppercase font-semibold">Categorie</span>
              <span>{categoryName}</span>
            </div>
          )}
        </div>

        {description && (
          <div>
            <span className="block text-body-xs text-warmgrijs uppercase font-semibold mb-1">Omschrijving</span>
            <p className="text-body-sm text-warmgrijs-dark">{description}</p>
          </div>
        )}

        {photoUrls.length > 0 && (
          <div className="flex gap-2">
            {photoUrls.map((url) => (
              <img key={url} src={url} alt="" className="w-14 h-14 rounded-sm object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
