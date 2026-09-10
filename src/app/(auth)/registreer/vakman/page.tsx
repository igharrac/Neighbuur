import { RegistratieForm } from "@/components/features/vakman/RegistratieForm";

export default function RegistreerVakmanPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <RegistratieForm refBron={searchParams.ref} />;
}
