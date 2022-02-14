import * as vec from './vec'
import * as box from './box'

/**
 * An immutable 2D matrix type.
 */
export type Mat = {
    a: number
    b: number
    c: number
    d: number
    tx: number
    ty: number
}

/**
 * Make a matrix.
 * @param a position(0,0)   sx*cos(alpha)
 * @param b position (0,1)  sx*sin(alpha)
 * @param c position (1,0)  -sy*sin(alpha)
 * @param d position (1,1)  sy*cos(alpha)
 * @param tx position (2,0) translation by x
 * @param ty position (2,1) translation by y
 * @returns a new `Matrix` from the given components.
 */
export function make(a: number, b: number, c: number, d: number, tx: number, ty: number): Mat {
    return {a, b, c, d, tx, ty}
}

/**
 * @returns a new identity matrix.
 */
export const identity = (): Mat => {
    return make(1, 0, 0, 1, 0, 0)
}

/**
 * @returns an exact copy of `m`
 */
export const dup = (m: Mat): Mat => {
    return {...m}
}

/**
 * @returns the multiplication of `m1` by `m2`.
 */
export const multiply = (m1: Mat, m2: Mat): Mat => {
    return make(
        m1.a * m2.a + m1.c * m2.b,
        m1.b * m2.a + m1.d * m2.b,
        m1.a * m2.c + m1.c * m2.d,
        m1.b * m2.c + m1.d * m2.d,
        m1.a * m2.tx + m1.c * m2.ty + m1.tx,
        m1.b * m2.tx + m1.d * m2.ty + m1.ty
    )
}

/**
 * @returns matrix `m` translated by `v`.
 */
export const translate = (m: Mat, v: vec.Vec): Mat => {
    return multiply(m, make(1, 0, 0, 1, v.x, v.y))
}

/**
 * @returns matrix `m` rotated by `angle` radians.
 */
export const rotate = (m: Mat, angle: number): Mat => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return multiply(m, make(cos, sin, -sin, cos, 0, 0))
}

/**
 * @returns matrix `m` scaled by `sx` and `sy`.
 */
export const scale = (m: Mat, sx: number, sy?: number): Mat =>  {
    return multiply(m, make(sx, 0, 0, sy||sx, 0, 0))
}

/**
 * @returns `v` transformed by `m`.
 */
export const transform = (m: Mat, v: vec.Vec): vec.Vec => {
    return {
        x: v.x * m.a + v.y * m.c + m.tx,
        y: v.x * m.b + v.y * m.d + m.ty
    }
}

/**
 * @returns a copy of `b` that's been transformed by `m`.
 */
export const transformBox = (m: Mat, b: box.Box): box.Box => {
    let upperLeft = vec.make(b.x, b.y)
    let lowerRight = vec.make(b.x+b.width, b.y+b.height)
    upperLeft = transform(m, upperLeft)
    lowerRight = transform(m, lowerRight)
    return box.make(upperLeft.x, upperLeft.y, lowerRight.x-upperLeft.x, lowerRight.y-upperLeft.y)
}