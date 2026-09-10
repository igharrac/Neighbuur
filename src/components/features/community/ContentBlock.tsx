import type { ContentBlokType } from "@/types";
import type { Lang } from "@/lib/i18n";
import { TekstBlok } from "./TekstBlok";
import { AfbeeldingBlok } from "./AfbeeldingBlok";
import { ReviewsBlok } from "./ReviewsBlok";
import { GroepskortingenBlok } from "./GroepskortingenBlok";
import { BewonersBlok } from "./BewonersBlok";
import { AankondigingBlok } from "./AankondigingBlok";
import { VakmanSpotlight } from "./VakmanSpotlight";

interface ContentBlockProps {
  type: ContentBlokType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  community_id: string;
  lang: Lang;
}

/**
 * Switch op blok-type. hero_banner wordt apart bovenaan de community-pagina
 * gerenderd (zie page.tsx) en komt hier niet binnen.
 */
export function ContentBlock({ type, data, community_id, lang }: ContentBlockProps) {
  switch (type) {
    case "tekst":
      return <TekstBlok data={data} />;
    case "afbeelding":
      return <AfbeeldingBlok data={data} />;
    case "reviews":
      return <ReviewsBlok data={data} community_id={community_id} />;
    case "groepskortingen":
      return <GroepskortingenBlok community_id={community_id} lang={lang} />;
    case "bewoners":
      return <BewonersBlok data={data} community_id={community_id} />;
    case "aankondiging":
      return <AankondigingBlok data={data} />;
    case "vakman_spotlight":
      return <VakmanSpotlight data={data} />;
    default:
      return null;
  }
}
