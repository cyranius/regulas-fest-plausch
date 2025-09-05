import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Utensils, Heart, UserPlus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Guest {
  id: string;
  guest_name: string;
  contact: string;
  attendees_count: number;
  coming: boolean;
  rsvp_items: RsvpItem[];
}

interface RsvpItem {
  id: string;
  item_title: string;
  diet_tags: string[];
  warm_needed: boolean;
  brings_utensils: boolean;
  category: {
    name: string;
    examples: string;
  } | null;
}

interface CategoryGroup {
  name: string;
  items: RsvpItem[];
  quota: number;
}

const Uebersicht = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; quota: number; examples: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select(`
          id,
          guest_name,
          contact,
          attendees_count,
          coming,
          rsvp_items (
            id,
            item_title,
            diet_tags,
            warm_needed,
            brings_utensils,
            categories:category_id (
              name,
              examples
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (guestsError) throw guestsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      const mappedGuestsData = guestsData?.map(guest => ({
        ...guest,
        rsvp_items: guest.rsvp_items.map((item: any) => ({
          ...item,
          category: item.categories,
        })),
      })) || [];

      setGuests(mappedGuestsData);
      setCategories(categoriesData || []);

      const total = guestsData?.reduce((sum, guest) => {
        return sum + (guest.coming ? guest.attendees_count : 0);
      }, 0) || 0;
      setTotalAttendees(total);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const comingGuests = guests.filter(guest => guest.coming);
  const notComingGuests = guests.filter(guest => !guest.coming);

  const categoryGroups: CategoryGroup[] = categories.map(category => {
    const items = comingGuests.flatMap(guest =>
      guest.rsvp_items
        .filter(item => item.category?.name === category.name)
        .map(item => ({ ...item, guest_name: guest.guest_name, attendees_count: guest.attendees_count }))
    );
    return {
      name: category.name,
      items: items as any,
      quota: category.quota,
    };
  });

  const guestsWithoutItems = comingGuests.filter(guest => guest.rsvp_items.length === 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Lade Übersicht...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[var(--soft-gradient)] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Startseite
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Wer kommt mit was?
            </h1>
            <p className="text-xl text-muted-foreground">
              Eine Übersicht aller Anmeldungen für Regulas 80. Geburtstag
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{totalAttendees}</div>
                <p className="text-muted-foreground">Personen kommen</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {comingGuests.reduce((acc, guest) => acc + guest.rsvp_items.length, 0)}
                </div>
                <p className="text-muted-foreground">Mitbringsel geplant</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">04.10.2025</div>
                <p className="text-muted-foreground">17:00 Uhr</p>
              </CardContent>
            </Card>
          </div>

          {/* Mitbringsel nach Kategorien */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Geplante Mitbringsel</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {categoryGroups.map(group => (
                <Card key={group.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      <Badge 
                        variant={group.items.length >= group.quota ? "destructive" : "secondary"}
                      >
                        {group.items.length}/{group.quota}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {group.items.length > 0 ? (
                      <div className="space-y-3">
                        {group.items.map(item => (
                          <div key={item.id} className="border-l-4 border-primary/30 pl-4 py-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">
                                  {(item as any).guest_name}
                                  {(item as any).attendees_count > 1 && (
                                    <span className="text-sm text-muted-foreground ml-1">
                                      (+{(item as any).attendees_count - 1})
                                    </span>
                                  )}
                                </p>
                                {item.item_title && (
                                  <p className="text-muted-foreground">{item.item_title}</p>
                                )}
                                
                                {/* Diet tags and special requirements */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.diet_tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {item.warm_needed && (
                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                      warmhalten
                                    </Badge>
                                  )}
                                  {item.brings_utensils && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Besteck dabei
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Noch nichts in dieser Kategorie geplant
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Gäste ohne Mitbringsel */}
          {guestsWithoutItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kommen ohne Mitbringsel / Überraschung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {guestsWithoutItems.map(guest => (
                    <div key={guest.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {guest.guest_name}
                        {guest.attendees_count > 1 && (
                          <span className="text-sm text-muted-foreground ml-1">
                            (+{guest.attendees_count - 1})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Absagen */}
          {notComingGuests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground">Leider verhindert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {notComingGuests.map(guest => (
                    <div key={guest.id} className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                      <span className="text-muted-foreground">{guest.guest_name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="text-center bg-[var(--soft-gradient)]">
            <CardContent className="pt-8 pb-6">
              <div className="space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold text-foreground">
                  Du bist noch nicht dabei?
                </h3>
                <p className="text-muted-foreground">
                  Melde dich jetzt an und lass uns gemeinsam feiern!
                </p>
                <Button asChild variant="celebration" size="lg">
                  <Link to="/anmeldung">
                    <Heart className="mr-2 h-5 w-5" />
                    Jetzt anmelden
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Uebersicht;
