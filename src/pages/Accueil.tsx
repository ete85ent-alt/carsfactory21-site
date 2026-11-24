import { vers, DEMO } from '../vers'
import { aCompleter, montrer, Texte } from '../aCompleter'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Devis from '../components/Devis'
import Acces from '../components/Acces'
import StatutOuverture from '../components/Statut'
import { EncartVehicule } from '../components/MonVehicule'
import Rendezvous from '../components/Rendezvous'
import { Container, Ico, Photo, TitreSection, btnClair, btnRouge, type NomPhoto } from '../components/ui'
import { site, accueil } from '../config'
import { PRESTATIONS, type PagePrestation } from './services'

const rempli = (v: string) => v !== '' && !aCompleter(v)

/** Présentation du garage (rubrique « Qui sommes-nous »), texte fourni par le garage. La rubrique « Avis clients » est retirée pour l'instant (voir l'historique git pour la remettre). */
const PRESENTATION = 'Fort de plus de 20 ans d’expérience en carrosserie et passionné par l’automobile, j’ai développé mon savoir-faire au sein de grands groupes tels qu’Airbus et Peugeot, ainsi qu’en tant qu’indépendant. Aujourd’hui, je mets mon savoir-faire au service de mes clients avec une exigence constante de qualité et de satisfaction.'

/** Données structurées pour Google : un garage (AutoRepair), seulement avec les informations déjà remplies. */
function donneesGarage() {
  const d: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'AutoRepair', '@id': `${site.siteUrl}/#garage`,
    name: site.nom, url: `${site.siteUrl}/`, image: `${site.siteUrl}/photos/atelier-1920.webp`,
    description: 'Carrosserie, peinture, covering, réparation après sinistre, mécanique, entretien, diagnostic, dépannage 24 h/24, flottes de véhicules d’entreprise et remise en état avant retour de leasing, à Saint-Apollinaire, près de Dijon.',
    telephone: site.telephoneLien,
    geo: { '@type': 'GeoCoordinates', latitude: accueil.lat, longitude: accueil.lon },
    address: { '@type': 'PostalAddress', streetAddress: site.adresse.rue, postalCode: site.adresse.codePostal, addressLocality: site.adresse.ville, addressRegion: 'Bourgogne-Franche-Comté', addressCountry: 'FR' },
    openingHoursSpecification: site.horairesGoogle.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.jours, opens: h.ouverture, closes: h.fermeture })),
    areaServed: [...site.zone.map((name) => ({ '@type': 'City', name })), { '@type': 'AdministrativeArea', name: site.adresse.departement }],
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Prestations', itemListElement: PRESTATIONS.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: p.nom, url: site.siteUrl + p.chemin } })) },
  }
  if (rempli(site.email)) d.email = site.email
  return d
}

/** La vidéo de présentation, décrite pour Google (peut apparaître dans les résultats vidéo). */
const VIDEO = {
  '@context': 'https://schema.org', '@type': 'VideoObject',
  name: 'Cars Factory 21 : le garage en une minute',
  description: 'Carrosserie, peinture, covering, mécanique, diagnostic, flotte d’entreprise, retour de leasing, lavage, franchise prise en charge jusqu’à 450 € selon les dossiers, et deux façons de nous confier votre voiture : dépannage 24 h/24, ou dépôt au garage à Saint-Apollinaire. En dessin animé.',
  thumbnailUrl: `${site.siteUrl}/videos/presentation-garage.webp`,
  contentUrl: `${site.siteUrl}/videos/presentation-garage.mp4`,
  uploadDate: '2026-11-24',
  duration: 'PT67S',
  publisher: { '@id': `${site.siteUrl}/#garage` },
}

/** Tuile de prestation : ligne compacte sur téléphone (vignette + texte), carte avec photo sur ordinateur. */
function Tuile({ p }: { p: PagePrestation }) {
  return (
    <a href={vers(p.chemin)} className="group flex min-h-[92px] overflow-hidden rounded-xl border border-ligne bg-white text-noir no-underline shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:flex-col">
      <Photo nom={(p.photo ?? p.icone) as NomPhoto} alt="" sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 112px" className="w-28 shrink-0 sm:aspect-[16/10] sm:w-auto" />
      <div className="flex flex-1 items-center gap-3 p-3.5 sm:flex-col sm:items-start sm:gap-1.5 sm:p-4">
        <div className="flex-1">
          <h3 className="flex items-center gap-2 text-[21px] font-bold uppercase leading-none sm:text-[24px]"><Ico nom={p.icone} taille={20} className="hidden shrink-0 text-rouge sm:block" />{p.nom}</h3>
          <p className="mt-1 text-[14px] leading-snug text-gris">{p.resume}</p>
        </div>
        <Ico nom="droite" taille={20} className="shrink-0 text-rouge transition-transform group-hover:translate-x-1 sm:hidden" />
        <span className="hidden items-center gap-1 pt-1 text-[14px] font-semibold text-rouge sm:flex">Voir la prestation <Ico nom="fleche" taille={16} /></span>
      </div>
    </a>
  )
}

/** Points forts du garage, mis en avant juste sous l'accroche. */
const POINTS_FORTS: { icone: Parameters<typeof Ico>[0]['nom']; titre: string; texte: string; lien: string }[] = [
  { icone: 'euro', titre: 'Franchise prise en charge', texte: 'Jusqu’à 450 € de votre franchise pris en charge, selon les dossiers.', lien: '/reparation-apres-sinistre' },
  { icone: 'cle', titre: 'Clé en main', texte: 'Vous nous confiez la voiture, on s’occupe de tout : devis, assurance, réparation, restitution.', lien: '/#devis' },
  { icone: 'flotte', titre: 'Entreprises', texte: 'On s’occupe de votre flotte de véhicules : mécanique, suivi des réparations, entretien.', lien: '/entretien-flotte-entreprise' },
  { icone: 'leasing', titre: 'Retour de leasing', texte: 'Les réparations faites avant de rendre la voiture au loueur.', lien: '/reparation-retour-leasing' },
  { icone: 'depannage', titre: 'Dépannage 24 h/24', texte: 'Panne ou accident : on vient vous chercher, jour et nuit, 7 j/7.', lien: '/#depannage' },
  { icone: 'coche', titre: '20 ans d’expérience', texte: 'Un carrossier formé chez Airbus et Peugeot, exigeant sur la qualité.', lien: '/#garage' },
]

const ETAPES: [string, string][] = [
  ['Devis', 'Par téléphone, au garage ou en ligne avec des photos.'],
  ['Dépôt', 'Au garage, à Saint-Apollinaire, du mardi au samedi.'],
  ['Réparation', 'À l’atelier, seulement les travaux validés.'],
  ['Restitution', 'Vous récupérez votre voiture, travaux expliqués.'],
]

const FAQ: [string, string][] = [
  ['Puis-je obtenir un devis sans venir au garage ?', 'Oui. Remplissez le formulaire de devis en ajoutant des photos des dégâts et le modèle de votre voiture : le garage vous recontacte pour une première estimation.'],
  ['Où dois-je déposer ma voiture ?', 'Au garage, 6 rue de Bastogne à Saint-Apollinaire : tout se fait sur place, près des commerces et des transports en commun.'],
  ['Quels sont les horaires du garage ?', 'Le garage est ouvert du mardi au samedi, de 9 h à 19 h. Il est fermé le lundi et le dimanche. Le dépannage fonctionne 24 h/24, 7 j/7.'],
  ['Le garage s’occupe-t-il des démarches avec mon assurance ?', 'Le garage vous aide à préparer votre dossier et à présenter le véhicule à l’expert si votre assurance en mandate un.'],
  ['Prenez-vous en charge la franchise ?', 'Selon les dossiers, le garage peut prendre en charge votre franchise jusqu’à 450 €. Demandez-le lors de votre devis.'],
  ['Vous occupez-vous des véhicules d’entreprise ?', 'Oui : on s’occupe de votre flotte de véhicules (mécanique, suivi des réparations, entretien, dépannage), avec un seul interlocuteur, ainsi que la remise en état avant le retour de leasing.'],
  ['Faut-il prendre rendez-vous ?', 'Non : on vous accueille sans rendez-vous, du mardi au samedi de 9 h à 19 h, au garage à Saint-Apollinaire. Vous pouvez aussi réserver un créneau en ligne si vous préférez.'],
]

export default function Accueil() {
  const appeler = `tel:${site.telephoneLien}`
  const depannage = PRESTATIONS.find((p) => p.chemin === '/depannage-auto')!
  const tuileAction = 'flex min-h-[88px] flex-col justify-center gap-1 rounded-xl bg-white p-4 text-noir no-underline shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 sm:min-h-[104px] sm:p-5'
  return (
    <>
      <Header />
      <main>
        {/* ── Accroche courte : l'essentiel tient dans le premier écran du téléphone ── */}
        <section className="relative isolate overflow-hidden bg-noir text-white">
          <Photo nom="atelier" alt="L’atelier Cars Factory 21" prioritaire mention={false} className="absolute inset-0 -z-10 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-noir via-noir/85 to-noir/35" />
          {/* Téléphone et tablette : statut, titre, vidéo, puis texte (le bloc de texte « s'efface » pour que la vidéo s'intercale) ;
              ordinateur : texte à gauche, vidéo à droite */}
          <Container className="grid items-center gap-4 pb-24 pt-5 md:gap-6 md:pb-32 md:pt-14 lg:grid-cols-12 lg:gap-8">
            <div className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
              <div className="order-1"><StatutOuverture clair /></div>
              <div className="order-2 flex max-w-[820px] flex-col gap-2">
                <p className="font-titre text-[15px] font-bold uppercase tracking-wide text-rouge-vif md:text-[18px]">Notre engagement</p>
                <h1 className="text-[28px] font-bold uppercase leading-[1.02] md:text-[44px]">
                  Une réparation de qualité, un accompagnement clé en main et <span className="text-rouge-vif">jusqu’à 450 € de franchise</span> pris en charge
                </h1>
                <p className="text-[14px] text-white/70 md:text-[15px]">Selon les dossiers.</p>
              </div>
              <div className="order-5 hidden gap-3 sm:flex">
                <a href="#devis" className={btnRouge}>Demander un devis</a>
                <a href={appeler} className={btnClair}><Ico nom="telephone" taille={18} />{site.telephone}</a>
              </div>
            </div>
            {/* ── Vidéo de présentation, dès le premier écran (chargée seulement au clic sur Lecture) ── */}
            <figure id="video" aria-labelledby="titre-video" className="order-3 m-0 scroll-mt-32 lg:order-none lg:col-span-7">
              <video controls preload="none" playsInline poster={vers('/videos/presentation-garage.webp')} width={1280} height={720}
                className="aspect-video w-full rounded-lg border border-white/15 bg-acier shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                aria-label="Vidéo de présentation des services de Cars Factory 21, en dessin animé">
                <source src={vers('/videos/presentation-garage.mp4')} type="video/mp4" />
                Votre navigateur ne lit pas cette vidéo. <a href={vers('/videos/presentation-garage.mp4')} className="text-rouge-vif">Télécharger la vidéo</a>.
              </video>
              <figcaption className="mt-2 flex items-baseline justify-between gap-3 text-[13px] text-white/70">
                <span id="titre-video"><Ico nom="lecture" taille={14} className="mr-1 inline align-[-2px] text-rouge-vif" />Le garage en une minute, en dessin animé</span>
                <span className="shrink-0 text-[11px] text-white/45">Illustrations non contractuelles</span>
              </figcaption>
            </figure>
          </Container>

        </section>

        {/* ── Tuiles d'action, posées sur la photo ── */}
        <section aria-label="Que voulez-vous faire ?" className="relative z-10 -mt-16 md:-mt-20">
          <Container className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <a href="#devis" className={tuileAction}>
              <Ico nom="devis" taille={28} className="text-rouge" /><span className="text-[17px] font-bold leading-tight">Demander un devis</span><span className="hidden text-[13px] text-gris sm:block">Avec des photos, sans vous déplacer</span>
            </a>
            <a href={appeler} className={`${tuileAction} !bg-rouge !px-3 !text-white sm:!px-5`}>
              <Ico nom="depannage" taille={28} /><span className="whitespace-nowrap text-[clamp(12px,3.8vw,17px)] font-bold leading-tight tracking-tight sm:tracking-normal">Dépannage 24 h/24</span><span className="text-[13px] text-white/85">{site.telephone}</span>
            </a>
            <a href="#acces" className={tuileAction}>
              <Ico nom="lieu" taille={28} className="text-rouge" /><span className="text-[17px] font-bold leading-tight">Notre adresse</span><span className="hidden text-[13px] text-gris sm:block">Plan · horaires</span>
            </a>
            <a href="#rdv" className={tuileAction}>
              <Ico nom="calendrier" taille={28} className="text-rouge" /><span className="text-[17px] font-bold leading-tight">Prendre rendez-vous</span><span className="hidden text-[13px] text-gris sm:block">Choisissez le jour et l’heure</span>
            </a>
          </Container>
        </section>

        {/* ── Points forts, juste sous les tuiles d'action ── */}
        <section id="points-forts" aria-labelledby="titre-points-forts" className="scroll-mt-32">
          <Container className="flex flex-col gap-4 pt-10 md:gap-6 md:pt-16">
            <h2 id="titre-points-forts" className="text-[30px] font-bold uppercase leading-none md:text-[44px]">Nos points forts</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {POINTS_FORTS.map((f) => (
                <li key={f.titre}>
                  <a href={vers(f.lien)} className="flex h-full items-start gap-3.5 rounded-xl border border-ligne border-t-[3px] border-t-rouge bg-white p-4 text-noir no-underline transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:p-5">
                    <Ico nom={f.icone} taille={28} className="mt-0.5 shrink-0 text-rouge" />
                    <span className="flex flex-col gap-1">
                      <span className="font-titre text-[21px] font-bold uppercase leading-none md:text-[23px]">{f.titre}</span>
                      <span className="text-[14px] leading-snug text-gris md:text-[15px]">{f.texte}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ── Ils nous font confiance : logos (ou noms) des entreprises clientes, puis photos ;
             les emplacements libres n'apparaissent que sur la démonstration ── */}
        {(DEMO || site.references.some((r) => r.nom)) && (
          <section id="references" aria-labelledby="titre-references" className="scroll-mt-32">
            <Container className="flex flex-col gap-4 pt-10 md:gap-6 md:pt-16">
              <h2 id="titre-references" className="text-[30px] font-bold uppercase leading-none md:text-[44px]">Ils nous font confiance</h2>
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {site.references.filter((r) => DEMO || r.nom).map((r, i) => (
                  <li key={r.nom || `libre-${i}`} className={`flex h-24 items-center justify-center rounded-xl p-4 md:h-28 ${r.nom ? 'border border-ligne bg-white' : 'border-2 border-dashed border-ligne bg-fond'}`}>
                    {r.logo ? <img src={vers(r.logo)} alt={r.nom} loading="lazy" className="max-h-full max-w-full object-contain" />
                      : r.nom ? <span className="font-titre text-[28px] font-bold uppercase tracking-wide text-noir md:text-[34px]">{r.nom}</span>
                      : <span className="text-[13px] text-gris">Logo à ajouter</span>}
                  </li>
                ))}
              </ul>
              {(DEMO || site.photosReferences.some(([f]) => f)) && (
                <ul className="grid gap-3 sm:grid-cols-3">
                  {site.photosReferences.filter(([f]) => DEMO || f).map(([f, legende], i) => (
                    <li key={f || `photo-${i}`}>
                      {f ? (
                        <figure className="m-0 overflow-hidden rounded-xl border border-ligne">
                          <img src={vers(f)} alt={legende} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                          {legende && <figcaption className="px-3 py-2 text-[13px] text-gris">{legende}</figcaption>}
                        </figure>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-ligne bg-fond text-[13px] text-gris">Photo à ajouter</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </section>
        )}

        {/* ── Mon parcours (qui sommes-nous), juste sous l'accroche ── */}
        {montrer(PRESENTATION) && (
          <section id="garage" className="scroll-mt-32">
            <Container className="grid items-center gap-6 py-10 md:gap-10 md:py-16 lg:grid-cols-2">
              <Photo nom="garage" alt="Véhicule en préparation de carrosserie à l’atelier Cars Factory 21" sizes="(min-width: 1024px) 560px, 100vw" className="hidden aspect-[4/3] rounded-lg lg:block" />
              <div className="flex flex-col gap-5">
                <TitreSection label="Mon parcours" texte={<Texte t={PRESENTATION} />}
                  titre={<span className="block text-[28px] leading-[1.02] md:text-[40px]">Plus de 20 ans d’expertise, une passion intacte et un seul objectif : <span className="text-rouge">votre satisfaction</span></span>} />
                <a href="#acces" className="self-start font-semibold text-rouge">Voir notre adresse →</a>
              </div>
            </Container>
          </section>
        )}

        {/* ── Prestations ── */}
        <section id="prestations" className="scroll-mt-32">
          <Container className="flex flex-col gap-8 py-10 md:gap-10 md:py-16">
            <div id="carrosserie" className="flex scroll-mt-32 flex-col gap-4">
              <h2 className="flex items-baseline justify-between gap-3 text-[30px] font-bold uppercase leading-none md:text-[44px]">Carrosserie</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PRESTATIONS.filter((p) => p.famille === 'Carrosserie').map((p) => <Tuile key={p.chemin} p={p} />)}
              </div>
            </div>
            <div id="mecanique" className="flex scroll-mt-32 flex-col gap-4">
              <h2 className="text-[30px] font-bold uppercase leading-none md:text-[44px]">Mécanique et services</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PRESTATIONS.filter((p) => p.famille !== 'Carrosserie').map((p) => <Tuile key={p.chemin} p={p} />)}
              </div>
            </div>
          </Container>
        </section>

        <Rendezvous />

        <div className="h-8 md:h-12" />
        <EncartVehicule />

        <div className="h-10 md:h-16" />
        <Acces />

        {/* ── Dépannage 24 h/24 ── */}
        <section id="depannage" className="relative isolate scroll-mt-32 overflow-hidden bg-rouge text-white">
          <Container className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">Jour et nuit, 7 jours sur 7</p>
              <h2 className="text-[40px] font-bold uppercase leading-[0.92] md:text-[64px]">En panne ? On vient vous chercher.</h2>
              <p className="max-w-[520px] text-[16px] leading-relaxed text-white/85 md:text-[17px]">{depannage.accroche}</p>
              <a href={appeler} className="inline-flex min-h-14 items-center justify-center gap-2 self-stretch rounded-md bg-white px-5 py-3 text-[19px] font-bold text-rouge no-underline hover:bg-white/90 sm:self-start"><Ico nom="telephone" taille={22} />{site.telephone}</a>
            </div>
            <Photo nom="depannage" alt="Voiture chargée sur une dépanneuse" sizes="(min-width: 1024px) 560px, 100vw" className="hidden aspect-[16/10] rounded-lg sm:block" />
          </Container>
        </section>

        {/* ── Aussi au garage ── */}
        <section id="autres" className="scroll-mt-32">
          <Container className="flex flex-col gap-4 py-10 md:py-16">
            <h2 className="text-[30px] font-bold uppercase leading-none md:text-[44px]">Aussi au garage</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {site.autresServices.map(([t, d, photo]) => (
                <a key={t} href={appeler} className="group flex min-h-[92px] overflow-hidden rounded-xl border border-ligne bg-white text-noir no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <Photo nom={photo} alt="" sizes="(min-width: 768px) 220px, 112px" className="w-28 shrink-0 md:w-52" />
                  <div className="flex flex-1 items-center gap-3 p-3.5 md:p-5">
                    <div className="flex-1"><h3 className="text-[21px] font-bold uppercase leading-none md:text-[26px]">{t}</h3><p className="mt-1 text-[14px] leading-snug text-gris">{d}</p><p className="mt-1 text-[13px] font-semibold text-rouge">Se renseigner par téléphone</p></div>
                    <Ico nom="telephone" taille={20} className="shrink-0 text-rouge" />
                  </div>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Comment ça se passe (compact) ── */}
        <section className="bg-fond">
          <Container className="flex flex-col gap-6 py-10 md:py-16">
            <h2 className="text-[30px] font-bold uppercase leading-none md:text-[44px]">Comment ça se passe</h2>
            <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {ETAPES.map(([t, d], i) => (
                <li key={t} className="flex flex-col gap-1 rounded-xl bg-white p-4 md:p-5">
                  <span className="font-titre text-[34px] font-bold leading-none text-rouge md:text-[44px]">0{i + 1}</span>
                  <p className="font-titre text-[21px] font-bold uppercase leading-none md:text-[24px]">{t}</p>
                  <p className="text-[13px] leading-snug text-gris md:text-[15px]">{d}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ── Questions fréquentes ── */}
        <section>
          <Container className="grid gap-6 py-10 md:gap-10 md:py-16 lg:grid-cols-12">
            <h2 className="text-[30px] font-bold uppercase leading-none md:text-[44px] lg:col-span-4">Questions fréquentes</h2>
            <div className="flex flex-col divide-y divide-ligne border-y border-ligne lg:col-span-8">
              {FAQ.filter(([, r]) => montrer(r)).map(([q, r]) => (
                <details key={q} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[17px] font-semibold">
                    {q}<span className="text-[26px] text-rouge transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="pb-4 text-[16px] leading-relaxed text-gris"><Texte t={r} /></p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Zone ── */}
        <section aria-labelledby="titre-zone" className="bg-noir text-white">
          <Container className="flex flex-col gap-4 py-10">
            <h2 id="titre-zone" className="text-[28px] font-bold uppercase leading-none md:text-[40px]">À deux pas de Dijon</h2>
            <p className="max-w-[720px] text-[15px] text-white/70">Le garage de {accueil.ville} reçoit les conducteurs de toute l’agglomération et des communes voisines.</p>
            <ul className="flex flex-wrap gap-2">
              {site.zone.map((v) => <li key={v} className="rounded-full border border-white/20 px-3 py-1.5 text-[14px] text-white/85">{v}</li>)}
            </ul>
          </Container>
        </section>

        <Devis />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesGarage()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(VIDEO) }} />
    </>
  )
}
