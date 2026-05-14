# Guía de Estilos Visuales y Animaciones

Esta guía estandariza los elementos visuales, recuadros y animaciones utilizados en los problemas de física (Astro/LaTeX/Three.js). Utiliza esta referencia cuando solicites crear o modificar elementos interactivos.

## 1. Paleta de Colores Estandarizada (Monokai-based)

*   **Granate/Rosa (`--accent-red`: `#f92672`)**: Reservado para **Cargas y Fuerzas** ($Q$, $\lambda$, $\sigma$, $\vec{F}$, $Q_{\text{enc}}$).
*   **Amarillo/Crema (`--accent-green`: `#e6db74`)**: Reservado para **Geometría y Dimensiones** ($R$, $r$, $L$, distancias, áreas geométricas puras).
*   **Verde Lima (`#a6e22e`)**: Reservado para **Flujo y Leyes Físicas** (Flujo $\Phi$, Ley de Gauss, igualdades principales).
*   **Morado (`--accent-purple`: `#ae81ff`)**: Reservado para **Vectores y Direcciones** ($\vec{u}_r$, $\vec{\jmath}$, ángulos, componentes vectoriales).
*   **Azul (`--accent-blue`: `#66d9ef`)**: Reservado para **Campo Eléctrico / Magnético** resultante ($\vec{E}$, $\vec{B}$).

## 2. Recuadros con Líneas Discontinuas (Dashed Boxes)

Los recuadros se utilizan para aislar y resaltar términos matemáticos.

*   **Tipo "Inline" (Dentro de fórmulas LaTeX):**
    *   **Implementación:** Usando `\bbox[4px,border:1px dashed COLOR]`.
    *   **Estilo CSS asociado:** `border: 1px dashed COLOR; background: rgba(COLOR_R, COLOR_G, COLOR_B, 0.1);`.
    *   **Ejemplo:** `\bbox[4px,border:1px dashed #f92672]{Q_{enc}}` (Para un recuadro granate).
*   **Tipo "Caja de Resultado" (`.highlight-box`):**
    *   **Uso:** Para destacar el resultado final de un paso o apartado.
    *   **Estilo por defecto:** Recuadro grande centrado con fondo suave y borde discontinuo (usualmente granate o azul).
*   **Tipo "Interactivo Simple" (`.qenc-red-box-simple`, `.flux-box-target`):**
    *   **Uso:** Recuadros HTML que al pasar el ratón muestran un tooltip o inician una animación de LeaderLine.

## 3. Tooltips Animados y Persistentes

Existen dos sistemas de tooltips interactivos:

*   **Tooltips Globales Matemáticos (`#math-global-tooltip`):**
    *   **Comportamiento:** Siguen de forma fluida el movimiento del ratón.
    *   **Estilo:** Fondo oscuro (`#3e3d32`), texto claro, borde usualmente asociado al concepto (ej. Verde Lima para fórmulas de flujo).
    *   **Uso:** Para explicar detalladamente el desarrollo o desglose de un término técnico en las fórmulas matemáticas.
*   **Tooltips de Información Estáticos (`.tooltip-box` con `.hover-trigger`):**
    *   **Comportamiento:** Aparecen en una posición calculada (arriba, abajo, izquierda, derecha) relativa al elemento que los dispara, y se quedan fijos mientras el ratón está encima.
    *   **Estilo:** Borde amarillo/crema (`#e6db74`).
    *   **Uso:** Definiciones textuales breves (ej. "Ley de Gauss") o aclaraciones conceptuales simples.

## 4. Líneas de Conexión Animadas (LeaderLine)

Se utilizan para guiar el ojo del usuario de un término de una ecuación a su desarrollo en el siguiente paso o línea.

*   **Uso:** Conectan un elemento origen (`math-term-source`) con su destino (`math-term-target`).
*   **Estilo Estándar:**
    *   **Color:** Sigue la paleta definida arriba (Granate para cargas, Verde para flujo).
    *   **Grosor (size):** Típicamente `2`.
    *   **Ruta (path):** `'fluid'` o `'grid'`.
    *   **Animación:** Obligatorio el uso de `dash: { animation: true }` para simular el "movimiento" de los datos.

## 5. Divisores y Estructura de Página

*   **Divisor de Pasos (`.step-box`):** Contenedor principal de un bloque lógico. Fondo oscuro translúcido con borde gris (`--box-border`). Incluye una `.step-label` (ej. "PASO 1") en la esquina superior.
*   **Separador Vertical:** Utilizado para separar el texto explicativo (izquierda) de las ecuaciones matemáticas (derecha).
    *   **Implementación:** `border-right: 1px dashed #75715e;` (color de borde de caja estándar).
*   **Columnas:**
    *   Izquierda: Explicación textual alineada a la derecha, color atenuado (`#cfcfc2`).
    *   Derecha: Fórmulas matemáticas con MathJax centradas o alineadas a la izquierda según el flujo.

## 6. Ejes de Coordenadas XYZ (Standard White)

Contrario al estándar RGB de la industria, en este proyecto los ejes son **siempre blancos** para mantener una estética limpia y minimalista.

*   **Color Único:** Blanco puro (`0xffffff` / `#ffffff`).
*   **Implementación:** Usar `ThreeComponents.createSmallWhiteAxes(scene, origin, length)`.
*   **Proporciones:**
    *   Longitud: 4 unidades.
    *   Cabeza: 1 unidad de largo, 0.5 de ancho.
*   **Etiquetas:** Letras minúsculas (x, y, z) o mayúsculas (X, Y, Z) según el contexto, siempre en color blanco y posicionadas a `0.5` unidades del final de la punta.
*   **Propósito:** Referencia de orientación espacial sin distraer del fenómeno físico (que sí usa colores como Morado o Amarillo).
