import { Vec } from "../geom/vec"
import Color from 'color'

export type ColorDef = string

export type GradiantStop = {
    offset: number
    color: ColorDef
}

export type LinearGradiantDef = {
    type: 'linear'
    point1: Vec
    point2: Vec
    spreadMethod: 'pad' | 'reflect' | 'repeat'
    stops: GradiantStop[]
}

export type RaidalGradiantDef = {
    type: 'radial'
    fromCenter: Vec
    fromRadius: number
    toCenter: Vec
    toRadius: number
    stops: GradiantStop[]
}

export type PaintDef = ColorDef | LinearGradiantDef | RaidalGradiantDef

export type DashDef = {
    array: number[]
    offset: number
}

export type StyleDef = {
    fill?: PaintDef
    fillRule?: 'nonzero' | 'evenodd'
    stroke?: PaintDef
    strokeDash?: DashDef
    strokeWidth?: number
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';
}

export function sanitizeColor(raw: string): string {
    let color = Color(raw)
    return color.hex()
}

/**
 * Parses the attributes on an SVG element into a style definition.
 * @param attrs a record mapping SVG attribute keys to values
 * @returns a {StyleDef} describing the style attributes or null if no style attributes were present
 */
export function attributes2StyleDef(attrs: Record<string,string>): StyleDef | undefined {
    let def: StyleDef | undefined = undefined
    for (let [k, v] of Object.entries(attrs)) {
        switch (k) {
            case 'fill':
                def ||= {}
                def['fill'] = sanitizeColor(v)
                break
            case 'stroke':
                def ||= {}
                def['stroke'] = sanitizeColor(v)
                break
            case 'stroke-width':
                def ||= {}
                def['strokeWidth'] = parseInt(v)
                break
        }
    }
    return def
}