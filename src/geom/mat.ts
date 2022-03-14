import * as vec from './vec'
import * as box from './box'
import * as trig from './trig'

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
export function translate(m: Mat, v: vec.Vec): Mat
export function translate(m: Mat, x: number, y: number): Mat
export function translate(m: Mat, vx: vec.Vec|number, y?: number): Mat {
    if (typeof vx == 'number') {
        return multiply(m, make(1, 0, 0, 1, vx, y || 0))
    }
    else {
        return multiply(m, make(1, 0, 0, 1, vx.x, vx.y))
    }
}


/**
 * @returns matrix `m` rotated by `angle` degrees.
 */
export const rotate = (m: Mat, angle: number): Mat => {
    const cos = trig.cos(angle)
    const sin = trig.sin(angle)
    return multiply(m, make(cos, sin, -sin, cos, 0, 0))
}

/**
 * @returns matrix `m` scaled by `sx` and `sy`.
 */
export const scale = (m: Mat, sx: number, sy?: number): Mat =>  {
    return multiply(m, make(sx, 0, 0, sy||sx, 0, 0))
}

/**
 * @returns matrix `m` skewed by `a` degrees along the x axis.
 */
export const skewX = (m: Mat, a: number): Mat => {
    return multiply(m, make(1,0,Math.tan(a),1,0,0))
}

/**
 * @returns matrix `m` skewed by `a` degrees along the y axis.
 */
export const skewY = (m: Mat, a: number): Mat => {
    return multiply(m, make(1,Math.tan(a),0,1,0,0))
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


/**
 * A builder that composes transformations to generate matrices (and their inverses).
 */
class Builder {
    private steps: Array<(mat: Mat) => Mat> = []
    private inverseSteps: Array<(mat: Mat) => Mat> = []

    /**
     * Translate the transformation by the given amount.
     */
    translate(x: number|vec.Vec, y?: number) {
        if (typeof x == 'object') {
            this.steps.push(m => translate(m, x))
            this.inverseSteps.unshift(m => translate(m, -x.x, -x.y))
        }
        else {
            this.steps.push(m => translate(m, x, y||0))
            this.inverseSteps.unshift(m => translate(m, -x, -(y||0)))
        }
        return this
    }

    /**
     * Rotates the transformation by the given amount.
     */
    rotate(deg: number) {
        this.steps.push(m => rotate(m, deg))
        this.inverseSteps.unshift(m => rotate(m, -deg))
        return this
    }

    /**
     * Scales the transformation by the given amount.
     */
    scale(factor: number) {
        this.steps.push(m => scale(m, factor))
        this.inverseSteps.unshift(m => scale(m, 1/factor))
        return this
    }

    /**
     * Builds the matrix.
     */
    build(): Mat {
        let m = identity()
        for (let step of this.steps) {
            m = step(m)
        }
        return m
    }

    /**
     * Builds the inverse of the given steps.
     * @returns the inverse transformation matrix
     */
    buildInverse(): Mat {
        let m = identity()
        for (let step of this.inverseSteps) {
            m = step(m)
        }
        return m
    }

}



/**
 * Creates a builder that composes transformations to generate matrices (and their inverses).
 */
export function builder(): Builder {
    return new Builder()
}