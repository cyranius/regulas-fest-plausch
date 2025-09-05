import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Heart, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Lottie from 'lottie-react';

// Bestehende Bilder
import regulaHero from '@/assets/nonna.png';
import bgImage from '@/assets/bg.jpeg'; // Add the background image import
import bgVideo from '@/assets/bgvid.mp4'; // Add the background video import
import partyTitleImage from '@/assets/Generated Image August 28, 2025 - 9_09PM.png'; // New import for the party title image
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
    <div className="min-h-screen text-foreground relative">
      {/* Background Video with Pink Overlay */}
      <div className="fixed inset-0 z-[-1]">
        <img
          src={bgImage}
          alt="Background"
          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-1000"
          id="background-image"
        />
        <video
          id="background-video"
          className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-1000"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={(e) => {
            e.currentTarget.playbackRate = 0.5; // Set video speed to half
            e.currentTarget.style.opacity = '1';
            const img = document.getElementById('background-image');
            if (img) img.style.opacity = '0';
          }}
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-pink-600/80 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Hero Section with vibrant colors */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-12 sm:py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-[50%_50%] gap-10 lg:gap-12 items-center">
            {/* Hero Image (Mobile: oben, Desktop: rechts) */}
            <div className={`relative lg:order-2 lg:pr-20 ${mounted ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 delay-200`}>
              <div className="group relative rounded-2xl overflow-hidden shadow-[var(--celebration-shadow)]">
                <img
                  src={regulaHero}
                  alt="Regula feiert ihren 80. Geburtstag"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[500px] object-cover transform scale-x-[-1] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>

            {/* Text Content (Mobile: unten, Desktop: links) */}
            <div className={`space-y-6 lg:order-1 text-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="space-y-3">
                <img
                  src={partyTitleImage}
                  alt="Flower-Power Hippie Party 80 Jahre Regula"
                  className="w-full max-w-xl mx-auto h-auto"
                />
                <p className="text-xl sm:text-2xl text-foreground leading-relaxed">
                  Ich lade Dich herzlich zu meinem Geburtstag ein!
                </p>
                <p className="text-lg sm:text-xl text-hippie-yellow font-semibold">
                  Anmeldung bis zum 13.09.2025
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild variant="celebration" size="xl" className="group">
                  <Link to="/anmeldung" aria-label="Zur Anmeldung">
                    <Heart className="mr-2 h-6 w-6 group-hover:animate-celebration-bounce" />
                    Zur An/Abmeldung
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details kompakter, mit Hover-Glow */}
      <section className="py-12 sm:py-14 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 text-foreground">
              Feier-Details
            </h2>

            {/* Grid for medium screens and up */}
            <div className="hidden md:grid md:grid-cols-4 gap-5">
              <InfoCard
                icon={<Calendar className="h-10 w-10 text-hippie-green" />}
                title="Datum"
                line1="04.10.2025"
                line2="Samstag"
              />
              <InfoCard
                icon={<Clock className="h-10 w-10 text-hippie-green" />}
                title="Zeit"
                line1="16:30 Uhr"
                line2="Aperitif & Zusammenkunft"
              />
              <InfoCard
                icon={<MapPin className="h-10 w-10 text-hippie-green" />}
                title="Ort"
                line1="Kanu Club Romanshorn"
                line2="Seeweg 1, 8590 Romanshorn"
                extras={
                  <a
                    className="inline-flex items-center gap-1 text-lg text-hippie-yellow hover:underline mt-2"
                    href="https://maps.google.com/?q=Seeweg%201,%208590%20Romanshorn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Auf Karte öffnen <ExternalLink className="h-5 w-5" />
                  </a>
                }
              />
              <InfoCard
                icon={<Heart className="h-10 w-10 text-hippie-green" />}
                title="Kleiderordnung"
                line1="Hippie Flower Power"
              />
            </div>

            {/* Carousel for smaller screens */}
            <div className="md:hidden">
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  <CarouselItem className="pl-4 basis-4/5 sm:basis-1/2">
                    <InfoCard
                      icon={<Calendar className="h-10 w-10 text-hippie-green" />}
                      title="Datum"
                      line1="04.10.2025"
                      line2="Samstag"
                    />
                  </CarouselItem>
                  <CarouselItem className="pl-4 basis-4/5 sm:basis-1/2">
                    <InfoCard
                      icon={<Clock className="h-10 w-10 text-hippie-green" />}
                      title="Zeit"
                      line1="16:30 Uhr"
                      line2="Aperitif & Zusammenkunft"
                    />
                  </CarouselItem>
                  <CarouselItem className="pl-4 basis-4/5 sm:basis-1/2">
                    <InfoCard
                      icon={<MapPin className="h-10 w-10 text-hippie-green" />}
                      title="Ort"
                      line1="Kanu Club Romanshorn"
                      line2="Seeweg 1, 8590 Romanshorn"
                      extras={
                        <a
                          className="inline-flex items-center gap-1 text-lg text-hippie-yellow hover:underline mt-2"
                          href="https://maps.google.com/?q=Seeweg%201,%208590%20Romanshorn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Auf Karte öffnen <ExternalLink className="h-5 w-5" />
                        </a>
                      }
                    />
                  </CarouselItem>
                  <CarouselItem className="pl-4 basis-4/5 sm:basis-1/2">
                    <InfoCard
                      icon={<Heart className="h-10 w-10 text-hippie-green" />}
                      title="Kleiderordnung"
                      line1="Hippie Flower Power"
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden sm:inline-flex" />
                <CarouselNext className="hidden sm:inline-flex" />
              </Carousel>
            </div>
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
    <Card className="h-full text-center group transition-all duration-300 hover:shadow-[var(--celebration-shadow)] hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm border-hippie-yellow border-2">
      <CardContent className="pt-7 pb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-hippie-yellow/20 rounded-full mb-4 group-hover:bg-hippie-yellow/40 transition-colors">
          {icon}
        </div>
        <h3 className="text-2xl sm:text-3xl font-semibold mb-1.5 text-foreground">{title}</h3>
        <p className="text-xl sm:text-2xl text-foreground font-medium">{line1}</p>
        {line2 && <p className="text-lg text-foreground">{line2}</p>}
        {extras}
      </CardContent>
    </Card>
  );
}
