
/**
 * Utilities for the Fluid Sizing System
 */

// Constants matching CSS variables
const FLUID_MIN_WIDTH = 320
const FLUID_MAX_WIDTH = 430

/**
 * Generates a CSS clamp() string for a property that scales linearly 
 * between a min value (at 320px) and max value (at 430px).
 * 
 * @param minPx Value in pixels at 320px viewport
 * @param maxPx Value in pixels at 430px viewport
 * @returns string CSS clamp() function
 */
export function fluidClamp(minPx: number, maxPx: number): string {
    const slope = (maxPx - minPx) / (FLUID_MAX_WIDTH - FLUID_MIN_WIDTH)
    const yAxisIntersection = -FLUID_MIN_WIDTH * slope + minPx

    // Convert to rems for accessibility (assuming 16px base)
    const minRem = minPx / 16
    const maxRem = maxPx / 16
    const slopeVw = slope * 100
    const intersectionRem = yAxisIntersection / 16

    return `clamp(${minRem}rem, ${intersectionRem}rem + ${slopeVw}vw, ${maxRem}rem)`
}

/**
 * Returns a CSS calc string using the custom --scale-factor variable.
 * This is useful when you want to use the app's synchronized fluid system
 * rather than independent clamps.
 * 
 * @param minRem Base value in rems (at 320px)
 * @param addedRem How much to add at max scale (430px). 
 *                 e.g. min 1rem, max 1.5rem -> addedRem = 0.5
 */
export function fluidCalc(minRem: number, addedRem: number): string {
    return `calc(${minRem}rem + ${addedRem} * 1rem * var(--scale-factor))`
}
