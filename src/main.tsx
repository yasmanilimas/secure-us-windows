import { createRoot } from "react-dom/client";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
const SW_RESET_KEY = "__app_sw_reset_once__";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error ?? "Error desconocido");
};

const renderBootstrapError = (detail?: string) => {
  root.render(
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-border bg-card rounded-lg p-6 text-center space-y-3">
        <h1 className="text-2xl font-anton">Error al cargar</h1>
        <p className="text-muted-foreground">
          No se pudo inicializar la aplicación. Recarga la página o intenta de nuevo en unos segundos.
        </p>
        {detail ? <p className="text-xs text-muted-foreground break-words">Detalle: {detail}</p> : null}
      </div>
    </div>
  );
};

const resetLegacyServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (!registrations.length) return;

    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    if (navigator.serviceWorker.controller && !sessionStorage.getItem(SW_RESET_KEY)) {
      sessionStorage.setItem(SW_RESET_KEY, "1");
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(SW_RESET_KEY);
  } catch (error) {
    console.warn("Could not reset service workers/cache:", error);
  }
};

const bootstrap = async () => {
  try {
    await resetLegacyServiceWorkers();
    const { default: App } = await import("./App.tsx");

    root.render(
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    );
  } catch (error) {
    console.error("App bootstrap failed:", error);
    renderBootstrapError(getErrorMessage(error));
  }
};

void bootstrap();