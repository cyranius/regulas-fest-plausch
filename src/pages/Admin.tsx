import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Download, Edit2, Save, X, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  quota: number;
  examples: string;
  current_count: number;
}

interface Guest {
  id: string;
  guest_name: string;
  contact: string;
  attendees_count: number;
  coming: boolean;
  created_at: string;
  updated_at: string;
}

interface RsvpItem {
  id: string;
  item_title: string;
  category_name: string;
  category_id: string | null;
  servings: number | null;
  diet_tags: string[] | null;
  warm_needed: boolean | null;
  warm_notes: string | null;
  brings_utensils: boolean | null;
  guest: Guest; // Nested guest data
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [rsvpItems, setRsvpItems] = useState<RsvpItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingQuotaValue, setEditingQuotaValue] = useState<number | null>(null);
  const [editingRsvpItem, setEditingRsvpItem] = useState<RsvpItem | null>(null);
  const [isRsvpEditDialogOpen, setIsRsvpEditDialogOpen] = useState(false);
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

      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (guestsError) throw guestsError;
      setGuests(guestsData || []);

      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp_items')
        .select(`
          id,
          item_title,
          servings,
          diet_tags,
          warm_needed,
          warm_notes,
          brings_utensils,
          category_id,
          categories:category_id (name),
          guest:guests!guest_id (
            id,
            guest_name,
            contact,
            attendees_count,
            coming,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });
        
      if (rsvpError) throw rsvpError;

      const comingGuests = guestsData.filter(g => g.coming);

      const categoryCounts = rsvpData?.reduce((acc, item) => {
        const guestIsComing = comingGuests.some(g => g.id === (item.guest as any)?.id);
        if (guestIsComing && item.categories) {
          const categoryName = (item.categories as any).name;
          acc[categoryName] = (acc[categoryName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedCategories = categoriesData?.map(cat => ({
        ...cat,
        current_count: categoryCounts[cat.name] || 0
      })) || [];

      const formattedRsvp: RsvpItem[] = rsvpData?.map((item: any) => ({
        ...item,
        category_name: item.categories?.name || 'Ohne Kategorie',
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

  const handleEditRsvp = (item: RsvpItem) => {
    setEditingRsvpItem(item);
    setIsRsvpEditDialogOpen(true);
  };

  const handleCancelEditRsvp = () => {
    setEditingRsvpItem(null);
    setIsRsvpEditDialogOpen(false);
  };

  const handleSaveRsvp = async (updatedItem: RsvpItem) => {
    setLoading(true);
    try {
      const { guest, ...rsvpItemData } = updatedItem;
      const { error: rsvpError } = await supabase
        .from('rsvp_items')
        .update({
          item_title: rsvpItemData.item_title,
          category_id: rsvpItemData.category_id,
          servings: rsvpItemData.servings,
          diet_tags: rsvpItemData.diet_tags || [],
          warm_needed: rsvpItemData.warm_needed,
          warm_notes: rsvpItemData.warm_notes,
          brings_utensils: rsvpItemData.brings_utensils,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rsvpItemData.id);

      if (rsvpError) throw rsvpError;

      const { error: guestError } = await supabase
        .from('guests')
        .update({
          guest_name: guest.guest_name,
          contact: guest.contact,
          attendees_count: guest.attendees_count,
          coming: guest.coming,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guest.id);

      if (guestError) throw guestError;

      toast({
        title: "Anmeldung aktualisiert",
        description: "Die RSVP-Anmeldung wurde erfolgreich gespeichert.",
      });
      loadData(); // Reload all data to reflect changes and update counts
      handleCancelEditRsvp();
    } catch (error) {
      console.error('Error saving RSVP item:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die RSVP-Anmeldung konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRsvp = async (itemId: string) => {
    if (!window.confirm('Bist du sicher, dass du diese Anmeldung löschen möchtest?')) {
      return;
    }

    setLoading(true);
    console.log('Attempting to delete RSVP item with ID:', itemId); // Log the item ID
    try {
      const { error } = await supabase
        .from('rsvp_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Supabase delete error:', error); // Log the Supabase error object
        throw error;
      }

      toast({
        title: "Anmeldung gelöscht",
        description: "Die RSVP-Anmeldung wurde erfolgreich entfernt.",
      });
      loadData(); // Reload all data to reflect changes and update counts
    } catch (error) {
      console.error('Error deleting RSVP item:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die RSVP-Anmeldung konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryQuota = async (categoryId: string, newQuota: number | null) => {
    if (newQuota === null || isNaN(newQuota) || newQuota < 0) {
      toast({
        title: "Ungültige Quota",
        description: "Bitte gib eine gültige positive Zahl ein.",
        variant: "destructive",
      });
      setEditingCategory(null);
      setEditingQuotaValue(null);
      return;
    }

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
        item.guest.guest_name,
        item.guest.contact,
        item.item_title,
        item.category_name,
        item.guest.attendees_count.toString(),
        item.guest.coming ? 'Ja' : 'Nein',
        new Date(item.guest.created_at).toLocaleDateString('de-CH')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `regula-geburtstag-anmeldungen-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalAttendees = guests.reduce((sum, guest) => 
    sum + (guest.coming ? guest.attendees_count : 0), 0
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
                  {guests.filter(guest => guest.coming).length}
                </div>
                <p className="text-sm text-muted-foreground">Zusagen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {guests.filter(guest => !guest.coming).length}
                </div>
                <p className="text-sm text-muted-foreground">Absagen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {rsvpItems.filter(item => item.guest.coming && item.item_title).length}
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
                            value={editingQuotaValue !== null && !isNaN(editingQuotaValue) ? editingQuotaValue : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditingQuotaValue(value === '' ? null : parseInt(value));
                            }}
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCategoryQuota(category.id, editingQuotaValue);
                              }
                              if (e.key === 'Escape') {
                                setEditingCategory(null);
                                setEditingQuotaValue(null);
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (editingQuotaValue !== null) {
                                updateCategoryQuota(category.id, editingQuotaValue);
                              }
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCategory(null);
                              setEditingQuotaValue(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(category.id);
                            setEditingQuotaValue(category.quota);
                          }}
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
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvpItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.guest.guest_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.guest.contact}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.guest.attendees_count}</Badge>
                        </TableCell>
                        <TableCell>{item.item_title || '-'}</TableCell>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell>
                          <Badge variant={item.guest.coming ? "default" : "secondary"}>
                            {item.guest.coming ? 'Kommt' : 'Verhindert'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.guest.created_at).toLocaleDateString('de-CH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditRsvp(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRsvp(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* RSVP Edit Dialog */}
      <Dialog open={isRsvpEditDialogOpen} onOpenChange={setIsRsvpEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRsvpItem?.guest.guest_name ? `RSVP bearbeiten: ${editingRsvpItem.guest.guest_name}` : 'RSVP bearbeiten'}</DialogTitle>
          </DialogHeader>
          {editingRsvpItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guest_name" className="text-right">Name</Label>
                <Input
                  id="guest_name"
                  value={editingRsvpItem.guest.guest_name}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, guest: { ...editingRsvpItem.guest, guest_name: e.target.value } })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">Kontakt</Label>
                <Input
                  id="contact"
                  value={editingRsvpItem.guest.contact}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, guest: { ...editingRsvpItem.guest, contact: e.target.value } })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item_title" className="text-right">Mitbringsel</Label>
                <Input
                  id="item_title"
                  value={editingRsvpItem.item_title || ''}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, item_title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attendees_count" className="text-right">Personen</Label>
                <Input
                  id="attendees_count"
                  type="number"
                  min="1"
                  value={editingRsvpItem.guest.attendees_count}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, guest: { ...editingRsvpItem.guest, attendees_count: parseInt(e.target.value) || 1 } })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id" className="text-right">Kategorie</Label>
                <Select
                  value={editingRsvpItem.category_id || ''}
                  onValueChange={(value) => setEditingRsvpItem({ ...editingRsvpItem, category_id: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coming" className="text-right">Status</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Switch
                    id="coming"
                    checked={editingRsvpItem.guest.coming}
                    onCheckedChange={(checked) => setEditingRsvpItem({ ...editingRsvpItem, guest: { ...editingRsvpItem.guest, coming: checked } })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {editingRsvpItem.guest.coming ? 'Kommt' : 'Verhindert'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="servings" className="text-right">Portionen</Label>
                <Input
                  id="servings"
                  type="number"
                  min="0"
                  value={editingRsvpItem.servings || ''}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, servings: parseInt(e.target.value) || null })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diet_tags" className="text-right">Diät-Tags (Komma-separiert)</Label>
                <Input
                  id="diet_tags"
                  value={editingRsvpItem.diet_tags?.join(', ') || ''}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, diet_tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '') })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="warm_needed" className="text-right">Warm halten?</Label>
                <Checkbox
                  id="warm_needed"
                  checked={editingRsvpItem.warm_needed || false}
                  onCheckedChange={(checked: boolean) => setEditingRsvpItem({ ...editingRsvpItem, warm_needed: checked })}
                  className="col-span-3 justify-self-start"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="warm_notes" className="text-right">Notizen (Warm)</Label>
                <Textarea
                  id="warm_notes"
                  value={editingRsvpItem.warm_notes || ''}
                  onChange={(e) => setEditingRsvpItem({ ...editingRsvpItem, warm_notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brings_utensils" className="text-right">Besteck mitbringen?</Label>
                <Checkbox
                  id="brings_utensils"
                  checked={editingRsvpItem.brings_utensils || false}
                  onCheckedChange={(checked: boolean) => setEditingRsvpItem({ ...editingRsvpItem, brings_utensils: checked })}
                  className="col-span-3 justify-self-start"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEditRsvp}>Abbrechen</Button>
            <Button onClick={() => editingRsvpItem && handleSaveRsvp(editingRsvpItem)}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
