const math = {
    step0_lambda: String.raw`\(\lambda\)`,
    step0_units: String.raw`\(\left[\frac { \unit { C } } { \unit { m } } \right]\)`,
    step0_L: String.raw`\(L\)`,
    step0_d: String.raw`\(d\)`,
    step0_Q: String.raw`\(\mathrm { Q } \)`,

    step1_E: String.raw`\(\vec{E}\)`,
    step1_S: String.raw`\(S\)`,
    step1_r: String.raw`\(r\)`,
    step1_Lp: String.raw`\(L'\)`,
    step1_flux_eq: String.raw`
        \begin{align*}
        \oint_S \vec{E} \cdot d\vec{S} &= \oint_S E dS = E \oint_S dS =
        \class{math-term-source-2}{E (2\pi r L')}
        \end{align*}`,
    step1_lambda_units: String.raw`\(\lambda\)`,
    step1_Qm: String.raw`\(\frac{Q}{m}\)`,
    step1_Qenc_eq: String.raw`
        \begin{align*}
        \mathrm{Q}_{\text{enc}} &= \class{math-term-source}{\lambda L'}
        \end{align*}`,
    step1_gauss_E: String.raw`\(E\)`,
    step1_gauss_eq: String.raw`
        \begin{align*}
        \class{math-term-target-2}{\bbox[4px,border:1px dashed
        #a6e22e;border-radius:8px,#272822]{E (2\pi r L')}} &=
        \frac{\class{math-term-target}{\bbox[4px,border:1px dashed
        #f92672;border-radius:8px,#272822]{\lambda L'}}}{\varepsilon_0} \\[10pt]
        E &= \frac{\lambda}{2\pi \varepsilon_0 r} \quad
        \left[\frac{\unit{N}}{\unit{C}}\right]
        \end{align*}`,
    step1_final_eq: String.raw`
        \begin{align*}
        \vec{E} &= \frac{\lambda}{2\pi \varepsilon_0} \class{hover-trigger radial-tooltip}{\bbox[4px,border:1px dashed
        #f92672;border-radius:8px,#3d292e]{\frac{\hat{r}}{r}}} \quad
        \left[\frac{\unit{N}}{\unit{C}}\right]
        \end{align*}`,

    step2_vec_eq: String.raw`
        \begin{align*}
        \vec{E} &= \frac{\lambda}{2\pi \varepsilon_0} \class{hover-trigger step2-j-tooltip}{\bbox[4px,border:1px dashed
        #f92672;border-radius:8px,#3d292e]{\frac{\vec{\jmath}}{y}}} \quad
        \left[\frac{\unit{N}}{\unit{C}}\right]
        \end{align*}`,

    step3_dq: String.raw`\(dq\)`,
    step3_dy: String.raw`\(dy\)`,
    step3_y: String.raw`\(y\)`,
    step3_dq_eq: String.raw`
        \begin{align*}
        dq &= \frac{Q}{L} dy
        \end{align*}`,
    step3_dF_vec: String.raw`\(d\vec{F}\)`,
    step3_dF_eq: String.raw`
        \begin{align*}
        d\vec{F} = \vec{E} dq &= \left( \frac{\lambda}{2\pi \varepsilon_0 y} \vec{\jmath} \right) \left( \frac{Q}{L} dy \right) \\
              &= \left( \frac{Q\lambda}{2\pi \varepsilon_0 L} \right) \frac{dy}{y} \vec{\jmath}
        \end{align*}`,
    step3_integral_eq: String.raw`
        \begin{align*}
        \vec{F} &= \int_{d}^{d+L} d\vec{F} = \int_{d}^{d+L} \left( \frac{Q\lambda}{2\pi \varepsilon_0 L} \right) \frac{dy}{y} \vec{\jmath} \\[10pt]
        &= \left( \frac{Q\lambda}{2\pi \varepsilon_0 L} \right) \vec{\jmath} \class{hover-trigger integral-tooltip}{\bbox[4px,border:1px dashed
        #f92672;border-radius:8px,#3d292e]{\int_{d}^{d+L} \frac{dy}{y}}} \\[10pt]
        &= \left( \frac{Q\lambda}{2\pi \varepsilon_0 L} \right) \ln\left( \frac{d+L}{d} \right) \vec{\jmath} \quad \left[ \unit{N} \right]
        \end{align*}`,
    gauss_tooltip_eq: String.raw`$$ \oint \vec{E} \cdot d\vec{S} = \frac{Q_{\text{enc}}}{\varepsilon_0} $$`,
    radial_tooltip_text: String.raw`Ponemos $\hat{r}$ porque el campo es radial`,
    step2_tooltip_text: String.raw`En el plano XY, donde se encuentra la barra, el campo $\vec{E}$, tiene dirección y sentido $\vec{\jmath}$`,
    integral_tooltip_text: String.raw`$$ \int_a^b \frac{dy}{y} = \ln\left(\frac{b}{a}\right) $$`,
    step3_lim_lower: String.raw`\(y=d\)`,
    step3_lim_upper: String.raw`\(y=d+L\)`,
    step3_y0: String.raw`\(y=0\)`,
    step1_Lp_tooltip_text: String.raw`Esta longitud es diferente a la longitud de la barra, que es $L$. No se tienen que confundir.`,
    step4_final_eq: String.raw`
        \begin{align*}
        \vec{F} &= \left( \frac{Q\lambda}{2\pi \varepsilon_0 L} \right) \ln\left( \frac{d+L}{d} \right) \vec{\jmath}
        \end{align*}`,
    step4_parallel_eq: String.raw`$$ \vec{F}_{\parallel} = Q \cdot \vec{E} = \frac{Q\lambda}{2\pi \varepsilon_0 d} \hat{\imath} $$`
};
console.log("Syntax is OK");
