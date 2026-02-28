// Three.js Reusable Components
// Standard components for physics visualizations in Three.js

// Ensure Three.js is available in the global scope or imported if using modules
// For this project, we assume THREE is available globally via script tag

export const ThreeComponents = {
    /**
     * Ejes de coordenadas estándar (RGB)
     * X: Rojo, Y: Verde, Z: Azul
     */
    createStandardAxes(scene, origin = new THREE.Vector3(0, 0, 0), length = 4) {
        const axisLength = length;
        const axisHeadLength = length * 0.2; // 20% of length
        const axisHeadWidth = axisHeadLength * 0.4;

        // Eje X (Rojo)
        const arrowX = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            origin,
            axisLength,
            0xff0000,
            axisHeadLength,
            axisHeadWidth
        );
        scene.add(arrowX);

        // Eje Y (Verde)
        const arrowY = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            origin,
            axisLength,
            0x00ff00,
            axisHeadLength,
            axisHeadWidth
        );
        scene.add(arrowY);

        // Eje Z (Azul)
        const arrowZ = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            origin,
            axisLength,
            0x0000ff,
            axisHeadLength,
            axisHeadWidth
        );
        scene.add(arrowZ);

        return { arrowX, arrowY, arrowZ };
    },

    /**
     * Crea una etiqueta de texto usando un Sprite con CanvasTexture
     * @param {THREE.Scene} scene - La escena donde añadir la etiqueta
     * @param {string} text - El texto a mostrar
     * @param {THREE.Vector3} position - Posición de la etiqueta
     * @param {string} color - Color del texto (CSS string)
     * @param {number} size - Tamaño de la fuente en el canvas
     * @param {number} scale - Escala del sprite en el mundo 3D
     */
    createLabel(scene, text, position, color = 'white', size = 64, scale = 1.0) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `Bold ${size}px Arial`;
        const metrics = context.measureText(text);
        const width = metrics.width;
        const height = size;

        canvas.width = width;
        canvas.height = height;

        // Reset font after resizing canvas
        context.font = `Bold ${size}px Arial`;
        context.fillStyle = color;
        context.fillText(text, 0, size * 0.8); // Adjust baseline

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);

        sprite.position.copy(position);

        // Mantener aspect ratio
        const aspectRatio = width / height;
        sprite.scale.set(scale * aspectRatio, scale, 1);

        scene.add(sprite);
        return sprite;
    },

    /**
     * Ejes pequeños blancos con letras (estilo Plotly components)
     */
    createSmallWhiteAxes(scene, origin = new THREE.Vector3(0, 0, 0), length = 4) {
        const axisLength = length;
        const axisHeadLength = length * 0.2;
        const axisHeadWidth = axisHeadLength * 0.4;
        const color = 0xffffff;

        // Eje X
        const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, axisLength, color, axisHeadLength, axisHeadWidth);
        scene.add(arrowX);
        this.createLabel(scene, 'x', new THREE.Vector3(origin.x + axisLength + 0.5, origin.y, origin.z), 'white', 64, 1.0);

        // Eje Y
        const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, axisLength, color, axisHeadLength, axisHeadWidth);
        scene.add(arrowY);
        this.createLabel(scene, 'y', new THREE.Vector3(origin.x, origin.y + axisLength + 0.5, origin.z), 'white', 64, 1.0);

        // Eje Z
        const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, axisLength, color, axisHeadLength, axisHeadWidth);
        scene.add(arrowZ);
        this.createLabel(scene, 'z', new THREE.Vector3(origin.x, origin.y, origin.z + axisLength + 0.5), 'white', 64, 1.0);

        return { arrowX, arrowY, arrowZ };
    },

    /**
     * Línea infinita (Cilindro largo)
     * @param {THREE.Scene} scene
     * @param {number} length - Longitud de la línea (default 24)
     * @param {number} width - Ancho (radio) de la línea (default 0.1)
     * @param {number} color - Color Hex (default 0xffffff)
     */
    createInfiniteLine(scene, length = 24, width = 0.1, color = 0xffffff) {
        const geometry = new THREE.CylinderGeometry(width, width, length, 32);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const line = new THREE.Mesh(geometry, material);

        // Cylinder is created along Y axis. Rotate to align with Z if needed, 
        // but typically "infinite line" problems in this project use Z axis alignment.
        // If the problem assumes Z-axis line, we rotate 90deg around X.
        line.rotation.x = Math.PI / 2;

        scene.add(line);
        return line;
    }
};
