---
description: Especificación del eje pequeño XYZ para visualizaciones Three.js
---

# Eje Pequeño XYZ - Especificación de Referencia

## Descripción
Este documento define el formato estándar para crear un eje pequeño con etiquetas X, Y, Z en visualizaciones Three.js. Este eje debe ser reutilizado en todos los problemas de física cuando se solicite.

## Código de Referencia

### 1. Creación de los Ejes (Three.js)

```javascript
// 3. Axes
const axesOrigin = new THREE.Vector3(0, 0, -48);  // Posición del origen (ajustar según necesidad)
const axisLength = 4;
const headLength = 1;
const headWidth = 0.5;

scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), axesOrigin, axisLength, 0xffffff, headLength, headWidth));  // X - Blanco
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), axesOrigin, axisLength, 0xffffff, headLength, headWidth));  // Y - Blanco
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), axesOrigin, axisLength, 0xffffff, headLength, headWidth));  // Z - Blanco
```

### 2. Etiquetas para los Ejes

```javascript
// Labels Data (agregar al array de labels existente)
const labels = [
  { text: "X", pos: new THREE.Vector3(3.5, 0, -48), color: "#ffffff" },   // Blanco
  { text: "Y", pos: new THREE.Vector3(0, 3.5, -48), color: "#ffffff" },   // Blanco
  { text: "Z", pos: new THREE.Vector3(0, 0, -44.5), color: "#ffffff" },   // Blanco
  // ... otras etiquetas
];
```

## Características del Eje

- **Tamaño**: Pequeño (4 unidades de longitud)
- **Colores**:
  - X: Blanco (`0xffffff` / `#ffffff`)
  - Y: Blanco (`0xffffff` / `#ffffff`)
  - Z: Blanco (`0xffffff` / `#ffffff`)
- **Componentes**:
  - Flechas con cabeza (ArrowHelper)
  - Etiquetas de texto (X, Y, Z) en blanco.
- **Posición**: Configurable mediante `axesOrigin`

## Uso

Cuando se solicite "crear un eje pequeño con X, Y, Z" en cualquier problema:

1. Copiar el código de creación de ejes
2. Ajustar `axesOrigin` a la posición deseada
3. Copiar las tres entradas de etiquetas al array `labels`
4. Ajustar las posiciones de las etiquetas según `axesOrigin`

## Ejemplo de Posicionamiento

Para posicionar el eje en una ubicación diferente, por ejemplo en `(10, 5, 0)`:

```javascript
const axesOrigin = new THREE.Vector3(10, 5, 0);
const axisLength = 4;
const headLength = 1;
const headWidth = 0.5;

scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), axesOrigin, axisLength, 0xffffff, headLength, headWidth));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), axesOrigin, axisLength, 0xffffff, headLength, headWidth));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), axesOrigin, axisLength, 0xffffff, headLength, headWidth));

// Labels
const labels = [
  { text: "X", pos: new THREE.Vector3(13.5, 5, 0), color: "#ffffff" },      // Blanco
  { text: "Y", pos: new THREE.Vector3(10, 8.5, 0), color: "#ffffff" },      // Blanco
  { text: "Z", pos: new THREE.Vector3(10, 5, 3.5), color: "#ffffff" },      // Blanco
  // ... otras etiquetas
];
```

## Notas Importantes

- Las etiquetas deben posicionarse aproximadamente en `axesOrigin + (axisLength - 0.5)` en la dirección correspondiente
- Mantener siempre los mismos colores para consistencia visual
- El eje usa `ArrowHelper` de Three.js para las flechas
- Las etiquetas requieren el sistema de proyección 2D sobre el canvas
