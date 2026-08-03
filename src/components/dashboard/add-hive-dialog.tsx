import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Hexagon, MapPin, Sparkles, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  FAREINS_BEEKEEPER,
  FAREINS_REGION,
  FAREINS_SITE,
  PLACEMENTS,
  PRICE_PER_HIVE,
  REGIONS,
  annualRevenue,
  formatEuro,
  type Hive,
  type PlacementType,
} from "@/lib/hives";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Le rucher", subtitle: "Identité & nombre de ruches", icon: Hexagon },
  { title: "L'implantation", subtitle: "Client & lieu d'installation", icon: MapPin },
  { title: "L'engagement", subtitle: "Contrat 3 ans", icon: Wallet },
];

type NewHive = Omit<Hive, "id" | "revenue" | "status">;
type Props = { onCreate: (hive: NewHive) => void };

const emptyForm = {
  name: "",
  site: "",
  client: "",
  region: REGIONS[0],
  placement: "site" as PlacementType,
  placementDetail: "",
  beekeeper: "",
  startDate: new Date().toISOString().slice(0, 10),
  hiveCount: 4,
};

export function AddHiveDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState(emptyForm);

  const placement = PLACEMENTS.find((p) => p.id === form.placement)!;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const selectPlacement = (id: PlacementType) =>
    setForm((f) => ({
      ...f,
      placement: id,
      placementDetail: id === "friche" ? "" : f.placementDetail,
      site: id === "friche" ? FAREINS_SITE : f.site === FAREINS_SITE ? "" : f.site,
      region: id === "friche" ? FAREINS_REGION : f.region,
      beekeeper:
        id === "friche"
          ? FAREINS_BEEKEEPER
          : f.beekeeper === FAREINS_BEEKEEPER
            ? ""
            : f.beekeeper,
    }));

  const canContinue =
    (step === 0 && form.name.trim().length > 1) ||
    (step === 1 && form.client.trim().length > 1 && form.site.trim().length > 1) ||
    step === 2;

  const reset = () => {
    setStep(0);
    setDirection(1);
    setForm({ ...emptyForm, startDate: new Date().toISOString().slice(0, 10) });
  };

  const submit = () => {
    onCreate({
      name: form.name.trim(),
      site: form.site.trim(),
      client: form.client.trim(),
      region: form.region,
      placement: form.placement,
      placementDetail: form.placementDetail.trim(),
      startDate: form.startDate,
      hiveCount: form.hiveCount,
    });
    setOpen(false);
    setTimeout(reset, 300);
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(reset, 300);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="honey" size="lg" className="rounded-2xl">
          <Sparkles /> Ajouter une ruche
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl border border-border/60 bg-card p-0 shadow-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">Ajouter une ruche</DialogTitle>

        <div className="gradient-forest px-6 pb-7 pt-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">
            Étape {step + 1} / {steps.length}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">{steps[step].title}</h2>
          <p className="text-sm opacity-75">{steps[step].subtitle}</p>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
            <motion.div
              className="gradient-honey h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs transition-colors duration-300",
                  i < step && "bg-honey text-honey-foreground",
                  i === step && "bg-primary-foreground/20 ring-2 ring-honey",
                  i > step && "bg-primary-foreground/10 opacity-60",
                )}
              >
                {i < step ? <Check className="size-4" /> : <s.icon className="size-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[300px] bg-card px-6 py-6">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du rucher</Label>
                    <Input
                      id="name"
                      autoFocus
                      placeholder="Rucher des Tilleuls"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Nombre de ruches installées · {form.hiveCount}</Label>
                    <Slider
                      value={[form.hiveCount]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={([v]) => set("hiveCount", v)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Soit environ {(form.hiveCount * 40000).toLocaleString("fr-FR")} abeilles
                      pollinisatrices (une colonie par ruche).
                    </p>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      autoFocus
                      placeholder="Groupe Verdier"
                      value={form.client}
                      onChange={(e) => set("client", e.target.value)}
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lieu d'installation</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {PLACEMENTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPlacement(p.id)}
                          className={cn(
                            "rounded-2xl border px-3 py-2.5 text-center text-sm font-medium transition-all duration-300",
                            form.placement === p.id
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {placement.needsAddress && (
                    <div className="space-y-2">
                      <Label htmlFor="detail">Adresse exacte</Label>
                      <Input
                        id="detail"
                        placeholder={placement.addressPlaceholder}
                        value={form.placementDetail}
                        onChange={(e) => set("placementDetail", e.target.value)}
                        className="h-11 rounded-xl bg-background"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="site">Commune / ville</Label>
                      <Input
                        id="site"
                        placeholder="Fareins (01)"
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
                  </div>

                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date de début d'engagement</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Chiffre d'affaires annuel (calculé)
                    </p>
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
                      {formatEuro(annualRevenue(form.hiveCount))} HT
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.hiveCount} ruche{form.hiveCount > 1 ? "s" : ""} ×{" "}
                      {formatEuro(PRICE_PER_HIVE)} HT / an
                    </p>
                  </div>
                  <div className="rounded-2xl bg-honey-soft/60 p-3 text-xs text-honey-foreground">
                    Engagement de 3 ans · fin prévue le{" "}
                    {new Date(
                      new Date(form.startDate).getTime() + 3 * 365.25 * 24 * 3600 * 1000,
                    ).toLocaleDateString("fr-FR")}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-card px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => {
              setDirection(-1);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
          >
            <ArrowLeft /> Retour
          </Button>
          {step < steps.length - 1 ? (
            <Button
              variant="forest"
              disabled={!canContinue}
              onClick={() => {
                setDirection(1);
                setStep((s) => s + 1);
              }}
            >
              Continuer <ArrowRight />
            </Button>
          ) : (
            <Button variant="honey" onClick={submit}>
              <Check /> Créer la ruche
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
