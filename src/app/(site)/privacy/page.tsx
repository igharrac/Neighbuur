import { InvullenVoorPublicatie } from "@/components/features/legal/InvullenVoorPublicatie";

export default function PrivacyPage() {
  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdbcf] px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#a73400]" />
          <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
            Privacy
          </span>
        </span>
        <h1 className="font-display font-bold text-[34px] sm:text-[42px] leading-[1.1] text-warmzwart mb-2">
          Privacyverklaring
        </h1>
        <p className="font-body text-[14px] text-warmgrijs mb-10">Laatst bijgewerkt: september 2026</p>

        <div className="font-body text-[15px] leading-[26px] text-warmzwart space-y-8">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">1. Wie is verantwoordelijk</h2>
            <InvullenVoorPublicatie>
              [Statutaire bedrijfsnaam] B.V., statutair gevestigd te [plaats], kantoorhoudend aan [adres],
              ingeschreven in het Handelsregister van de Kamer van Koophandel onder nummer [KvK-nummer]
              (&ldquo;Neighbuur&rdquo;, &ldquo;wij&rdquo;), is verwerkingsverantwoordelijke voor de persoonsgegevens
              die via dit platform worden verwerkt.
            </InvullenVoorPublicatie>
            <p>
              Vragen over deze privacyverklaring of over je gegevens? Mail naar{" "}
              <a href="mailto:privacy@neighbuur.nl" className="text-terracotta underline">
                privacy@neighbuur.nl
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">2. Welke gegevens we verzamelen</h2>
            <p className="mb-3">Wat we verzamelen hangt af van je rol en hoe je het platform gebruikt:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Iedereen:</b> naam, e-mailadres, telefoonnummer (optioneel), taalvoorkeur, profielfoto.
              </li>
              <li>
                <b>Bewoners:</b> je adres — opgezocht en bevestigd via de officiële BAG (Basisregistratie
                Adressen en Gebouwen), inclusief postcode, huisnummer, straat, plaats en coördinaten — en je
                woongeschiedenis op het platform.
              </li>
              <li>
                <b>Vakmensen:</b> bedrijfsnaam, KvK-nummer, verzekeringsdocumenten, werkfoto&apos;s, tarieven en
                werkgebied.
              </li>
              <li>
                <b>Gebruik van het platform:</b> boekingsaanvragen, berichten, reviews, notificatievoorkeuren en
                (indien ingeschakeld) een pushnotificatie-abonnement van je browser.
              </li>
              <li>
                <b>Betalingen:</b> transactiegegevens (bedrag, status) — je kaart- of bankgegevens zelf verwerken
                wij niet; dat gebeurt rechtstreeks bij onze betaaldienstverlener (Mollie).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">3. Waarvoor en op welke basis</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Uitvoering van de overeenkomst:</b> je account aanmaken en beheren, bewoners en vakmensen aan
                elkaar koppelen, boekingen en berichten mogelijk maken, betalingen verwerken.
              </li>
              <li>
                <b>Gerechtvaardigd belang:</b> het platform veilig en betrouwbaar houden (fraude- en
                misbruikpreventie, profielverificatie), en het platform verbeteren.
              </li>
              <li>
                <b>Toestemming:</b> pushnotificaties versturen naar je browser — je kunt dit op elk moment
                uitzetten via je notificatie-instellingen.
              </li>
              <li>
                <b>Wettelijke verplichting:</b> het bewaren van transactiegegevens voor de fiscale bewaarplicht.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">4. Met wie we gegevens delen</h2>
            <p className="mb-3">We verkopen je gegevens nooit. We delen ze wel met:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Verwerkers die het platform draaiend houden:</b> onze hostingpartij en database (Supabase, EU),
                onze e-maildienst voor transactionele mails (Resend), en onze betaaldienstverlener (Mollie).
              </li>
              <li>
                <b>Andere gebruikers, alleen voor zover nodig:</b> een vakman die je boekt ziet je naam,
                contactgegevens en boekingsdetails; buren in dezelfde community zien je naam, foto en reviews.
              </li>
              <li>
                <b>Overheidsinstanties</b>, uitsluitend als we daartoe wettelijk verplicht zijn.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">5. Hoe lang we gegevens bewaren</h2>
            <p>
              Zolang je account actief is, bewaren we je gegevens om het platform te laten werken. Verwijder je je
              account, dan worden je naam, e-mailadres, telefoonnummer en adres direct geanonimiseerd en kun je
              niet meer inloggen. Reviews of boekingen die voor andere gebruikers relevant blijven, tonen daarna
              &ldquo;Verwijderde gebruiker&rdquo; in plaats van je naam — dat is een bewuste keuze om de
              geschiedenis van andere gebruikers (bijvoorbeeld een reeds afgeronde boeking) intact te houden, zonder
              dat jij daarin nog herkenbaar bent. Transactiegegevens bewaren we zo lang als de fiscale
              bewaarplicht voorschrijft.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">6. Jouw rechten</h2>
            <p className="mb-3">
              Je hebt recht op inzage, correctie, verwijdering, beperking van de verwerking, bezwaar, en
              gegevensoverdraagbaarheid.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Naam, telefoon, taal en foto pas je zelf aan via{" "}
                <a href="/profiel" className="text-terracotta underline">
                  je profiel
                </a>
                .
              </li>
              <li>
                Account pauzeren of permanent verwijderen kan direct, ook via je profiel.
              </li>
              <li>
                Voor overige verzoeken (bijvoorbeeld een volledig overzicht van je gegevens) mail je naar{" "}
                <a href="mailto:privacy@neighbuur.nl" className="text-terracotta underline">
                  privacy@neighbuur.nl
                </a>
                .
              </li>
              <li>
                Ben je het niet eens met hoe we met je gegevens omgaan? Je kunt een klacht indienen bij de{" "}
                <a
                  href="https://www.autoriteitpersoonsgegevens.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta underline"
                >
                  Autoriteit Persoonsgegevens
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">7. Cookies</h2>
            <p>
              Neighbuur gebruikt uitsluitend functionele cookies: één om je taalvoorkeur te onthouden, en de
              cookies die nodig zijn om je ingelogd te houden. We gebruiken geen tracking- of
              advertentiecookies van onszelf of van derden, en daarom is er geen apart cookie-toestemmingsbanner
              nodig.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">8. Beveiliging</h2>
            <p>
              We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, waaronder
              rij-niveaubeveiliging in onze database (zodat gebruikers alleen bij hún eigen gegevens kunnen) en
              wachtwoordloze inlog via tijdelijke, persoonlijke inloglinks.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-warmzwart mb-2">9. Wijzigingen</h2>
            <p>
              We kunnen deze privacyverklaring aanpassen. Bij een belangrijke wijziging laten we dat weten via het
              platform of per e-mail.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
