import { createFileRoute } from "@tanstack/react-router";

import { bootstrapOwner } from "@/lib/admin.functions";

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async () => {
        const result = await bootstrapOwner();
        return Response.json(result);
      },
    },
  },
});
