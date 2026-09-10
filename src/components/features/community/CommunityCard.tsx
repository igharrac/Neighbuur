import Link from "next/link";
import { ArrowRight, UsersThree, Star } from "@phosphor-icons/react/dist/ssr";

interface CommunityCardProps {
  naam: string;
  type: string;
  slug: string;
  aantalLeden: number;
  aantalReviews: number;
}

export function CommunityCard({ naam, type, slug, aantalLeden, aantalReviews }: CommunityCardProps) {
  return (
    <div className="bg-white rounded-md shadow-soft p-5 flex flex-col">
      <p className="text-body-xs font-semibold uppercase tracking-wider text-terracotta mb-1 capitalize">{type}</p>
      <h3 className="font-display text-display-sm text-warmzwart mb-4">{naam}</h3>

      <div className="flex items-center gap-4 text-body-sm text-warmgrijs mb-5">
        <span className="flex items-center gap-1.5">
          <UsersThree size={16} />
          {aantalLeden} bewoners
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={16} />
          {aantalReviews} reviews
        </span>
      </div>

      <Link href={`/community/${slug}`} className="btn-secondary !text-body-sm mt-auto self-start">
        Bekijk
        <ArrowRight size={15} weight="bold" />
      </Link>
    </div>
  );
}
