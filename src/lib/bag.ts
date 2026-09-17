/**
 * Adres-resolutie via twee gratis, keyless PDOK-diensten — geen Kadaster-
 * API-key nodig (die vereist registratie en levert exact dezelfde BAG-
 * gegevens, dus deze route is niet tijdelijk maar het permanente pad):
 *
 * 1. Locatieserver (`api.pdok.nl/bzk/locatieserver`) — exacte postcode+
 *    huisnummer-filter (geen fuzzy search) → adres + verblijfsobject-id.
 * 2. BAG OGC API v2 (`api.pdok.nl/kadaster/bag/ogc/v2`) — verblijfsobject
 *    → gekoppelde pand(en) → officieel BAG-pand-id (`identificatie`),
 *    dé sleutel voor "zelfde gebouw"-clustering, betrouwbaarder dan
 *    postcode-matching.
 *
 * Server-only (fetch-only, geen secrets) — mag ook vanuit een server
 * component/route handler aangeroepen worden, nooit vanuit de client
 * i.v.m. CORS/rate-limiting-hygiëne.
 */

const LOCATIESERVER_BASE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";
const BAG_OGC_BASE = "https://api.pdok.nl/kadaster/bag/ogc/v2";

export interface ResolvedAddress {
  bagNummeraanduidingId: string;
  bagVerblijfsobjectId: string;
  bagPandIds: string[];
  street: string | null;
  postalCode: string;
  houseNumber: number;
  houseNumberSuffix: string | null;
  city: string | null;
  municipality: string | null;
  latitude: number | null;
  longitude: number | null;
  bagStatus: string | null;
  formatted: string;
  raw: unknown;
}

export interface AddressCandidate {
  formatted: string;
  huisNlt: string;
}

export type ResolveAddressResult =
  | { status: "found"; address: ResolvedAddress }
  | { status: "ambiguous"; candidates: AddressCandidate[] }
  | { status: "not-found" }
  | { status: "error"; message: string };

interface LocatieserverDoc {
  weergavenaam: string;
  adresseerbaarobject_id: string;
  nummeraanduiding_id: string;
  postcode: string;
  huisnummer: number;
  huis_nlt: string;
  straatnaam: string | null;
  gemeentenaam: string | null;
  woonplaatsnaam: string | null;
  centroide_ll: string | null;
}

function parsePoint(centroideLl: string | null): { lat: number | null; lng: number | null } {
  if (!centroideLl) return { lat: null, lng: null };
  const match = centroideLl.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return { lat: null, lng: null };
  return { lng: Number(match[1]), lat: Number(match[2]) };
}

async function fetchLocatieserverDocs(postcode: string, houseNumber: string): Promise<LocatieserverDoc[]> {
  const params = new URLSearchParams();
  params.append("q", "*");
  params.append("fq", `postcode:${postcode}`);
  params.append("fq", `huisnummer:${houseNumber}`);
  params.append("fq", "type:adres");
  params.append("fl", "*");
  params.append("rows", "20");

  const res = await fetch(`${LOCATIESERVER_BASE}/free?${params.toString()}`);
  if (!res.ok) throw new Error(`Locatieserver gaf status ${res.status}`);
  const data = await res.json();
  return (data?.response?.docs ?? []) as LocatieserverDoc[];
}

async function fetchPandIds(verblijfsobjectId: string): Promise<string[]> {
  const res = await fetch(
    `${BAG_OGC_BASE}/collections/verblijfsobject/items?identificatie=${encodeURIComponent(verblijfsobjectId)}&f=json`
  );
  if (!res.ok) throw new Error(`BAG OGC API (verblijfsobject) gaf status ${res.status}`);
  const data = await res.json();
  const feature = data?.features?.[0];
  const hrefs: string[] = feature?.properties?.["pand.href"] ?? [];
  if (hrefs.length === 0) return [];

  const pandIds = await Promise.all(
    hrefs.map(async (href) => {
      const pandRes = await fetch(`${href}?f=json`);
      if (!pandRes.ok) return null;
      const pandData = await pandRes.json();
      return (pandData?.properties?.identificatie as string | undefined) ?? null;
    })
  );
  return pandIds.filter((id): id is string => !!id);
}

function docToFormatted(doc: LocatieserverDoc): string {
  return doc.weergavenaam;
}

export interface PostcodeCentroid {
  city: string | null;
  municipality: string | null;
  latitude: number;
  longitude: number;
}

/**
 * Geeft het (gemiddelde) middelpunt van een 4-cijferig postcode-gebied —
 * voor het vakman-werkgebied, dat bewust geen huisnummer kent (een
 * provider geeft een gebied op, geen adres). Zelfde PDOK Locatieserver
 * als resolveAddress, nu met een prefix-wildcard op `type:postcode`
 * i.p.v. het exacte `type:adres`-pad. Neemt de eerste treffer — de
 * 6-cijferige postcodes binnen één 4-cijferig gebied liggen typisch
 * een paar honderd meter uit elkaar, ruim genoeg voor een straal-
 * berekening op stadsniveau.
 */
export async function resolvePostcode4Centroid(postcode4: string): Promise<PostcodeCentroid | null> {
  const params = new URLSearchParams();
  params.append("q", "*");
  params.append("fq", `postcode:${postcode4}*`);
  params.append("fq", "type:postcode");
  params.append("fl", "postcode,woonplaatsnaam,gemeentenaam,centroide_ll");
  params.append("rows", "1");

  const res = await fetch(`${LOCATIESERVER_BASE}/free?${params.toString()}`);
  if (!res.ok) throw new Error(`Locatieserver gaf status ${res.status}`);
  const data = await res.json();
  const doc = data?.response?.docs?.[0] as
    | { woonplaatsnaam?: string; gemeentenaam?: string; centroide_ll?: string }
    | undefined;
  if (!doc) return null;

  const { lat, lng } = parsePoint(doc.centroide_ll ?? null);
  if (lat === null || lng === null) return null;

  return {
    city: doc.woonplaatsnaam ?? null,
    municipality: doc.gemeentenaam ?? null,
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Zoekt een adres op exacte postcode + huisnummer. Bij meerdere treffers
 * (verschillende toevoegingen op hetzelfde huisnummer) en een opgegeven
 * `suffix` wordt geprobeerd die te matchen tegen `huis_nlt`; matcht niets
 * eenduidig, dan komt een keuzelijst terug (`ambiguous`) i.p.v. te gokken.
 */
export async function resolveAddress(
  postcode: string,
  houseNumber: string,
  suffix?: string | null
): Promise<ResolveAddressResult> {
  let docs: LocatieserverDoc[];
  try {
    docs = await fetchLocatieserverDocs(postcode, houseNumber);
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Onbekende fout bij adres opzoeken" };
  }

  if (docs.length === 0) return { status: "not-found" };

  let match = docs[0];
  if (docs.length > 1) {
    const bySuffix = suffix ? docs.find((d) => d.huis_nlt.toLowerCase().includes(suffix.toLowerCase())) : undefined;
    if (bySuffix) {
      match = bySuffix;
    } else {
      return {
        status: "ambiguous",
        candidates: docs.map((d) => ({ formatted: docToFormatted(d), huisNlt: d.huis_nlt })),
      };
    }
  }

  let pandIds: string[] = [];
  try {
    pandIds = await fetchPandIds(match.adresseerbaarobject_id);
  } catch {
    // Gebouwrelatie niet op te halen (bv. tijdelijke BAG OGC-storing) —
    // het adres zelf is wel gevonden, alleen zonder cluster-sleutel.
    // Edge case "adres bestaat, geen gebouwrelatie" — geen harde fout.
  }

  const { lat, lng } = parsePoint(match.centroide_ll);

  return {
    status: "found",
    address: {
      bagNummeraanduidingId: match.nummeraanduiding_id,
      bagVerblijfsobjectId: match.adresseerbaarobject_id,
      bagPandIds: pandIds,
      street: match.straatnaam,
      postalCode: match.postcode,
      houseNumber: match.huisnummer,
      houseNumberSuffix: match.huis_nlt !== String(match.huisnummer) ? match.huis_nlt.replace(String(match.huisnummer), "").replace(/^-/, "") || null : null,
      city: match.woonplaatsnaam,
      municipality: match.gemeentenaam,
      latitude: lat,
      longitude: lng,
      bagStatus: null,
      formatted: docToFormatted(match),
      raw: match,
    },
  };
}
