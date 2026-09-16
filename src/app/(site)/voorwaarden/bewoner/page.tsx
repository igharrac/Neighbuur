import { InvullenVoorPublicatie } from "@/components/features/legal/InvullenVoorPublicatie";

export default function VoorwaardenBewonerPage() {
  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C4DAB9] px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#385729]" />
          <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
            Voorwaarden — bewoners
          </span>
        </span>
        <h1 className="font-display font-bold text-[34px] sm:text-[42px] leading-[1.1] text-warmzwart mb-2">
          Gebruiksvoorwaarden voor bewoners
        </h1>
        <p className="font-body text-[14px] text-warmgrijs mb-10">Laatst bijgewerkt: september 2026</p>

        <div className="font-body text-[15px] leading-[26px] text-warmzwart space-y-8">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">1. Over Neighbuur</h2>
            <p>
              Neighbuur is een platform dat bewoners van nieuwbouwwijken verbindt met lokale vakmensen en met
              elkaar, via wijk- en community-pagina&apos;s. Door een account aan te maken ga je akkoord met deze
              voorwaarden.
            </p>
            <InvullenVoorPublicatie>
              Neighbuur wordt aangeboden door [statutaire bedrijfsnaam] B.V., statutair gevestigd te [plaats],
              kantoorhoudend aan [adres], ingeschreven in het Handelsregister van de Kamer van Koophandel onder
              nummer [KvK-nummer].
            </InvullenVoorPublicatie>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">2. Je account</h2>
            <p>
              Je bent zelf verantwoordelijk voor de juistheid van de gegevens die je invult (naam, adres, wijk) en
              voor het geheimhouden van de toegang tot je account. Eén account is bedoeld voor één persoon. Neighbuur
              mag een account weigeren of blokkeren bij vermoeden van misbruik of onjuiste gegevens.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">3. Boekingen bij vakmensen</h2>
            <p>
              Neighbuur brengt bewoners en vakmensen bij elkaar, maar is zelf geen partij bij de overeenkomst die
              ontstaat tussen jou en een vakman. Afspraken over werk, prijs, planning en garantie maak je rechtstreeks
              met de vakman. Neighbuur is niet aansprakelijk voor de kwaliteit, tijdigheid of uitvoering van het
              geboekte werk.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">4. Reviews</h2>
            <p>
              Je mag alleen een review schrijven over werk dat daadwerkelijk is uitgevoerd. Reviews moeten eerlijk en
              op waarheid gebaseerd zijn. Beledigende, discriminerende of duidelijk misleidende reviews kunnen worden
              verwijderd.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">5. Je community</h2>
            <p>
              Binnen een wijk- of community-pagina verwachten we respectvol gedrag naar buren en vakmensen.
              Commerciële spam, ongevraagde promotie, of het delen van persoonsgegevens van anderen zonder
              toestemming is niet toegestaan.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">6. Aansprakelijkheid</h2>
            <p>
              Neighbuur spant zich in om het platform betrouwbaar en beschikbaar te houden, maar geeft geen garantie
              dat de dienst altijd zonder onderbreking of fouten werkt. Voor zover wettelijk toegestaan is Neighbuur
              niet aansprakelijk voor indirecte schade die voortvloeit uit het gebruik van het platform. Deze
              beperking geldt niet voor schade die het gevolg is van opzet of bewuste roekeloosheid van Neighbuur.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">7. Je account opzeggen</h2>
            <p>
              Je kunt je account op elk moment laten verwijderen via je profielinstellingen of door contact met ons
              op te nemen. Bij ernstig of herhaald misbruik kan Neighbuur je account ook zelf beëindigen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">8. Wijzigingen</h2>
            <p>
              We kunnen deze voorwaarden aanpassen. Bij een belangrijke wijziging laten we dat weten via het
              platform of per e-mail. Blijf je het platform gebruiken na een wijziging, dan geldt dat als
              akkoord met de nieuwe versie.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">9. Privacy en cookies</h2>
            <p>
              Hoe we met je persoonsgegevens omgaan staat in onze{" "}
              <a href="/privacy" className="text-sage underline">
                privacyverklaring
              </a>
              . We gebruiken alleen functionele cookies, geen tracking- of advertentiecookies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">10. Toepasselijk recht en geschillen</h2>
            <p>
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen leggen we bij voorkeur eerst
              samen op, bijvoorbeeld via{" "}
              <a href="mailto:support@neighbuur.nl" className="text-sage underline">
                support@neighbuur.nl
              </a>
              . Komen we er niet uit, dan is de bevoegde Nederlandse rechter aangewezen — tenzij dwingend
              consumentenrecht een andere rechter voorschrijft.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
