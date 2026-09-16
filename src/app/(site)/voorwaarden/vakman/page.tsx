import { InvullenVoorPublicatie } from "@/components/features/legal/InvullenVoorPublicatie";

export default function VoorwaardenVakmanPage() {
  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdbcf] px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#a73400]" />
          <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
            Voorwaarden — vakmensen
          </span>
        </span>
        <h1 className="font-display font-bold text-[34px] sm:text-[42px] leading-[1.1] text-warmzwart mb-2">
          Gebruiksvoorwaarden voor vakbedrijven
        </h1>
        <p className="font-body text-[14px] text-warmgrijs mb-10">Laatst bijgewerkt: september 2026</p>

        <div className="font-body text-[15px] leading-[26px] text-warmzwart space-y-8">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">1. Over Neighbuur voor vakmensen</h2>
            <p>
              Neighbuur brengt vakbedrijven in contact met bewoners van nieuwbouwwijken. Door je als vakbedrijf te
              registreren ga je akkoord met deze voorwaarden, die aanvullend zijn op de algemene voorwaarden voor
              bewoners.
            </p>
            <InvullenVoorPublicatie>
              Neighbuur wordt aangeboden door [statutaire bedrijfsnaam] B.V., statutair gevestigd te [plaats],
              kantoorhoudend aan [adres], ingeschreven in het Handelsregister van de Kamer van Koophandel onder
              nummer [KvK-nummer].
            </InvullenVoorPublicatie>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">2. Registratie-eisen</h2>
            <p>
              Je registreert je met een geldig KvK-nummer en juiste bedrijfsgegevens. Je bent zelf verantwoordelijk
              voor het actueel houden van je bedrijfsnaam, specialismes, werkgebied en contactgegevens. Neighbuur kan
              gegevens (zoals KvK-nummer en verzekering) handmatig verifiëren en een profiel weigeren of blokkeren
              als gegevens onjuist blijken.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">3. Je profiel</h2>
            <p>
              De informatie op je profiel (bio, specialismes, werkfoto&apos;s, prijzen) moet waarheidsgetrouw zijn.
              Misleidende claims over ervaring, certificering of verzekering zijn niet toegestaan en kunnen leiden
              tot verwijdering van je profiel.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">4. Aanvragen en reactietijd</h2>
            <p>
              Bewoners verwachten een tijdige, professionele reactie op een aanvraag. Aanvragen die je niet kunt of
              wilt uitvoeren, wijs je netjes af in plaats van te negeren — dat houdt het platform betrouwbaar voor
              iedereen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">5. Limieten en Pro-abonnement</h2>
            <p>
              Een gratis profiel heeft een maandelijkse limiet op het aantal aanvragen dat je kunt accepteren. Met
              een Pro-abonnement (indien en zodra beschikbaar) vervalt deze limiet en krijg je extra zichtbaarheid.
              Prijzen en voorwaarden van een betaald abonnement worden apart gecommuniceerd vóórdat je ervoor
              betaalt.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">6. De uitvoering van je werk</h2>
            <p>
              Neighbuur is geen partij bij de overeenkomst tussen jou en de bewoner, en bemiddelt niet in prijs,
              planning of garantievoorwaarden. Jij bent en blijft zelf verantwoordelijk voor de kwaliteit van je
              werk, voor het naleven van geldende wet- en regelgeving (waaronder eventuele vergunningsplicht), en
              voor je eigen verzekering en aansprakelijkheid richting de klant. Neighbuur is niet aansprakelijk
              voor schade die voortvloeit uit de door jou geleverde diensten; deze beperking geldt niet voor
              schade die het gevolg is van opzet of bewuste roekeloosheid van Neighbuur zelf.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">7. Betalingen en commissie</h2>
            <p>
              Betalingen via het platform verlopen via onze betaaldienstverlener (Mollie). Neighbuur brengt een
              commissie in rekening op boekingen die via het platform worden afgerond; de hoogte hiervan
              communiceren we vooraf en kan per periode of categorie verschillen. Bij boekingen die je buiten het
              platform om afrondt met een bewoner die je via Neighbuur hebt gevonden, gelden de voorwaarden die op
              dat moment gecommuniceerd zijn.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">8. Reviews</h2>
            <p>
              Bewoners kunnen een review over jouw werk achterlaten; je mag daar één keer publiekelijk op reageren.
              Het is niet toegestaan om reviews te kopen, te ruilen, of bewoners onder druk te zetten om een review
              aan te passen of te verwijderen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">9. Collectieve deals</h2>
            <p>
              Bij deelname aan een collectieve wijkdeal gelden de voorwaarden (minimumaantal deelnemers, groepsprijs)
              zoals vermeld bij die specifieke deal. Neighbuur kan een deal aanpassen of intrekken als het minimum
              niet wordt gehaald.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">10. Schorsing en beëindiging</h2>
            <p>
              Bij herhaalde klachten, onjuiste gegevens, of het overtreden van deze voorwaarden kan Neighbuur je
              profiel tijdelijk of definitief van het platform verwijderen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">11. Wijzigingen</h2>
            <p>
              We kunnen deze voorwaarden aanpassen. Bij een belangrijke wijziging laten we dat weten via het
              platform of per e-mail.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">12. Privacy en cookies</h2>
            <p>
              Hoe we met persoonsgegevens omgaan (van jou en van bewoners) staat in onze{" "}
              <a href="/privacy" className="text-terracotta underline">
                privacyverklaring
              </a>
              . We gebruiken alleen functionele cookies, geen tracking- of advertentiecookies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">13. Toepasselijk recht en geschillen</h2>
            <p>
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen leggen we bij voorkeur eerst
              samen op, bijvoorbeeld via{" "}
              <a href="mailto:support@neighbuur.nl" className="text-terracotta underline">
                support@neighbuur.nl
              </a>
              . Komen we er niet uit, dan is de bevoegde Nederlandse rechter aangewezen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
