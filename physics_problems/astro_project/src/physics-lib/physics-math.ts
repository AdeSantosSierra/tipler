// Common Physics Formulas and Math Symbols for Cylindrical Symmetry
export const symbols = {
    lambda: String.raw`\lambda`,
    sigma: (n: number | string) => String.raw`\sigma_{${n}}`,
    rho: String.raw`\rho`,
    epsilon0: String.raw`\varepsilon_0`,
    R: (n: number | string) => n === '' ? 'R' : String.raw`R_{${n}}`,
    r: 'r',
    E: 'E',
    vecE: String.raw`\vec{E}`,
    ur: String.raw`\vec{u}_r`,
    phi: String.raw`\Phi`,
    P: 'P',
    integralGauss: String.raw`\oint_S \vec{E} \cdot d\vec{S}`,
    units: String.raw`\left[\frac{\text{N}}{\text{C}}\right]`
};

export function cylindricalFlux(E = 'E', r = 'r', L = 'L') {
    return String.raw`${E} (2\pi ${r} ${L})`;
}

/**
 * Surface charge Q_enc = sum( sigma_i * Area_i )
 */
export function cylindricalTotalCharge(shells: { sigma: string, R: string }[], L = 'L') {
    if (shells.length === 0) return '0';
    const terms = shells.map(s => String.raw`${s.sigma} (2\pi ${s.R} ${L})`);
    if (shells.length === 1) return terms[0];
    return String.raw`2\pi ${L} (${shells.map(s => String.raw`${s.sigma} ${s.R}`).join(' + ')})`;
}

/**
 * Volume charge Q_enc = rho * Volume
 */
export function cylindricalVolumeCharge(rho: string, r: string, L = 'L') {
    return String.raw`${rho} (\pi ${r}^2 ${L})`;
}

/**
 * Field magnitude for surface charges: E = Q_enc / (eps0 * 2pi * r * L)
 */
export function cylindricalTotalFieldMag(shells: { sigma: string, R: string }[], r = 'r', eps = symbols.epsilon0) {
    if (shells.length === 0) return '0';
    const numerator = shells.map(s => String.raw`${s.sigma} ${s.R}`).join(' + ');
    return String.raw`\frac{${numerator}}{${eps} ${r}}`;
}

/**
 * Field magnitude for volume charges
 */
export function cylindricalVolumeFieldMag(rho: string, R: string, r: string, isInside: boolean, eps = symbols.epsilon0) {
    if (isInside) {
        // E = (rho * pi * r^2 * L) / (eps0 * 2pi * r * L) = (rho * r) / (2 * eps0)
        return String.raw`\frac{${rho} ${r}}{2 ${eps}}`;
    } else {
        // E = (rho * pi * R^2 * L) / (eps0 * 2pi * r * L) = (rho * R^2) / (2 * eps0 * r)
        return String.raw`\frac{${rho} ${R}^2}{2 ${eps} ${r}}`;
    }
}

export function cylindricalVectorField(mag: string, unitVec = symbols.ur) {
    return String.raw`${mag} ${unitVec}`;
}

export function withTooltip(content: string, className: string) {
    return String.raw`\class{${className}}{${content}}`;
}
