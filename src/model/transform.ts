import * as mat from "../geom/mat"

export type MatrixTransform = mat.Mat & {
    type: 'matrix'
}

export type TranslateTransform = {
    type: 'translate'
    x: number
    y: number
}

export type ScaleTransform = {
    type: 'scale'
    x: number
    y: number
}

export type RotateTransform = {
    type: 'rotate'
    a: number
    x: number
    y: number
}

export type SkewXTransform = {
    type: 'skewX'
    a: number
}

export type SkewYTransform = {
    type: 'skewY'
    a: number
}

/**
 * All possible transform types.
 */
export type Transform = MatrixTransform | TranslateTransform | ScaleTransform |
    RotateTransform | SkewXTransform | SkewYTransform

/**
 * A list of transforms that can be applied to a geometry.
 */
export type TransformList = Array<Transform>

/**
 * Converts a specific {Transform} into a generic {Mat} matrix.
 */
export function transform2Mat(t: Transform): mat.Mat {
    switch (t.type) {
        case 'matrix':
            return mat.make(t.a, t.b, t.c, t.d, t.tx, t.ty)
        case 'scale':
            return mat.make(t.x, 0, 0, t.y, 0, 0)
        case 'translate':
            return mat.make(1, 0, 0, 1, t.x, t.y)
        case 'rotate':
            const cos = Math.cos(t.a)
            const sin = Math.sin(t.a)
            return mat.make(cos, sin, -sin, cos, -t.x*cos + t.y*sin + t.x, -t.x*sin - t.y*cos + t.y)
        case 'skewX':
            return mat.make(1,0,Math.tan(t.a),1,0,0)
        case 'skewY':
            return mat.make(1,Math.tan(t.a),0,1,0,0)

    }
}

