import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Danke = () => {
  return (
    <div className="min-h-screen bg-[var(--soft-gradient)] flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-[var(--celebration-shadow)]">
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-8">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-celebration-bounce">
            <Heart className="h-10 w-10 text-primary animate-warm-glow" />
          </div>

          {/* Thank You Message */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Herzlichen Dank!
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Deine Anmeldung ist eingegangen. Wir freuen uns riesig, 
              dass du zu Regulas 80. Geburtstag kommst!
            </p>
          </div>

          {/* Event Reminder */}
          <div className="bg-muted/50 rounded-xl p-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Zur Erinnerung</h3>
            <p className="text-muted-foreground">
              <strong>04.10.2025, 17:00 Uhr</strong><br />
              Kanu Club Romanshorn, Seeweg 1
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Du kannst jederzeit schauen, wer sonst noch kommt und was mitgebracht wird. 
              Bei Fragen oder Änderungen melde dich gerne!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              asChild 
              variant="celebration" 
              size="lg"
              className="group flex-1"
            >
              <Link to="/uebersicht">
                <Users className="mr-2 h-5 w-5" />
                Wer kommt mit was?
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="flex-1"
            >
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Zur Startseite
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-sm text-muted-foreground pt-4 border-t border-muted">
            Bei Fragen oder Änderungen deiner Anmeldung melde dich gerne bei der Organisation.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Danke;