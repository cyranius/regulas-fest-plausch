import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, CheckCircle, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Category {
  id: string;
  name: string;
  quota: number;
  current_count: number;
}

interface RsvpItem {
  id: string;
  item_title: string;
  category_name: string;
  guests: {
    guest_name: string;
  } | null;
}

interface ItemToBring {
  id: string; // Unique ID for React list rendering
  categoryId: string | null | undefined;
  itemTitle: string;
  servings: number;
  dietTags: string[];
  warmNeeded: boolean;
}

const Anmeldung = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingItems, setExistingItems] = useState<RsvpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Form state for personal details
  const [formData, setFormData] = useState({
    guestName: '',
    contact: '',
    coming: 'yes',
    attendeesCount: 1,
  });

  // Form state for items to bring
  const [itemsToBring, setItemsToBring] = useState<ItemToBring[]>([
    {
      id: crypto.randomUUID(),
      categoryId: undefined,
      itemTitle: '',
      servings: 1,
      dietTags: [],
      warmNeeded: false,
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, quota, sort_order')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp_items')
        .select('id, item_title, category_id, categories:category_id (name), guests (guest_name)');

      if (rsvpError) throw rsvpError;

      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('id, coming');

      if (guestsError) throw guestsError;

      const comingGuestIds = new Set(guestsData?.filter(g => g.coming).map(g => g.id));
      
      const comingRsvpItems = rsvpData?.filter(item => comingGuestIds.has((item as any).guest_id));

      const categoryCounts = comingRsvpItems?.reduce((acc, item) => {
        if (item.category_id) {
          acc[item.category_id] = (acc[item.category_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedCategories = categoriesData?.map(cat => ({
        ...cat,
        current_count: categoryCounts[cat.id] || 0
      })) || [];

      const formattedItems = rsvpData?.map(item => ({
        id: item.id,
        item_title: item.item_title || '',
        category_name: (item.categories as any)?.name || '',
        guests: item.guests,
      })) || [];

      setCategories(enrichedCategories);
      setExistingItems(formattedItems as any);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .insert({
          guest_name: formData.guestName,
          contact: formData.contact,
          coming: formData.coming === 'yes',
          attendees_count: formData.attendeesCount,
        })
        .select('id')
        .single();

      if (guestError) throw guestError;
      if (!guest) throw new Error("Guest creation failed.");

      const guestId = guest.id;

      if (formData.coming === 'yes') {
        const rsvpItemsToInsert = itemsToBring
          .filter(item => item.categoryId && item.categoryId !== 'no-contribution')
          .map(item => ({
            guest_id: guestId,
            category_id: item.categoryId,
            item_title: item.itemTitle || null,
            servings: item.servings,
            diet_tags: item.dietTags,
            warm_needed: item.warmNeeded,
          }));

        if (rsvpItemsToInsert.length > 0) {
          const { error: rsvpError } = await supabase
            .from('rsvp_items')
            .insert(rsvpItemsToInsert);
          if (rsvpError) throw rsvpError;
        }
      }


      toast({
        title: formData.coming === 'yes' ? "Anmeldung erfolgreich!" : "Schade!",
        description: formData.coming === 'yes'
          ? "Vielen Dank! Wir freuen uns auf dich!"
          : "Deine Rückmeldung wurde gespeichert. Vielleicht ein anderes Mal!",
      });
      navigate('/danke', { state: { coming: formData.coming === 'yes' } });

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        title: "Fehler bei der Anmeldung",
        description: "Deine Anmeldung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemChange = (id: string, field: keyof ItemToBring, value: any) => {
    setItemsToBring(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleDietTag = (itemId: string, tag: string) => {
    setItemsToBring(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newDietTags = item.dietTags.includes(tag)
            ? item.dietTags.filter(t => t !== tag)
            : [...item.dietTags, tag];
          return { ...item, dietTags: newDietTags };
        }
        return item;
      })
    );
  };

  const addItemToBring = () => {
    setItemsToBring(prevItems => [
      ...prevItems,
      {
        id: crypto.randomUUID(),
        categoryId: undefined,
        itemTitle: '',
        servings: 1,
        dietTags: [],
        warmNeeded: false,
      },
    ]);
  };

  const removeItemToBring = (id: string) => {
    setItemsToBring(prevItems => prevItems.filter(item => item.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Lade Anmeldeformular...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 text-gray-900 font-sans">
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <Link to="/" className="text-gray-700 hover:text-black inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Startseite
            </Link>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
              An- und Abmeldung zum 80. Geburtstag von Regula
            </h1>
            <p className="text-lg text-gray-700">
              Bitte fülle das Formular aus, um uns deine Teilnahme oder Absage mitzuteilen.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className={`grid ${formData.coming === 'yes' ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-12 max-w-7xl mx-auto`}>
          
          <div className={formData.coming === 'yes' ? 'lg:col-span-3' : 'lg:col-span-5'}>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-black border-b pb-3">1. Deine Angaben</h2>
                    
                    <div>
                      <Label htmlFor="guestName" className="text-base font-medium text-gray-900">Dein Name *</Label>
                      <Input id="guestName" value={formData.guestName} onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))} required className="mt-2 text-base p-3 border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-gray-900" placeholder="Vorname Nachname"/>
                    </div>
                    
                    <div>
                      <Label htmlFor="contact" className="text-base font-medium text-gray-900">Kontakt (E-Mail oder Telefon) *</Label>
                      <Input id="contact" value={formData.contact} onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))} required className="mt-2 text-base p-3 border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-gray-900" placeholder="Für Rückfragen"/>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-900">Nimmst du/ihr an der Feier teil?</Label>
                      <RadioGroup value={formData.coming} onValueChange={(value) => setFormData(prev => ({ ...prev, coming: value }))} className="flex gap-6 mt-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="coming-yes" className="h-5 w-5 text-pink-500 border-pink-500 focus:ring-pink-500 data-[state=checked]:border-pink-500"/>
                          <Label htmlFor="coming-yes" className="text-base text-gray-900">Ja, ich/wir kommen gerne</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="coming-no" className="h-5 w-5 text-pink-500 border-pink-500 focus:ring-pink-500 data-[state=checked]:border-pink-500" />
                          <Label htmlFor="coming-no" className="text-base text-gray-900">Leider nein</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.coming === 'yes' && (
                      <div>
                        <Label htmlFor="attendeesCount" className="text-base font-medium text-gray-900">Anzahl Personen (inklusive dir)</Label>
                        <Select value={formData.attendeesCount.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, attendeesCount: parseInt(value) }))}>
                          <SelectTrigger className="w-36 mt-2 text-base p-3 border-gray-300 text-gray-900">
                            <SelectValue placeholder="Anzahl Personen" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()} className="text-base text-gray-900">{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {formData.coming === 'yes' && (
                    <div className="space-y-8">
                      <h2 className="text-2xl font-semibold text-black border-b pb-3">2. Beitrag zum Buffet (optional)</h2>

                      {isMobile && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="buffet-overview">
                            <AccordionTrigger className="text-xl font-semibold text-black flex items-center gap-2">
                              <Utensils className="h-5 w-5 text-pink-600" />
                              Buffet-Übersicht
                            </AccordionTrigger>
                            <AccordionContent>
                              <Card className="bg-white border-gray-200 p-6 shadow-none">
                                <CardContent className="p-0 space-y-6">
                                  {categories.map(category => {
                                    const available = category.quota - category.current_count;
                                    let badgeClass = "bg-green-200 text-black";
                                    if (available <= 0) badgeClass = "bg-red-200 text-black";
                                    else if (available <= 1) badgeClass = "bg-yellow-200 text-black";
                                    
                                    return (
                                      <div key={category.id}>
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium text-black text-base">{category.name}</h4>
                                          <Badge className={badgeClass}>{available <= 0 ? 'voll' : `${available} frei`}</Badge>
                                        </div>
                                        <div className="text-base text-gray-700 space-y-2">
                                          {existingItems
                                            .filter(item => item.category_name === category.name && item.item_title)
                                            .map(item => (
                                              <div key={item.id} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span>{item.guests?.guest_name}: {item.item_title || 'Überraschung'}</span>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </CardContent>
                              </Card>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                      
                      {itemsToBring.map((item, index) => (
                        <div key={item.id} className="space-y-6 border-t pt-6 first:border-t-0 first:pt-0">
                          <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                            {itemsToBring.length > 1 && `Beitrag ${index + 1}`}
                            {itemsToBring.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemToBring(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Entfernen
                              </Button>
                            )}
                          </h3>
                          <div>
                            <Label htmlFor={`category-${item.id}`} className="text-base font-medium text-gray-900">Kategorie</Label>
                            <Select
                              value={item.categoryId || ''}
                              onValueChange={(value) => handleItemChange(item.id, 'categoryId', value === '' ? undefined : value)}
                            >
                              <SelectTrigger id={`category-${item.id}`} className="mt-2 text-base p-3 border-gray-300 text-gray-900">
                                <SelectValue placeholder="Wähle eine Kategorie" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(category => {
                                  const available = category.quota - category.current_count;
                                  const isFull = available <= 0;
                                  return (
                                    <SelectItem key={category.id} value={category.id} disabled={isFull} className={`text-base text-gray-900 ${isFull ? 'opacity-50' : ''}`}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{category.name}</span>
                                        <span className="text-sm text-gray-700 ml-4">({isFull ? 'voll' : `${available} frei`})</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                                <SelectItem value="no-contribution" className="text-base text-gray-900">Ich bringe nichts mit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {item.categoryId && item.categoryId !== 'no-contribution' && (
                            <>
                              <div>
                                <Label htmlFor={`itemTitle-${item.id}`} className="text-base font-medium text-gray-900">Was bringst du mit?</Label>
                                <Input
                                  id={`itemTitle-${item.id}`}
                                  value={item.itemTitle}
                                  onChange={(e) => handleItemChange(item.id, 'itemTitle', e.target.value)}
                                  className="mt-2 text-base p-3 border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-gray-900"
                                  placeholder="z.B. Schokoladenkuchen"
                                />
                              </div>
                              <div className="space-y-4">
                                <Label className="text-base font-medium text-gray-900">Besonderheiten (optional)</Label>
                                <div className="flex flex-col space-y-3">
                                  {['vegetarisch', 'vegan', 'glutenfrei', 'laktosefrei', 'nussfrei'].map(tag => (
                                    <div key={tag} className="flex items-center space-x-3">
                                      <Checkbox
                                        id={`${tag}-${item.id}`}
                                        checked={item.dietTags.includes(tag)}
                                        onCheckedChange={() => toggleDietTag(item.id, tag)}
                                        className="h-5 w-5 text-pink-500 border-pink-500 focus:ring-pink-500 data-[state=checked]:border-pink-500"
                                      />
                                      <Label htmlFor={`${tag}-${item.id}`} className="text-base capitalize font-normal text-gray-900">{tag}</Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`warmNeeded-${item.id}`}
                                    checked={item.warmNeeded}
                                    onCheckedChange={(checked) => handleItemChange(item.id, 'warmNeeded', checked as boolean)}
                                    className="h-5 w-5 text-pink-500 border-pink-500 focus:ring-pink-500 data-[state=checked]:border-pink-500"
                                  />
                                  <Label htmlFor={`warmNeeded-${item.id}`} className="text-base font-normal text-gray-900">Muss warmgehalten werden?</Label>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {formData.coming === 'yes' && (
                        <div className="mt-4">
                          <Button type="button" onClick={addItemToBring} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                            Weiteren Beitrag hinzufügen
                          </Button>
                          <p className="text-sm text-gray-600 mt-2 text-center">
                            Falls du die doppelte Menge machen möchtest, füge nochmals dasselbe hinzu (z.B. für 8 statt 4 Personen).
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto text-lg py-3 px-8 bg-pink-600 hover:bg-pink-700 text-white"
                      disabled={
                        submitting ||
                        !formData.guestName ||
                        !formData.contact ||
                        (formData.coming === 'yes' &&
                          itemsToBring.some(item => item.categoryId && item.categoryId !== 'no-contribution' && !item.itemTitle))
                      }
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Wird gespeichert...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          {formData.coming === 'yes' ? 'Anmeldung abschicken' : 'Abmeldung abschicken'}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {formData.coming === 'yes' && !isMobile && (
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200 p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-pink-600" />
                    Buffet-Übersicht
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  {categories.map(category => {
                    const available = category.quota - category.current_count;
                    let badgeClass = "bg-green-200 text-black";
                    if (available <= 0) badgeClass = "bg-red-200 text-black";
                    else if (available <= 1) badgeClass = "bg-yellow-200 text-black";
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-black text-base">{category.name}</h4>
                          <Badge className={badgeClass}>{available <= 0 ? 'voll' : `${available} frei`}</Badge>
                        </div>
                        <div className="text-base text-gray-700 space-y-2">
                          {existingItems
                            .filter(item => item.category_name === category.name && item.item_title)
                            .map(item => (
                              <div key={item.id} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{item.guests?.guest_name}: {item.item_title || 'Überraschung'}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Anmeldung;
