import { useLocation } from 'react-router-dom';
import { Heart, Frown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Danke = () => {
  const location = useLocation();
  const { coming } = (location.state || { coming: true }) as { coming: boolean };

  const title = coming ? "Herzlichen Dank!" : "Schade!";
  const message = coming
    ? "Deine Anmeldung ist eingegangen. Wir freuen uns riesig, dass du zu Regulas 80. Geburtstag kommst!"
    : "Schade, dass du nicht dabei sein kannst. Wir sehen uns ein anderes Mal!";
  const icon = coming ? <Heart className="h-12 w-12 text-hippie-yellow animate-warm-glow" /> : <Frown className="h-12 w-12 text-hippie-green" />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 text-foreground">
      <Card className="max-w-2xl w-full shadow-[var(--celebration-shadow)] bg-card border-hippie-yellow border-2">
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-hippie-yellow/20 rounded-full flex items-center justify-center animate-celebration-bounce">
            {icon}
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground">
              {title}
            </h1>
            <p className="text-xl lg:text-2xl text-foreground leading-relaxed">
              {message}
            </p>
          </div>

          {coming && (
            <>
              {/* Event Reminder */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-2 border border-hippie-green">
                <h3 className="text-2xl font-semibold text-foreground">Zur Erinnerung</h3>
                <p className="text-xl text-foreground">
                  <strong>04.10.2025, 16:30 Uhr</strong><br />
                  Kanu Club Romanshorn, Seeweg 1
                </p>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
              </div>

            </>
          )}

          {/* Footer Note */}
          <div className="text-lg text-foreground pt-4 border-t border-muted">
            Bei Fragen oder Änderungen deiner Anmeldung melde dich gerne direkt bei Tanja Hiller (0796787645) oder Sabrina Hiller (077 524 66 73).
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Danke;
