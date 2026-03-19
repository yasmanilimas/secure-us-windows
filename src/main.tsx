import { createRoot } from "react-dom/client";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const renderBootstrapError = () => {
  root.render(
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-border bg-card rounded-lg p-6 text-center space-y-3">
        <h1 className="text-2xl font-anton">Error al cargar</h1>
        <p className="text-muted-foreground">
          No se pudo inicializar la aplicación. Recarga la página o intenta de nuevo en unos segundos.
        </p>
      </div>
    </div>
  );
};

const bootstrap = async () => {
  try {
    const { default: App } = await import("./App.tsx");

    root.render(
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    );
  } catch (error) {
    console.error("App bootstrap failed:", error);
    renderBootstrapError();
  }
};

void bootstrap();
