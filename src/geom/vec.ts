/**
 * Immutable 2D vector, the only kind.
 */
export type Vec = {
    readonly x: number
    readonly y: number
}

/**
 * Makes a new vector from raw x/y values.
 */
export function make(x: number, y: number): Vec
export function make(xy: Array<number>): Vec
export function make(xxy: number | Array<number>, y?: number): Vec {
    if (Array.isArray(xxy)) {
        if (xxy.length == 2) {
            return {x: xxy[0], y: xxy[1]}
        }
        throw(`Raw vector arrays must have exactly 2 elements, not ${xxy.length}: ${xxy}`)
    }
    return {x: xxy, y: y!}
}

/**
 * @returns a new identity vector.
 */
export const identity = (): Vec => {
    return {x: 0, y: 0}
}

/**
 * @returns a duplicate of `v`
 */
export const dup = (v: Vec): Vec => {
    return {... v}
}

/**
 * @returns a new origin vector
 */
export const origin = (): Vec => {
    return {x: 0, y: 0}
}

/**
 * @returns `v1` + `v2`
 */
export const add = (v1: Vec, v2: Vec): Vec => {
    return {x: v1.x + v2.x, y: v1.y + v2.y}
}

/**
 * @returns `v1` - `v2`
 */
export const subtract = (v1: Vec, v2: Vec): Vec => {
    return {x: v1.x - v2.x, y: v1.y - v2.y}
}

/**
 * @returns the dot product of `v1` and `v2`
 */
export const dot = (v1: Vec, v2: Vec): number => {
    return v1.x*v2.x + v1.y*v2.y
}

/**
 * @returns the length of a vector.
 */
export const len = (v: Vec): number => {
    return Math.sqrt(dot(v, v))
}

/**
 * @returns a normalized (length=1) version of the vector.
 */
export const norm = (v: Vec): Vec => {
    const l = len(v)
    return {x: v.x/l, y: v.y/l}
}

/**
 * @returns the mirror of `v` about the origin.
 */
export const mirror = (v: Vec): Vec => {
    return {x: -v.x, y: -v.y}
}

/**
 * Coordinates within this ratio of each other are considered the same (or mirrored).
 */
 export const EpsilonRatio = 0.0001

 /**
  * @returns `true` if `v1` and `v2` are the opposite of each other (within `EpsilonRatio`).
  */
 export const isMirror = (v1: Vec, v2: Vec): boolean => {
     const len1 = len(v1)
     const len2 = len(v2)
     const maxLen = Math.max(len1, len2)
     return maxLen > 0 && 
        Math.abs(len1-len2)/maxLen < EpsilonRatio && 
        Math.abs(v1.x+v2.x)/maxLen < EpsilonRatio
 }