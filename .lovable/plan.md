

## Cambios a realizar

### 1. Idioma predeterminado en espanol
En `src/contexts/LanguageContext.tsx`, cambiar el estado inicial del idioma de `'en'` a `'es'` (linea 667).

### 2. Boton de idioma mas minimalista con ambas banderas
En `src/components/Header.tsx`, redisenar el boton de cambio de idioma para que sea mas compacto y muestre ambas banderas. El diseno sera:
- Mostrar las dos banderas lado a lado (US | ES)
- La bandera activa tendra fondo destacado, la inactiva estara opaca
- Sin texto, solo las banderas para un look minimalista
- Ejemplo visual: `[🇺🇸 | 🇪🇸]` donde la activa se resalta

### Detalles tecnicos

**Archivo: `src/contexts/LanguageContext.tsx`**
- Linea 667: Cambiar `useState<Language>('en')` a `useState<Language>('es')`

**Archivo: `src/components/Header.tsx`**
- Reemplazar el boton actual de idioma (lineas 59-64) con un toggle compacto que muestre ambas banderas como dos botones pequenos adyacentes, donde el idioma activo se resalta visualmente con fondo y opacidad diferenciada

