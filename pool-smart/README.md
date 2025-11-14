# 🏊 Pool Smart - Cotizador de Piscinas

Aplicación web moderna para cotizar piscinas, calculando metros cuadrados de cerámicos, pisos térmicos y costo total basado en metros cúbicos.

## 🚀 Características

- **Formulario intuitivo** para ingresar dimensiones de la piscina
- **Soporte para múltiples tipos** de piscinas (rectangular, circular, oval)
- **Cálculos automáticos** de:
  - Metros cúbicos de volumen
  - Metros cuadrados de cerámicos necesarios
  - Metros cuadrados de pisos térmicos
  - Costo total estimado ($300 USD por m³)

## 📋 Requisitos

- Node.js (v18 o superior)
- npm o yarn

## 🛠️ Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

## ▶️ Ejecutar el Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Luego abre tu navegador en la URL que se muestra en la terminal (generalmente `http://localhost:5173`)

## 🏗️ Construir para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 📝 Uso

1. Selecciona el tipo de piscina (rectangular, circular u oval)
2. Ingresa las dimensiones:
   - Para piscinas rectangulares: largo, ancho y profundidad
   - Para piscinas circulares/ovales: diámetro mayor, diámetro menor y profundidad
3. Haz clic en "Calcular Cotización"
4. Revisa los resultados que incluyen:
   - Volumen en metros cúbicos
   - Metros cuadrados de cerámicos
   - Metros cuadrados de pisos térmicos
   - Costo total estimado

## 🎨 Tecnologías Utilizadas

- React 19
- Vite
- CSS3 con animaciones modernas
- Diseño responsive

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.
