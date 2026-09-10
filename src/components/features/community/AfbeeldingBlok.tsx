/* eslint-disable @next/next/no-img-element */
interface AfbeeldingBlokData {
  afbeelding_url?: string;
  bijschrift?: string;
}

export function AfbeeldingBlok({ data }: { data: AfbeeldingBlokData }) {
  if (!data.afbeelding_url) return null;

  return (
    <div>
      <img src={data.afbeelding_url} alt={data.bijschrift ?? ""} className="w-full rounded object-cover" />
      {data.bijschrift && <p className="text-body-sm text-warmgrijs mt-2 text-center italic">{data.bijschrift}</p>}
    </div>
  );
}
