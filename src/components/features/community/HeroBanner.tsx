/* eslint-disable @next/next/no-img-element */
interface HeroBannerData {
  afbeelding_url?: string;
  titel?: string;
  subtitel?: string;
}

export function HeroBanner({ data }: { data: HeroBannerData }) {
  return (
    <div className="relative w-full aspect-[21/9] rounded-md overflow-hidden bg-sand">
      {data.afbeelding_url && (
        <img src={data.afbeelding_url} alt={data.titel ?? ""} className="w-full h-full object-cover" />
      )}
      {(data.titel || data.subtitel) && (
        <div className="absolute inset-0 bg-gradient-to-t from-warmzwart/70 via-warmzwart/10 to-transparent flex flex-col justify-end p-6 md:p-8">
          {data.titel && (
            <h2 className="font-display text-display-md md:text-display-lg text-white text-balance">{data.titel}</h2>
          )}
          {data.subtitel && <p className="text-white/80 text-body mt-1 max-w-lg">{data.subtitel}</p>}
        </div>
      )}
    </div>
  );
}
