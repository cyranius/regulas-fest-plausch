import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import regulaHero from '@/assets/regula-hero.jpg';
import kanuClub from '@/assets/kanu-club-romanshorn.jpg';

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--soft-gradient)]">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`space-y-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Regulas
                  <span className="block text-primary">80. Geburtstag</span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  Wir feiern gemeinsam einen besonderen Meilenstein! 
                  Komm und lass uns diesen wundervollen Tag zusammen verbringen.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  variant="celebration" 
                  size="lg"
                  className="group"
                >
                  <Link to="/anmeldung">
                    <Heart className="mr-2 h-5 w-5 group-hover:animate-celebration-bounce" />
                    Zur Anmeldung
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                >
                  <Link to="/uebersicht">
                    Wer kommt mit was?
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className={`relative ${mounted ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 delay-300`}>
              <div className="relative rounded-2xl overflow-hidden shadow-[var(--celebration-shadow)]">
                <img 
                  src={regulaHero}
                  alt="Regula feiert ihren 80. Geburtstag"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-foreground">
              Feier-Details
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Datum */}
              <Card className="text-center group hover:shadow-[var(--celebration-shadow)] transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Datum</h3>
                  <p className="text-lg text-muted-foreground font-medium">04.10.2025</p>
                  <p className="text-sm text-muted-foreground">Samstag</p>
                </CardContent>
              </Card>

              {/* Zeit */}
              <Card className="text-center group hover:shadow-[var(--celebration-shadow)] transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Zeit</h3>
                  <p className="text-lg text-muted-foreground font-medium">17:00 Uhr</p>
                  <p className="text-sm text-muted-foreground">Aperitif & Zusammenkunft</p>
                </CardContent>
              </Card>

              {/* Ort */}
              <Card className="text-center group hover:shadow-[var(--celebration-shadow)] transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Ort</h3>
                  <p className="text-lg text-muted-foreground font-medium">Kanu Club Romanshorn</p>
                  <p className="text-sm text-muted-foreground">Seeweg 1, 8590 Romanshorn</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Location Image */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-foreground">
              Der wunderschöne Austragungsort
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-[var(--gentle-shadow)]">
              <img 
                src={kanuClub}
                alt="Kanu Club Romanshorn am Bodensee"
                className="w-full h-[300px] lg:h-[400px] object-cover"
              />
            </div>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Direkt am wunderschönen Bodensee gelegen, bietet der Kanu Club Romanshorn 
              die perfekte Atmosphäre für unsere Feier. Mit Blick aufs Wasser und 
              gemütlicher Vereinsatmosphäre werden wir einen unvergesslichen Abend verbringen.
            </p>
          </div>
        </div>
      </section>

      {/* Bildergalerie Teaser */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
              Erinnerungen vom Fest
            </h2>
            <div className="bg-muted/50 rounded-2xl p-12 border-2 border-dashed border-muted-foreground/30">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Bald verfügbar</h3>
                <p className="text-muted-foreground">
                  Nach der Feier werden hier die schönsten Fotos des Abends zu finden sein. 
                  Schaut gerne wieder vorbei!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[var(--soft-gradient)]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Schön, dass du kommst!
            </h2>
            <p className="text-xl text-muted-foreground">
              Hilf uns bei der Planung und melde dich jetzt an. 
              Zusammen machen wir diesen Tag unvergesslich.
            </p>
            <Button 
              asChild 
              variant="celebration" 
              size="xl"
              className="group"
            >
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