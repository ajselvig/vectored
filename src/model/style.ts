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

export type RadialGradiantDef = {
    type: 'radial'
    fromCenter: Vec
    fromRadius: number
    toCenter: Vec
    toRadius: number
    stops: GradiantStop[]
}

export type PaintDef = {
    color?: ColorDef
    id?: string
}

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

/**
 * Parses a raw CSS color string into a {ColorDef}.
 * @param raw a raw color string
 * @returns the sanitized color value
 */
export function parseColor(raw: string): ColorDef {
    let color = Color(raw)
    return color.hex()
}

/**
 * Parses a raw SVG paint string into a {PaintDef} definition.
 * @param raw an SVG paint string
 * @returns a {PaintDef} representing the paint
 */
export function parsePaintDef(raw: string): PaintDef | undefined {
    if (!raw.length) {
        return undefined
    }
    const def: PaintDef = {}
    for (let comp of raw.trim().split(/\s+/)) { // a paint can be both a url and fallback color
        if (comp.startsWith('url(')) {
            const url = comp.replace('url(', '').replace(/[")]/g, '')
            if (url.startsWith('#')) {
                def.id = url.substring(1)
            }
            else {
                throw `"${url}" is not a #-prefixed reference`
            }
        }
        else {
            def.color = parseColor(comp)
        }
    }
    return def
}

/**
 * Parses the attributes on an SVG element into a style definition.
 * @param attrs a record mapping SVG attribute keys to values
 * @returns a {StyleDef} describing the style attributes or undefined if no style attributes were present
 */
export function attributes2StyleDef(attrs: Record<string,string>): StyleDef | undefined {
    let def: StyleDef | undefined = undefined
    for (let [k, v] of Object.entries(attrs)) {
        switch (k) {
            case 'fill':
                def ||= {}
                def['fill'] = parsePaintDef(v)
                break
            case 'stroke':
                def ||= {}
                def['stroke'] = parsePaintDef(v)
                break
            case 'stroke-width':
                def ||= {}
                def['strokeWidth'] = parseInt(v)
                break
        }
    }
    return def
}


export function paintDef2string(paint: PaintDef): string {
    const comps = new Array<string>()
    if (paint.id) {
        comps.push(`url(#${paint.id})`)
    }
    if (paint.color) {
        comps.push(paint.color)
    }
    return comps.join(' ')
}