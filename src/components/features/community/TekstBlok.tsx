interface TekstBlokData {
  titel?: string;
  inhoud?: string;
}

export function TekstBlok({ data }: { data: TekstBlokData }) {
  return (
    <div className="max-w-[640px]">
      {data.titel && <h3 className="font-display text-display-sm text-warmzwart mb-3">{data.titel}</h3>}
      {data.inhoud && (
        <p className="text-body text-warmgrijs-dark leading-relaxed whitespace-pre-line">{data.inhoud}</p>
      )}
    </div>
  );
}
