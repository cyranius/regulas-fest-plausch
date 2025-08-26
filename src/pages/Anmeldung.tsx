import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, CheckCircle, AlertCircle, Users, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  quota: number;
  examples: string;
  current_count: number;
}

interface RsvpItem {
  id: string;
  guest_name: string;
  item_title: string;
  category_name: string;
}

const Anmeldung = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingItems, setExistingItems] = useState<RsvpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    guestName: '',
    contact: '',
    coming: 'yes',
    attendeesCount: 1,
    categoryId: null,
    itemTitle: '',
    dietTags: [] as string[],
    warmNeeded: false,
    warmNotes: '',
    bringsUtensils: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Load existing RSVP items
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp_items')
        .select(`
          id,
          guest_name,
          item_title,
          category_id,
          categories:category_id (name)
        `)
        .eq('coming', true);

      if (rsvpError) throw rsvpError;

      // Count items per category
      const categoryCounts = rsvpData?.reduce((acc, item) => {
        acc[item.category_id] = (acc[item.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedCategories = categoriesData?.map(cat => ({
        ...cat,
        current_count: categoryCounts[cat.id] || 0
      })) || [];

      const formattedItems = rsvpData?.map(item => ({
        id: item.id,
        guest_name: item.guest_name,
        item_title: item.item_title || '',
        category_name: (item.categories as any)?.name || ''
      })) || [];

      setCategories(enrichedCategories);
      setExistingItems(formattedItems);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Daten konnten nicht geladen werden. Bitte versuche es erneut.",
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
      const { error } = await supabase
        .from('rsvp_items')
        .insert({
          guest_name: formData.guestName,
          contact: formData.contact,
          coming: formData.coming === 'yes',
          attendees_count: formData.attendeesCount,
          category_id: formData.categoryId || null,
          item_title: formData.itemTitle || null,
          diet_tags: formData.dietTags,
          warm_needed: formData.warmNeeded,
          warm_notes: formData.warmNotes || null,
          brings_utensils: formData.bringsUtensils,
        });

      if (error) throw error;

      toast({
        title: "Anmeldung erfolgreich!",
        description: "Vielen Dank für deine Anmeldung. Wir freuen uns auf dich!",
      });

      navigate('/danke');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        title: "Fehler bei der Anmeldung",
        description: "Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDietTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietTags: prev.dietTags.includes(tag)
        ? prev.dietTags.filter(t => t !== tag)
        : [...prev.dietTags, tag]
    }));
  };

  const getAvailabilityStatus = (category: Category) => {
    const available = category.quota - category.current_count;
    if (available <= 0) return { status: 'full', text: 'voll', color: 'destructive' };
    if (available <= 1) return { status: 'almost', text: `nur noch ${available}`, color: 'warn' };
    return { status: 'available', text: `${available} frei`, color: 'success' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Lade Anmeldeformular...</p>
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
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Anmeldung
            </h1>
            <p className="text-xl text-muted-foreground">
              Schön, dass du zu Regulas 80. Geburtstag kommen möchtest! 
              Fülle das Formular aus und schau, was du Leckeres mitbringen kannst.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Live-Übersicht */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Was ist schon geplant?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map(category => {
                  const status = getAvailabilityStatus(category);
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{category.name}</h4>
                        <Badge 
                          variant={status.color === 'destructive' ? 'destructive' : 'secondary'}
                          className={status.color === 'warn' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                        >
                          {status.text}
                        </Badge>
                      </div>
                      
                      {/* Zeige bereits angemeldete Items dieser Kategorie */}
                      <div className="text-sm text-muted-foreground space-y-1">
                        {existingItems
                          .filter(item => {
                            const cat = categories.find(c => c.name === item.category_name);
                            return cat?.id === category.id;
                          })
                          .slice(0, 3)
                          .map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{item.guest_name}: {item.item_title || 'Überraschung'}</span>
                            </div>
                          ))}
                        {existingItems.filter(item => {
                          const cat = categories.find(c => c.name === item.category_name);
                          return cat?.id === category.id;
                        }).length > 3 && (
                          <div className="text-xs text-muted-foreground/60 ml-5">
                            ... und weitere
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground/80">
                        Beispiele: {category.examples}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Anmeldeformular */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Deine Anmeldung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basis-Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Über dich</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guestName">Name *</Label>
                        <Input
                          id="guestName"
                          value={formData.guestName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                          required
                          className="mt-1"
                          placeholder="Dein vollständiger Name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contact">Kontakt (E-Mail oder Telefon) *</Label>
                        <Input
                          id="contact"
                          value={formData.contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                          required
                          className="mt-1"
                          placeholder="name@beispiel.ch oder 079 123 45 67"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Kommst du zur Feier?</Label>
                      <RadioGroup
                        value={formData.coming}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, coming: value }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="coming-yes" />
                          <Label htmlFor="coming-yes">Ja, ich komme!</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="coming-no" />
                          <Label htmlFor="coming-no">Leider bin ich verhindert</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.coming === 'yes' && (
                      <div>
                        <Label htmlFor="attendeesCount">Anzahl Personen (inkl. dir)</Label>
                        <Select
                          value={formData.attendeesCount.toString()}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, attendeesCount: parseInt(value) }))}
                        >
                          <SelectTrigger className="w-32 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Mitbringen Sektion */}
                  {formData.coming === 'yes' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">Was möchtest du mitbringen?</h3>
                      
                      <div>
                        <Label htmlFor="category">Kategorie</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Wähle eine Kategorie (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Bringe nichts mit / Überraschung</SelectItem>
                            {categories.map(category => {
                              const status = getAvailabilityStatus(category);
                              return (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                  disabled={status.status === 'full'}
                                  className={status.status === 'full' ? 'opacity-50' : ''}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{category.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({status.text})
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {formData.categoryId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Beispiele: {categories.find(c => c.id === formData.categoryId)?.examples}
                          </p>
                        )}
                      </div>

                      {formData.categoryId && (
                        <div>
                          <Label htmlFor="itemTitle">Titel deines Beitrags</Label>
                          <Input
                            id="itemTitle"
                            value={formData.itemTitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, itemTitle: e.target.value }))}
                            className="mt-1"
                            placeholder="z.B. Pasta-Salat mit Pesto"
                          />
                        </div>
                      )}

                      {formData.categoryId && (
                        <div className="space-y-3">
                          <Label>Ernährungs-Labels (optional)</Label>
                          <div className="flex flex-wrap gap-2">
                            {['vegetarisch', 'vegan', 'glutenfrei', 'laktosefrei', 'nussfrei'].map(tag => (
                              <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                  id={tag}
                                  checked={formData.dietTags.includes(tag)}
                                  onCheckedChange={() => toggleDietTag(tag)}
                                />
                                <Label htmlFor={tag} className="text-sm capitalize">{tag}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.categoryId && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="warmNeeded"
                              checked={formData.warmNeeded}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, warmNeeded: checked as boolean }))}
                            />
                            <Label htmlFor="warmNeeded">Muss warmgehalten werden?</Label>
                          </div>
                          
                          {formData.warmNeeded && (
                            <Textarea
                              value={formData.warmNotes}
                              onChange={(e) => setFormData(prev => ({ ...prev, warmNotes: e.target.value }))}
                              placeholder="Welche Temperatur? Besondere Hinweise?"
                              className="mt-2"
                            />
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bringsUtensils"
                              checked={formData.bringsUtensils}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bringsUtensils: checked as boolean }))}
                            />
                            <Label htmlFor="bringsUtensils">Bringe Servierbesteck mit</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      variant="celebration"
                      size="lg"
                      className="w-full md:w-auto"
                      disabled={submitting || !formData.guestName || !formData.contact}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Wird gespeichert...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          Anmeldung abschicken
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anmeldung;
