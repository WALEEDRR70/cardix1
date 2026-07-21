import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { isSupportedLocale } from "@/i18n/config";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) throw notFound();
    return { locale: params.lang };
  },
  component: () => <Outlet />,
});
