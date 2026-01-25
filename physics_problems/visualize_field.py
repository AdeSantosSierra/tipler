import numpy as np
import plotly.graph_objects as go

# Configure Monokai colors
BG_COLOR = '#272822'
TEXT_COLOR = '#f8f8f2'
ACCENT_GREEN = '#e6db74'

def generate_interactive_visualization():
    # --- 1. Grid generation (X = Long, YZ = Radial) ---
    r_vals = np.linspace(0.4, 3.0, 8) # Reduced to 8
    theta_vals = np.linspace(0, 2*np.pi, 16, endpoint=False) # Reduced to 16
    x_vals = np.linspace(-2.5, 2.5, 8) # Reduced to 8
    
    # Separate point clouds:
    # 1. In-Plane Positive Y (y > 0, |z| < 0.1) -> The focus of Projection
    # 2. In-Plane Negative Y (y <= 0, |z| < 0.1)
    # 3. Out-of-Plane (|z| >= 0.1)
    
    X_in_pos, Y_in_pos, Z_in_pos, C_in_pos, S_in_pos = [], [], [], [], []
    X_in_neg, Y_in_neg, Z_in_neg, C_in_neg, S_in_neg = [], [], [], [], []
    X_out, Y_out, Z_out, C_out, S_out = [], [], [], [], []

    for x in x_vals:
        for r in r_vals:
            for theta in theta_vals:
                # Radial in YZ plane
                y = r * np.cos(theta)
                z = r * np.sin(theta)
                
                # Magnitude ~ 1/r
                mag = 1.0 / r
                
                # Classification
                if abs(z) < 0.1:
                    if y > 0:
                        X_in_pos.append(x); Y_in_pos.append(y); Z_in_pos.append(z); C_in_pos.append(mag); S_in_pos.append(mag*8)
                    else:
                        X_in_neg.append(x); Y_in_neg.append(y); Z_in_neg.append(z); C_in_neg.append(mag); S_in_neg.append(mag*8)
                else:
                    X_out.append(x); Y_out.append(y); Z_out.append(z); C_out.append(mag); S_out.append(mag*8)

    # Create figure
    fig = go.Figure()

    # --- 0. Infinite Line (X-Axis) ---
    fig.add_trace(go.Scatter3d(
        x=[-3, 3], y=[0, 0], z=[0, 0],
        mode='lines',
        line=dict(color='white', width=10),
        name='Línea Infinita',
        hoverinfo='none'
    ))

    # --- 1. Field In-Plane Positive Y (The Survivor) ---
    fig.add_trace(go.Scatter3d(
        x=X_in_pos, y=Y_in_pos, z=Z_in_pos,
        mode='markers',
        marker=dict(
            size=S_in_pos, color=C_in_pos, colorscale='Matter', 
            opacity=0.5, 
            symbol='circle',
            line=dict(width=0)
        ),
        name='Campo (XY Pos)',
        hoverinfo='none'
    ))

    # --- 2. Field In-Plane Negative Y ---
    fig.add_trace(go.Scatter3d(
        x=X_in_neg, y=Y_in_neg, z=Z_in_neg,
        mode='markers',
        marker=dict(
            size=S_in_neg, color=C_in_neg, colorscale='Matter', 
            opacity=0.5, 
            symbol='circle',
            line=dict(width=0)
        ),
        name='Campo (XY Neg)',
        hoverinfo='none'
    ))

    # --- 3. Field Out-of-Plane ---
    fig.add_trace(go.Scatter3d(
        x=X_out, y=Y_out, z=Z_out,
        mode='markers',
        marker=dict(
            size=S_out, color=C_out, colorscale='Matter', 
            opacity=0.5, 
            symbol='circle',
            line=dict(width=0)
        ),
        name='Campo (Resto)',
        hoverinfo='none'
    ))

    # --- 4. Gaussian Cylinder ---
    # Meshgrid: X linear, Theta for YZ
    cyl_x = np.linspace(-2.0, 2.0, 20)
    cyl_theta = np.linspace(0, 2*np.pi, 40)
    cyl_theta_grid, cyl_x_grid = np.meshgrid(cyl_theta, cyl_x)
    
    # Y and Z depend on Theta
    cyl_y = 1.0 * np.cos(cyl_theta_grid) # Radius 1.0
    cyl_z = 1.0 * np.sin(cyl_theta_grid)
    
    fig.add_trace(go.Surface(
        x=cyl_x_grid, y=cyl_y, z=cyl_z,
        surfacecolor=np.ones_like(cyl_x_grid),
        colorscale=[[0, 'white'], [1, 'white']],
        showscale=False,
        opacity=0.3, # Attenuated visibility
        name='Superficie Gaussiana',
        hoverinfo='none'
    ))

    # --- 5. Finite Bar (Y-Axis) - Initially Visible (But Controllable) ---
    d = 1.5   # Distance from X-axis
    L = 2.0   # Length along Y
    
    # Trace 5: The Bar itself (White)
    fig.add_trace(go.Scatter3d(
        x=[0, 0], y=[d, d + L], z=[0, 0],
        mode='lines',
        line=dict(color='white', width=8), 
        name='Barra L',
        opacity=1.0, 
        hoverinfo='name'
    ))
    
    # Trace 6: Dimension Line (d) - Dashed
    fig.add_trace(go.Scatter3d(
        x=[0, 0], y=[0, d], z=[0, 0],
        mode='lines',
        line=dict(color='white', width=3, dash='dash'),
        name='Distancia d',
        opacity=1.0,
        hoverinfo='none'
    ))
    
    # Trace 7: Labels (Plain Text)
    fig.add_trace(go.Scatter3d(
        x=[0, 0], 
        y=[d/2, d + L/2], 
        z=[0.4, 0.4], # Slight Z offset for visibility
        mode='text',
        text=['d', 'L'],
        textfont=dict(color='white', size=20),
        name='Etiquetas',
        opacity=1.0, 
        hoverinfo='none'
    ))

    # --- 6. Differential Element (dq) & Force (dF) ---
    dq_y = d + L/3.0
    dq_h = 0.08 # Half-height of the differential slice
    
    # Trace 8: Segment dq (White "Slice")
    # Modeled as a short line segment thicker than the main bar
    fig.add_trace(go.Scatter3d(
        x=[0, 0], y=[dq_y - dq_h, dq_y + dq_h], z=[0, 0],
        mode='lines+text',
        line=dict(color='white', width=14), # Thicker than bar (8)
        text=['dq'],
        textfont=dict(color='white', size=24), # Larger text
        textposition="middle right",
        name='Carga dq',
        opacity=0.0, # Hidden initially
        hoverinfo='name'
    ))

    # Trace 9: Vector dF (Line) - Positive Y Direction - RED
    force_len = 0.8
    fig.add_trace(go.Scatter3d(
        x=[0, 0], y=[dq_y, dq_y + force_len], z=[0, 0],
        mode='lines',
        line=dict(color='#ff5555', width=6), # Red
        name='Vector dF',
        opacity=0.0, # Hidden initially
        hoverinfo='name'
    ))
    
    # Trace 10: Vector dF (Cone) - RED
    fig.add_trace(go.Cone(
        x=[0], y=[dq_y + force_len], z=[0],
        u=[0], v=[1], w=[0], # Direction +Y
        sizemode="absolute", sizeref=0.15, anchor="tail",
        showscale=False, colorscale=[[0, '#ff5555'], [1, '#ff5555']],
        name='Vector dF',
        opacity=0.0, # Hidden initially
        hoverinfo='none'
    ))

    # Trace 11: Label dF - RED
    fig.add_trace(go.Scatter3d(
        x=[0], y=[dq_y + force_len/2], z=[0.2],
        mode='text',
        text=['dF'], 
        textfont=dict(color='#ff5555', size=18),
        name='Etiqueta dF',
        opacity=0.0, 
        hoverinfo='none'
    ))

    # --- 7. Custom Mini-Axes (At Tip of X-Bar) ---
    ax_o = np.array([3.2, 0.0, 0.0]) # Tip of Infinite Line
    ax_len = 0.5
    
    def add_axis(direction, name):
        color = 'white'
        end = ax_o + direction * ax_len
        fig.add_trace(go.Scatter3d(
            x=[ax_o[0], end[0]], 
            y=[ax_o[1], end[1]], 
            z=[ax_o[2], end[2]],
            mode='lines',
            line=dict(color=color, width=4),
            hoverinfo='none'
        ))
        fig.add_trace(go.Cone(
            x=[end[0]], y=[end[1]], z=[end[2]],
            u=[direction[0]], v=[direction[1]], w=[direction[2]],
            sizemode="absolute", sizeref=0.1, anchor="tail",
            showscale=False, colorscale=[[0, color], [1, color]],
            hoverinfo='none'
        ))
        fig.add_trace(go.Scatter3d(
            x=[end[0] + direction[0]*0.1], 
            y=[end[1] + direction[1]*0.1], 
            z=[end[2] + direction[2]*0.1],
            mode='text',
            text=[name],
            textfont=dict(color=color, size=12), 
            hoverinfo='none'
        ))

    add_axis(np.array([1,0,0]), 'X') 
    add_axis(np.array([0,1,0]), 'Y') 
    add_axis(np.array([0,0,1]), 'Z')

    # --- Layout ---
    camera_settings = dict(
        up=dict(x=0, y=1, z=0), 
        center=dict(x=0, y=0, z=0),
        eye=dict(x=0, y=0, z=2.0) # Look from top (Z)
    )

    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        scene=dict(
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            zaxis=dict(visible=False),
            aspectmode='data',
            bgcolor='rgba(0,0,0,0)',
            camera=camera_settings,
            dragmode='orbit'
        ),
        margin=dict(l=0, r=0, b=0, t=0),
        showlegend=False,
        autosize=True,
    )
    
    output_path = 'final_interactive.html'
    config = {'displayModeBar': True, 'responsive': True, 'scrollZoom': True, 'staticPlot': False}
    fig.write_html(output_path, config=config, include_mathjax='cdn')
    
    # Inject CSS/JS
    with open(output_path, 'r') as f: content = f.read()
    content = content.replace('<body>', '<body style="margin: 0; padding: 0; background-color: transparent; overflow: hidden;">')
    
    custom_js = """
    <script>
        window.addEventListener('message', function(event) {
            const plotDiv = document.getElementsByClassName('plotly-graph-div')[0];
            if (!plotDiv) return;
            
            if (event.data && event.data.type === 'scroll') {
                // Trace 1: Field In-Plane Pos Y
                if (event.data.fieldPosOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { 'marker.opacity': event.data.fieldPosOpacity }, [1]);
                }
                // Trace 2: Field In-Plane Neg Y
                if (event.data.fieldNegOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { 'marker.opacity': event.data.fieldNegOpacity }, [2]);
                }
                // Trace 3: Field Out-of-Plane
                if (event.data.fieldOutOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { 'marker.opacity': event.data.fieldOutOpacity }, [3]);
                }
                // Trace 4: Gaussian Cylinder
                if (event.data.cylOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { opacity: event.data.cylOpacity }, [4]);
                }
                // Traces 5, 6, 7: Finite Bar Components
                if (event.data.barOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { opacity: event.data.barOpacity }, [5, 6, 7]);
                }
                // Traces 8, 9, 10, 11: dq and dF components
                // 8: dq point (Scatter)
                // 9: dF line (Scatter)
                // 10: dF cone (Cone)
                // 11: dF label (Scatter)
                if (event.data.dqOpacity !== undefined) {
                     Plotly.restyle(plotDiv, { opacity: event.data.dqOpacity, 'marker.opacity': event.data.dqOpacity }, [8, 9, 10, 11]);
                }
            }
        });
    </script>
    </body>
    """
    
    content = content.replace('</body>', custom_js)

    with open(output_path, 'w') as f: f.write(content)
    print(f"Interactive visualization saved to {output_path}")

if __name__ == "__main__":
    generate_interactive_visualization()
