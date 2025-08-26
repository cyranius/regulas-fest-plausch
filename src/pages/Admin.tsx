import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Download, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  contact: string;
  item_title: string;
  attendees_count: number;
  coming: boolean;
  category_name: string;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [rsvpItems, setRsvpItems] = useState<RsvpItem[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = 'orga'; // Einfaches Passwort wie gewünscht

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      toast({
        title: "Falsches Passwort",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Load RSVP items with category info
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp_items')
        .select(`
          id,
          guest_name,
          contact,
          item_title,
          attendees_count,
          coming,
          created_at,
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false });

      if (rsvpError) throw rsvpError;

      // Count items per category
      const categoryCounts = rsvpData?.reduce((acc, item) => {
        if (item.coming && item.categories) {
          const categoryName = (item.categories as any).name;
          acc[categoryName] = (acc[categoryName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedCategories = categoriesData?.map(cat => ({
        ...cat,
        current_count: categoryCounts[cat.name] || 0
      })) || [];

      const formattedRsvp = rsvpData?.map(item => ({
        id: item.id,
        guest_name: item.guest_name,
        contact: item.contact,
        item_title: item.item_title || '',
        attendees_count: item.attendees_count,
        coming: item.coming,
        category_name: (item.categories as any)?.name || 'Ohne Kategorie',
        created_at: item.created_at
      })) || [];

      setCategories(enrichedCategories);
      setRsvpItems(formattedRsvp);
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

  const updateCategoryQuota = async (categoryId: string, newQuota: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ quota: newQuota })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, quota: newQuota } : cat
      ));

      toast({
        title: "Quota aktualisiert",
        description: "Die Anzahl wurde erfolgreich geändert.",
      });

      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating quota:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Quota konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Kontakt', 'Mitbringsel', 'Kategorie', 'Anzahl Personen', 'Kommt', 'Anmeldedatum'].join(';'),
      ...rsvpItems.map(item => [
        item.guest_name,
        item.contact,
        item.item_title,
        item.category_name,
        item.attendees_count.toString(),
        item.coming ? 'Ja' : 'Nein',
        new Date(item.created_at).toLocaleDateString('de-CH')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `regula-geburtstag-anmeldungen-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalAttendees = rsvpItems.reduce((sum, item) => 
    sum + (item.coming ? item.attendees_count : 0), 0
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Admin-Bereich
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1"
                placeholder="Passwort eingeben"
                autoFocus
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={!password}>
              Anmelden
            </Button>
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Startseite
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Admin-Bereich
              </h1>
              <p className="text-muted-foreground">
                Verwaltung für Regulas Geburtstag
              </p>
            </div>
            <Button onClick={exportData} variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Daten exportieren
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {loading && (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Lade Daten...</p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">{totalAttendees}</div>
                <p className="text-sm text-muted-foreground">Personen kommen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {rsvpItems.filter(item => item.coming).length}
                </div>
                <p className="text-sm text-muted-foreground">Zusagen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {rsvpItems.filter(item => !item.coming).length}
                </div>
                <p className="text-sm text-muted-foreground">Absagen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {rsvpItems.filter(item => item.coming && item.item_title).length}
                </div>
                <p className="text-sm text-muted-foreground">Mitbringsel</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Management */}
          <Card>
            <CardHeader>
              <CardTitle>Kategorien verwalten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-foreground">{category.name}</h4>
                        <Badge 
                          variant={category.current_count > category.quota ? "destructive" : "secondary"}
                          className={category.current_count > category.quota ? "animate-pulse" : ""}
                        >
                          {category.current_count}/{category.quota}
                        </Badge>
                        {category.current_count > category.quota && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Beispiele: {category.examples}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            defaultValue={category.quota}
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const newValue = parseInt((e.target as HTMLInputElement).value);
                                updateCategoryQuota(category.id, newValue);
                              }
                              if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const input = document.querySelector(`input[defaultValue="${category.quota}"]`) as HTMLInputElement;
                              if (input) {
                                updateCategoryQuota(category.id, parseInt(input.value));
                              }
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCategory(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory(category.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RSVP Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Alle Anmeldungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Personen</TableHead>
                      <TableHead>Mitbringsel</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Anmeldung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvpItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.guest_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.contact}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.attendees_count}</Badge>
                        </TableCell>
                        <TableCell>{item.item_title || '-'}</TableCell>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell>
                          <Badge variant={item.coming ? "default" : "secondary"}>
                            {item.coming ? 'Kommt' : 'Verhindert'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('de-CH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;