import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // ✅ Asegúrate de que la ruta sea relativa a la raíz del proyecto
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return { messages };
  } catch (error) {
    console.error(`❌ No se pudo cargar el archivo de idioma: ${locale}`, error);
    // Evita romper el build si falta un idioma
    return { messages: {} };
  }
});
