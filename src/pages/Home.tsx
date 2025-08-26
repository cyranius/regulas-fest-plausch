import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Heart, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Bestehende Bilder
import regulaHero from '@/assets/WhatsApp Image 2025-08-26 at 14.05.31.jpeg';
import kanuClub from '@/assets/kanuclub.jpeg';

// Neue Bilder (füge sie deinem /assets Ordner hinzu, Dateinamen beliebig)
import whatsAppImage1 from '@/assets/WhatsApp Image 2025-08-26 at 14.05.30.jpeg';
import whatsAppImage2 from '@/assets/WhatsApp Image 2025-08-26 at 14.05.30 (1).jpeg';
import whatsAppImage3 from '@/assets/WhatsApp Image 2025-08-26 at 14.05.30 (2).jpeg';
import whatsAppImage4 from '@/assets/WhatsApp Image 2025-08-26 at 14.05.31.jpeg';
import whatsAppImage5 from '@/assets/WhatsApp Image 2025-08-26 at 14.05.31 (1).jpeg';
import whatsAppImage6 from '@/assets/WhatsApp Image 2025-08-26 at 14.06.03.jpeg';
import whatsAppImage7 from '@/assets/WhatsApp Image 2025-08-26 at 14.06.14.jpeg';

const EVENT_ISO = '2025-10-04T17:00:00+02:00'; // 04.10.2025 17:00 (CEST)

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sticky CTA erst einblenden, wenn man am Hero vorbei ist
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sticky CTA */}
      <StickyCta visible={showStickyCta} />

      {/* Hero Section mit subtiler Parallax-Illusion und weicher Gradient-Animation */}
      <section className="relative overflow-hidden bg-[var(--soft-gradient)]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(800px_400px_at_20%_10%,_rgba(255,255,255,0.15),_transparent_60%),radial-gradient(600px_300px_at_80%_90%,_rgba(255,255,255,0.08),_transparent_60%)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Hero Image (Mobile: oben, Desktop: rechts) */}
            <div className={`relative lg:order-2 ${mounted ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 delay-200`}>
              <div className="group relative rounded-2xl overflow-hidden shadow-[var(--celebration-shadow)]">
                <img
                  src={regulaHero}
                  alt="Regula feiert ihren 80. Geburtstag"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[500px] object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>

            {/* Text Content (Mobile: unten, Desktop: links) */}
            <div className={`space-y-6 lg:order-1 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                  Regulas
                  <span className="block text-primary [text-shadow:0_8px_30px_rgba(0,0,0,0.25)]">
                    80. Geburtstag
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Wir feiern gemeinsam einen besonderen Meilenstein!
                  Komm und lass uns diesen wundervollen Tag zusammen verbringen.
                </p>
              </div>

              <CountdownBar targetISO={EVENT_ISO} />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button asChild variant="celebration" size="lg" className="group">
                  <Link to="/anmeldung" aria-label="Zur Anmeldung">
                    <Heart className="mr-2 h-5 w-5 group-hover:animate-celebration-bounce" />
                    Zur Anmeldung
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="backdrop-blur-sm">
                  <Link to="/uebersicht">Wer bringt was?</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details kompakter, mit Hover-Glow */}
      <section className="py-12 sm:py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 text-foreground">
              Feier-Details
            </h2>

            <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
              <InfoCard
                icon={<Calendar className="h-8 w-8 text-primary" />}
                title="Datum"
                line1="04.10.2025"
                line2="Samstag"
              />
              <InfoCard
                icon={<Clock className="h-8 w-8 text-primary" />}
                title="Zeit"
                line1="17:00 Uhr"
                line2="Aperitif & Zusammenkunft"
              />
              <InfoCard
                icon={<MapPin className="h-8 w-8 text-primary" />}
                title="Ort"
                line1="Kanu Club Romanshorn"
                line2="Seeweg 1, 8590 Romanshorn"
                extras={
                  <a
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    href="https://maps.google.com/?q=Seeweg%201,%208590%20Romanshorn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Auf Karte öffnen <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location Section mit subtiler Zoom-Interaktion */}
      <section className="py-12 sm:py-14 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-foreground">
              Der wunderschöne Austragungsort
            </h2>
            <figure className="rounded-2xl overflow-hidden shadow-[var(--gentle-shadow)] group">
              <img
                src={kanuClub}
                alt="Kanu Club Romanshorn am Bodensee"
                className="w-full h-[240px] sm:h-[320px] lg:h-[400px] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
            </figure>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Direkt am Bodensee gelegen, bietet der Kanu Club Romanshorn die perfekte Atmosphäre für unsere Feier.
              Mit Blick aufs Wasser und gemütlicher Vereinsatmosphäre verbringen wir einen unvergesslichen Abend.
            </p>
          </div>
        </div>
      </section>

      {/* Neuer Foto-Slider (touch & keyboard friendly) */}
      <PhotoSlider
        title="Einblicke & Vorfreude"
        images={[
          { src: whatsAppImage1, alt: 'WhatsApp Image 1' },
          { src: whatsAppImage2, alt: 'WhatsApp Image 2' },
          { src: whatsAppImage3, alt: 'WhatsApp Image 3' },
          { src: whatsAppImage4, alt: 'WhatsApp Image 4' },
          { src: whatsAppImage5, alt: 'WhatsApp Image 5' },
          { src: whatsAppImage6, alt: 'WhatsApp Image 6' },
          { src: whatsAppImage7, alt: 'WhatsApp Image 7' },
        ]}
      />

      {/* Finale CTA */}
      <section className="py-12 sm:py-16 bg-[var(--soft-gradient)]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Schön, dass du kommst!
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Hilf uns bei der Planung und melde dich jetzt an. Zusammen machen wir diesen Tag unvergesslich.
            </p>
            <Button asChild variant="celebration" size="xl" className="group">
              <Link to="/anmeldung">
                <Heart className="mr-3 h-6 w-6 group-hover:animate-celebration-bounce" />
                Jetzt anmelden
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

/* ---------------------- Unter-Komponenten ---------------------- */

function InfoCard({
  icon,
  title,
  line1,
  line2,
  extras,
}: {
  icon: React.ReactNode;
  title: string;
  line1: string;
  line2?: string;
  extras?: React.ReactNode;
}) {
  return (
    <Card className="text-center group transition-all duration-300 hover:shadow-[var(--celebration-shadow)] hover:-translate-y-0.5">
      <CardContent className="pt-7 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-1.5 text-foreground">{title}</h3>
        <p className="text-base sm:text-lg text-muted-foreground font-medium">{line1}</p>
        {line2 && <p className="text-sm text-muted-foreground">{line2}</p>}
        {extras}
      </CardContent>
    </Card>
  );
}

function CountdownBar({ targetISO }: { targetISO: string }) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes } = useMemo(() => {
    const target = new Date(targetISO).getTime();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days: d, hours: h, minutes: m };
  }, [now, targetISO]);

  return (
    <div
      className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm p-3 sm:p-4 shadow-sm"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Countdown bis zur Feier
        </span>
        <span className="text-base sm:text-lg font-semibold text-primary">
          {days} Tage · {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')} Std.
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
        {/* Einfacher animierter Glanz */}
        <div className="h-full w-1/2 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-[shimmer_2.2s_linear_infinite]" />
      </div>
    </div>
  );
}

function PhotoSlider({
  title,
  images,
}: {
  title: string;
  images: { src: string; alt: string }[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-12 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{title}</h2>
            <div className="hidden sm:flex items-center gap-2">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-muted transition-colors"
                onClick={() => scrollBy('left')}
                aria-label="Vorheriges Foto"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-muted transition-colors"
                onClick={() => scrollBy('right')}
                aria-label="Nächstes Foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Fade-Edges für dezente Tiefe */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent" />

            <div
              ref={scrollerRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* scrollbar verstecken (WebKit) */}
              <style>
                {`.hide-scrollbar::-webkit-scrollbar{ display: none; }`}
              </style>

              {images.map((img, i) => (
                <figure
                  key={i}
                  className="snap-start shrink-0 basis-[80%] sm:basis-[46%] lg:basis-[32%] rounded-2xl overflow-hidden bg-muted/40 border border-border/60 group"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-[220px] sm:h-[260px] lg:h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    loading={i > 1 ? 'lazy' : 'eager'}
                  />
                </figure>
              ))}
            </div>

            {/* Mobile Pfeile */}
            <div className="mt-4 sm:hidden flex justify-center gap-3">
              <button
                className="inline-flex h-10 px-3 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-muted transition-colors"
                onClick={() => scrollBy('left')}
                aria-label="Vorheriges Foto"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="inline-flex h-10 px-3 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-muted transition-colors"
                onClick={() => scrollBy('right')}
                aria-label="Nächstes Foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StickyCta({ visible }: { visible: boolean }) {
  return (
    <div
      className={`sm:hidden fixed inset-x-3 bottom-3 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      <div className="rounded-2xl border border-border/60 bg-background/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Bist du dabei?</span>
          </div>
          <Button asChild variant="celebration" size="sm" className="px-3">
            <Link to="/anmeldung" aria-label="Jetzt anmelden">
              Jetzt anmelden
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
