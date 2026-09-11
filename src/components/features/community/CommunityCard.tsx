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
    <div className="bg-white rounded-2xl shadow-[0px_4px_10px_rgba(92,64,40,0.04)] p-6 flex flex-col">
      <p className="font-body text-[12px] font-semibold uppercase tracking-[0.6px] text-terracotta mb-1 capitalize">{type}</p>
      <h3 className="font-display font-bold text-[19px] text-warmzwart mb-4">{naam}</h3>

      <div className="flex items-center gap-4 font-body text-[13px] text-warmgrijs mb-5">
        <span className="flex items-center gap-1.5">
          <UsersThree size={16} />
          {aantalLeden} bewoners
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={16} />
          {aantalReviews} reviews
        </span>
      </div>

      <Link href={`/community/${slug}`} className="btn-secondary !rounded-full !text-body-sm mt-auto self-start">
        Bekijk
        <ArrowRight size={15} weight="bold" />
      </Link>
    </div>
  );
}
