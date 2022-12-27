import * as tuff from 'tuff-core'
import { Mat } from 'tuff-core/mat'
const mat = tuff.mat
const trig = tuff.trig

export type MatrixTransform = Mat & {
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
export function transform2Mat(t: Transform): Mat {
    switch (t.type) {
        case 'matrix':
            return mat.make(t.a, t.b, t.c, t.d, t.tx, t.ty)
        case 'scale':
            return mat.make(t.x, 0, 0, t.y, 0, 0)
        case 'translate':
            return mat.make(1, 0, 0, 1, t.x, t.y)
        case 'rotate':
            const cos = trig.cos(t.a)
            const sin = trig.sin(t.a)
            return mat.make(cos, sin, -sin, cos, -t.x*cos + t.y*sin + t.x, -t.x*sin - t.y*cos + t.y)
        case 'skewX':
            return mat.make(1,0,trig.tan(t.a),1,0,0)
        case 'skewY':
            return mat.make(1,trig.tan(t.a),0,1,0,0)
    }
}


/**
 * Converts a specific {Transform} into its SVG string representation.
 */
export function transform2string(t: Transform): string {
    switch (t.type) {
        case 'matrix':
            return `matrix(${t.a}, ${t.b}, ${t.c}, ${t.d}, ${t.tx}, ${t.ty})`
        case 'scale':
            return `scale(${t.x}, ${t.y})`
        case 'translate':
            return `translate(${t.x}, ${t.y})`
        case 'rotate':
            return `rotate(${t.a}, ${t.x}, ${t.y})`
        case 'skewX':
            return `skewX(${t.a})`
        case 'skewY':
            return `skewY(${t.a})`
    }
}

/**
 * Converts an array of specific {Transform} objects into its SVG string representation.
 */
export function transforms2string(transforms: Array<Transform>): string {
    return transforms.map(t => {return transform2string(t)}).join(' ')
}


/**
 * Parses an SVG transform string into {Transform} objects.
 * @param s an SVG transform attribute literal
 * @returns an array of {Transform} objects
 */
export function parseTransform(s: string): TransformList {
    const list = new Array<Transform>()
    if (s.trim().length == 0) {
        return []
    }
    for (let comp of s.trim().split(/\)\s+/)) {
        const innerComps = comp.split('(')
        if (innerComps.length != 2) {
            throw `"${comp}" is not a valid inner transform component, it must contain exactly one '('`
        }
        const vals = innerComps[1].trim().split(/[\s,]+/g).map(c => {return parseFloat(c)})
        switch (innerComps[0]) {
            case 'matrix':
                if (vals.length != 6) {throw `"${comp}" must contain exactly 6 values`}
                list.push({type: 'matrix', a: vals[0], b: vals[1], c: vals[2], d: vals[3], tx: vals[4], ty: vals[5]})
                break
            case 'scale':
                if (vals.length > 2) {throw `"${comp}" must contain no more than values`}
                const firstVal = vals[0]
                list.push({type: 'scale', x: firstVal, y: vals[1]||firstVal})
                break
            case 'translate':
                if (vals.length != 2) {throw `"${comp}" must contain exactly 2 values`}
                list.push({type: 'translate', x: vals[0], y: vals[1]})
                break
            case 'rotate':
                if (vals.length == 1) {
                    list.push({type: 'rotate', a: vals[0], x: 0, y: 0})
                }
                else if (vals.length == 3) {
                    list.push({type: 'rotate', a: vals[0], x: vals[1], y: vals[2]})
                }
                else {
                    throw `"${comp}" must contain either 1 or 3 values`
                }
                break
            case 'skewX':
                if (vals.length != 1) {throw `"${comp}" must contain exactly 1 value`}
                list.push({type: 'skewX', a: vals[0]})
                break
            case 'skewY':
                if (vals.length != 1) {throw `"${comp}" must contain exactly 1 value`}
                list.push({type: 'skewY', a: vals[0]})
                break
            default:
                throw `Invalid transform component "${innerComps[0]}"`
        }
    }
    return list
}