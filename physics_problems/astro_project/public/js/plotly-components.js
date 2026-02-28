// Plotly Reusable Components
// Standard components for physics visualizations

export const PlotlyComponents = {
    /**
     * Ejes de coordenadas pequeños blancos estándar
     * Siempre en el mismo lugar, siempre blancos
     */
    createSmallWhiteAxes(origin = [0, 0, -5], length = 4) {
        const arrowLength = length;
        const arrowHeadLength = length * 0.25;

        return [
            // Eje X
            {
                type: 'scatter3d',
                mode: 'lines',
                x: [origin[0], origin[0] + arrowLength],
                y: [origin[1], origin[1]],
                z: [origin[2], origin[2]],
                line: { color: 'white', width: 3 },
                hoverinfo: 'none',
                showlegend: false
            },
            // Punta X
            {
                type: 'cone',
                x: [origin[0] + arrowLength],
                y: [origin[1]],
                z: [origin[2]],
                u: [1], v: [0], w: [0],
                sizemode: 'absolute',
                sizeref: arrowHeadLength,
                showscale: false,
                colorscale: [[0, 'white'], [1, 'white']],
                hoverinfo: 'none',
                showlegend: false
            },
            // Eje Y
            {
                type: 'scatter3d',
                mode: 'lines',
                x: [origin[0], origin[0]],
                y: [origin[1], origin[1] + arrowLength],
                z: [origin[2], origin[2]],
                line: { color: 'white', width: 3 },
                hoverinfo: 'none',
                showlegend: false
            },
            // Punta Y
            {
                type: 'cone',
                x: [origin[0]],
                y: [origin[1] + arrowLength],
                z: [origin[2]],
                u: [0], v: [1], w: [0],
                sizemode: 'absolute',
                sizeref: arrowHeadLength,
                showscale: false,
                colorscale: [[0, 'white'], [1, 'white']],
                hoverinfo: 'none',
                showlegend: false
            },
            // Eje Z
            {
                type: 'scatter3d',
                mode: 'lines',
                x: [origin[0], origin[0]],
                y: [origin[1], origin[1]],
                z: [origin[2], origin[2] + arrowLength],
                line: { color: 'white', width: 3 },
                hoverinfo: 'none',
                showlegend: false
            },
            // Punta Z
            {
                type: 'cone',
                x: [origin[0]],
                y: [origin[1]],
                z: [origin[2] + arrowLength],
                u: [0], v: [0], w: [1],
                sizemode: 'absolute',
                sizeref: arrowHeadLength,
                showscale: false,
                colorscale: [[0, 'white'], [1, 'white']],
                hoverinfo: 'none',
                showlegend: false
            }
        ];
    },

    /**
     * Línea infinita blanca (barra en eje Z)
     */
    createInfiniteLine(length = 10, width = 10) {
        return {
            type: 'scatter3d',
            mode: 'lines',
            name: 'Línea Infinita',
            x: [0, 0],
            y: [0, 0],
            z: [-length, length],
            line: { color: 'white', width: width },
            hoverinfo: 'none',
            showlegend: false
        };
    },

    /**
     * Órbita circular discontinua
     */
    createDashedOrbit(radius = 2.0, numPoints = 100, opacity = 0.3) {
        const x = [], y = [], z = [];
        for (let i = 0; i <= numPoints; i++) {
            const theta = (i / numPoints) * 2 * Math.PI;
            x.push(radius * Math.cos(theta));
            y.push(radius * Math.sin(theta));
            z.push(0);
        }

        return {
            type: 'scatter3d',
            mode: 'lines',
            name: 'Órbita',
            x: x,
            y: y,
            z: z,
            line: {
                color: `rgba(255, 255, 255, ${opacity})`,
                width: 2,
                dash: 'dash'
            },
            hoverinfo: 'none',
            showlegend: false
        };
    },

    /**
     * Partícula (esfera pequeña)
     */
    createParticle(position = [2, 0, 0], size = 4, color = 'white') {
        return {
            type: 'scatter3d',
            mode: 'markers',
            name: 'Partícula',
            x: [position[0]],
            y: [position[1]],
            z: [position[2]],
            marker: {
                size: size,
                color: color,
                opacity: 0.9
            },
            hoverinfo: 'none',
            showlegend: false
        };
    },

    /**
     * Vector de fuerza (cono)
     */
    createForceVector(position, direction, color, sizeref = 0.4) {
        return {
            type: 'cone',
            x: [position[0]],
            y: [position[1]],
            z: [position[2]],
            u: [direction[0]],
            v: [direction[1]],
            w: [direction[2]],
            sizemode: 'absolute',
            sizeref: sizeref,
            showscale: false,
            colorscale: [[0, color], [1, color]],
            hoverinfo: 'none',
            showlegend: false
        };
    },

    /**
     * Etiqueta de texto 3D
     */
    createTextLabel(position, text, color = 'white', size = 16) {
        return {
            type: 'scatter3d',
            mode: 'text',
            x: [position[0]],
            y: [position[1]],
            z: [position[2]],
            text: [text],
            textfont: {
                size: size,
                color: color,
                family: 'Arial, sans-serif'
            },
            hoverinfo: 'none',
            showlegend: false
        };
    },

    /**
     * Configuración de cámara estándar
     */
    getStandardCamera() {
        return {
            eye: { x: 1.8, y: 1.0, z: 1.8 },
            center: { x: 0, y: 0, z: 0 },
            up: { x: 0, y: 0, z: 1 }
        };
    },

    /**
     * Layout base estándar
     */
    getBaseLayout(xRange = [-5, 5], yRange = [-5, 5], zRange = [-10, 10]) {
        return {
            scene: {
                camera: this.getStandardCamera(),
                xaxis: { visible: false, range: xRange },
                yaxis: { visible: false, range: yRange },
                zaxis: { visible: false, range: zRange },
                aspectmode: 'cube',
                bgcolor: 'rgba(0,0,0,0)'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
        };
    },

    /**
     * Configuración estándar de Plotly
     */
    getStandardConfig() {
        return {
            displayModeBar: false,
            responsive: true
        };
    }
};
