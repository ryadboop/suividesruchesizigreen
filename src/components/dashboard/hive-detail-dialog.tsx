import { useEffect, useState } from "react";
import { Check, LocateFixed, MapPin, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EngagementRing } from "./engagement-ring";
import {
  PLACEMENTS,
  PRICE_PER_HIVE,
  REGIONS,
  annualRevenue,
  effectiveRevenue,
  engagementEnd,
  engagementProgress,
  formatCoords,
  formatEuro,
  monthsRemaining,
  placementLabel,
  statusLabel,
  type Hive,
  type PlacementType,
} from "@/lib/hives";

type Patch = Partial<Omit<Hive, "id" | "revenue" | "status">>;

type Props = {
  hive: Hive | null;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Patch) => Promise<void>;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function HiveDetailDialog({ hive, isAdmin, onClose, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    site: "",
    region: REGIONS[0],
    placement: "site" as PlacementType,
    placementDetail: "",
    beekeeper: "",
    startDate: "",
    hiveCount: 1,
    latitude: "",
    longitude: "",
    price: "",
  });

  useEffect(() => {
    if (!hive) return;
    setEditing(false);
    setForm({
      name: hive.name,
      client: hive.client,
      site: hive.site,
      region: hive.region,
      placement: hive.placement,
      placementDetail: hive.placementDetail,
      beekeeper: hive.beekeeper ?? "",
      startDate: hive.startDate,
      hiveCount: hive.hiveCount,
      latitude: hive.latitude == null ? "" : String(hive.latitude),
      longitude: hive.longitude == null ? "" : String(hive.longitude),
      price: hive.price == null ? "" : String(hive.price),
    });
  }, [hive]);

  if (!hive) return null;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const lat = form.latitude.trim() === "" ? null : Number(form.latitude.replace(",", "."));
  const lng = form.longitude.trim() === "" ? null : Number(form.longitude.replace(",", "."));
  const coordsValid =
    (lat === null && lng === null) ||
    (lat !== null &&
      lng !== null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180);

  const customPrice =
    form.price.trim() === "" ? null : Number(form.price.replace(",", ".").replace(/\s/g, ""));
  const priceValid = customPrice === null || (Number.isFinite(customPrice) && customPrice >= 0);
  const nameValid = form.name.trim().length > 1 && form.client.trim().length > 1;
  const canSave = coordsValid && priceValid && nameValid && !saving;

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      })),
    );
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(hive.id, {
        name: form.name.trim(),
        client: form.client.trim(),
        site: form.site.trim(),
        region: form.region,
        placement: form.placement,
        placementDetail: form.placementDetail.trim(),
        beekeeper: form.beekeeper.trim(),
        startDate: form.startDate,
        hiveCount: form.hiveCount,
        latitude: lat,
        longitude: lng,
        price: customPrice,
      });
      toast.success("Rucher mis à jour");
      setEditing(false);
    } catch {
      toast.error("Modification impossible", {
        description: "Seuls les administrateurs peuvent modifier un rucher.",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayLat = hive.latitude;
  const displayLng = hive.longitude;
  const revenue = effectiveRevenue(hive.hiveCount, hive.price);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto gap-0 rounded-3xl border border-border/60 bg-card p-0 sm:rounded-3xl">
        <DialogTitle className="sr-only">Détail du rucher {hive.name}</DialogTitle>

        <div className="gradient-forest px-6 pb-6 pt-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">
            {placementLabel[hive.placement]} · {statusLabel[hive.status]}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">{hive.name}</h2>
          <p className="text-sm opacity-80">
            {hive.client} · {hive.site}
          </p>
        </div>

        <div className="space-y-4 px-6 py-6">
          {!editing ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Client" value={hive.client} />
                <Row label="Nombre de ruches" value={hive.hiveCount} />
                <Row label="Commune / ville" value={hive.site} />
                <Row label="Région" value={hive.region} />
                <Row label="Implantation" value={placementLabel[hive.placement]} />
                <Row label="Adresse exacte" value={hive.placementDetail} />
                <Row label="Apiculteur partenaire" value={hive.beekeeper} />
                <Row
                  label="Début d'engagement"
                  value={new Date(hive.startDate).toLocaleDateString("fr-FR")}
                />
                <Row
                  label="Fin d'engagement (3 ans)"
                  value={engagementEnd(hive.startDate).toLocaleDateString("fr-FR")}
                />
                <Row label="Coordonnées GPS" value={formatCoords(displayLat, displayLng)} />
                <Row
                  label="Prix total facturé"
                  value={`${formatEuro(revenue)} HT / an${hive.price != null ? " · remisé" : ""}`}
                />
                <Row
                  label="Tarif de base"
                  value={`${formatEuro(annualRevenue(hive.hiveCount))} HT (${formatEuro(PRICE_PER_HIVE)} / ruche)`}
                />
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background px-4 py-3">
                <EngagementRing
                  progress={engagementProgress(hive.startDate)}
                  size={48}
                  label={`${monthsRemaining(hive.startDate)} mois restants`}
                  sublabel="Engagement 3 ans"
                />
              </div>

              {displayLat != null && displayLng != null && (
                <div className="space-y-2">
                  <iframe
                    title={`Carte du rucher ${hive.name}`}
                    className="h-56 w-full rounded-2xl border border-border/60"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${displayLng - 0.01}%2C${displayLat - 0.008}%2C${displayLng + 0.01}%2C${displayLat + 0.008}&layer=mapnik&marker=${displayLat}%2C${displayLng}`}
                  />
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${displayLat}&mlon=${displayLng}#map=16/${displayLat}/${displayLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <MapPin className="size-3.5" /> Ouvrir dans la carte
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-name">Nom du rucher</Label>
                  <Input
                    id="d-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-client">Client</Label>
                  <Input
                    id="d-client"
                    value={form.client}
                    onChange={(e) => set("client", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-site">Commune / ville</Label>
                  <Input
                    id="d-site"
                    value={form.site}
                    onChange={(e) => set("site", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Région</Label>
                  <Select value={form.region} onValueChange={(v) => set("region", v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Implantation</Label>
                  <Select
                    value={form.placement}
                    onValueChange={(v) => set("placement", v as PlacementType)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENTS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-detail">Adresse exacte</Label>
                  <Input
                    id="d-detail"
                    value={form.placementDetail}
                    onChange={(e) => set("placementDetail", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-bk">Apiculteur partenaire</Label>
                  <Input
                    id="d-bk"
                    value={form.beekeeper}
                    onChange={(e) => set("beekeeper", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-count">Nombre de ruches</Label>
                  <Input
                    id="d-count"
                    type="number"
                    min={1}
                    value={form.hiveCount}
                    onChange={(e) => set("hiveCount", Math.max(1, Number(e.target.value) || 1))}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-date">Début d'engagement</Label>
                  <Input
                    id="d-date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-price">Prix total (€ HT / an)</Label>
                  <Input
                    id="d-price"
                    inputMode="decimal"
                    placeholder={String(annualRevenue(form.hiveCount))}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Coordonnées GPS</Label>
                  <button
                    type="button"
                    onClick={locate}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    <LocateFixed className="size-3.5" /> Position actuelle
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    inputMode="decimal"
                    placeholder="Latitude"
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                  <Input
                    inputMode="decimal"
                    placeholder="Longitude"
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                {!coordsValid && (
                  <p className="text-xs text-destructive">Coordonnées GPS invalides.</p>
                )}
                {!priceValid && (
                  <p className="text-xs text-destructive">Prix total invalide.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {isAdmin ? "Accès administrateur" : "Lecture seule"}
          </p>
          {isAdmin ? (
            editing ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  <X /> Annuler
                </Button>
                <Button variant="honey" onClick={save} disabled={!canSave}>
                  <Check /> Enregistrer
                </Button>
              </div>
            ) : (
              <Button variant="forest" onClick={() => setEditing(true)}>
                <Pencil /> Modifier
              </Button>
            )
          ) : (
            <Button variant="ghost" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
