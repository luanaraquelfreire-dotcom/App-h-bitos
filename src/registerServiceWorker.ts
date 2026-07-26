export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Ambiente sem suporte (ex: Artifact) ou sem servir os arquivos estáticos; ignora.
    });
  });
}
