import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  createAppUser,
  deleteAppUser,
  listAppUsers,
  type AppUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Espace admin · Ruchers IziGreen" },
      {
        name: "description",
        content:
          "Espace administrateur IziGreen : création et suppression des accès utilisateurs au suivi des ruchers.",
      },
      { property: "og:title", content: "Espace admin · Ruchers IziGreen" },
      {
        property: "og:description",
        content: "Gestion des comptes autorisés à consulter le suivi des ruchers IziGreen.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, checked } = useIsAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setUsers(await listAppUsers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!isAdmin) {
      void navigate({ to: "/", replace: true });
      return;
    }
    void refresh();
  }, [checked, isAdmin, navigate, refresh]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createAppUser({ data: { email, password } });
      toast.success("Accès créé", { description: email });
      setEmail("");
      setPassword("");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (user: AppUser) => {
    if (!window.confirm(`Supprimer définitivement l'accès de ${user.email} ?`)) return;
    try {
      await deleteAppUser({ data: { userId: user.id } });
      toast.success("Accès supprimé");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    }
  };

  if (!checked || !isAdmin) return null;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-xl">
          <Link to="/">
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
        </Button>
        <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-semibold text-foreground md:text-4xl">
          <ShieldCheck className="size-7 text-primary" /> Espace administrateur
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Vous seul créez les accès. Chaque utilisateur voit exactement les mêmes données de
          ruchers ; seul l'administrateur peut ajouter ou supprimer des comptes.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card mt-8 rounded-3xl bg-card p-6"
      >
        <h2 className="font-display text-lg font-semibold text-foreground">
          Ajouter un utilisateur
        </h2>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              placeholder="prenom.nom@izigroup.fr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Mot de passe</Label>
            <Input
              id="new-password"
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              placeholder="8 caractères minimum"
            />
          </div>
          <Button type="submit" disabled={busy} className="rounded-2xl" size="lg">
            <UserPlus className="size-4" /> Créer l'accès
          </Button>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card mt-5 rounded-3xl bg-card p-6"
      >
        <h2 className="font-display text-lg font-semibold text-foreground">
          Utilisateurs ({users.length})
        </h2>
        <div className="mt-4 divide-y divide-border/50 rounded-2xl border border-border/60">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-foreground">
                  {u.email}
                  {u.isAdmin && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Administrateur
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Créé le {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  {u.lastSignInAt
                    ? ` · dernière connexion le ${new Date(u.lastSignInAt).toLocaleDateString("fr-FR")}`
                    : " · jamais connecté"}
                </p>
              </div>
              {!u.isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={() => void remove(u)}
                >
                  <Trash2 className="size-4" /> Supprimer
                </Button>
              )}
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
