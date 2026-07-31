import { AlertTriangle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  engagementCompleted,
  engagementEnd,
  monthsRemaining,
  type Hive,
} from "@/lib/hives";

export function DeleteHiveDialog({ hive, onDelete }: { hive: Hive; onDelete: () => void }) {
  const early = !engagementCompleted(hive.startDate);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={`Supprimer ${hive.name}`}
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {early && <AlertTriangle className="size-5 text-honey-foreground" />}
            {early ? "Rupture anticipée de l'engagement" : `Supprimer ${hive.name} ?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {early ? (
              <>
                <strong className="text-foreground">{hive.name}</strong> est encore sous
                engagement de 3 ans : il reste{" "}
                <strong className="text-foreground">
                  {monthsRemaining(hive.startDate)} mois
                </strong>{" "}
                (fin prévue le {engagementEnd(hive.startDate).toLocaleDateString("fr-FR")}).
                La suppression retirera son chiffre d'affaires des indicateurs de l'année en
                cours. Cette action est définitive.
              </>
            ) : (
              <>
                L'engagement de 3 ans est arrivé à son terme. Le rucher sera retiré du suivi
                de l'année en cours. Cette action est définitive.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {early ? "Supprimer malgré tout" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
