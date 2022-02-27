import * as vec from "../geom/vec"
import Color from 'color'

export type Attrs = Record<string, string>

export type ColorDef = string

export type GradientStop = {
    offset: number
    color: ColorDef
}

type GradientUnits = 'userSpaceOnUse' | 'objectBoundingBox'

type GradientSpreadMethod = 'pad' | 'reflect' | 'repeat'

export type LinearGradientDef = {
    id: string
    type: 'linear'
    point1: vec.Vec
    point2: vec.Vec
    spreadMethod: GradientSpreadMethod
    units: GradientUnits
    stops: GradientStop[]
}

export type RadialGradientDef = {
    id: string
    type: 'radial'
    units: GradientUnits
    fromCenter: vec.Vec
    fromRadius: number
    toCenter: vec.Vec
    toRadius: number
    spreadMethod: GradientSpreadMethod
    stops: GradientStop[]
}

export type PaintServerDef = LinearGradientDef | RadialGradientDef


/**
 * Parses a raw SVG attribute map into a {LinearGradientDef}.
 * @param attrs raw string attributes
 * @returns a linear gradient definition
 */
export function attrs2LinearGradientDef(attrs: Attrs): LinearGradientDef {
    return {
        type: 'linear',
        units: (attrs['gradientUnits'] || 'userSpaceOnUse') as GradientUnits,
        id: attrs['id']!,
        stops: new Array<GradientStop>(),
        spreadMethod: (attrs['spreadMethod'] || 'pad') as GradientSpreadMethod,
        point1: vec.make(parseFloat(attrs['x1']), parseFloat(attrs['y1'])),
        point2: vec.make(parseFloat(attrs['x2']), parseFloat(attrs['y2']))
    }
}

/**
 * Parses a raw SVG attribute map into a {RadialGradientDef}.
 * @param attrs raw string attributes
 * @returns a radial gradient definition
 */
export function attrs2RadialGradientDef(attrs: Attrs): RadialGradientDef {
    return {
        type: 'radial',
        units: (attrs['gradientUnits'] || 'userSpaceOnUse') as GradientUnits,
        id: attrs['id']!,
        stops: new Array<GradientStop>(),
        spreadMethod: (attrs['spreadMethod'] || 'pad') as GradientSpreadMethod,
        fromCenter: vec.make(parseFloat(attrs['fx']), parseFloat(attrs['fy'])),
        fromRadius: parseFloat(attrs['fr']),
        toCenter: vec.make(parseFloat(attrs['cx']), parseFloat(attrs['cy'])),
        toRadius: parseFloat(attrs['r'])
    }
}

/**
 * Parses a raw SVG attribute map into a {GradientStop}.
 * @param attrs raw string attributes
 * @returns a gradient stop
 */
export function attrs2GradientStop(attrs: Attrs): GradientStop {
    return {
        color: parseColor(attrs['stop-color']),
        offset: parseFloat(attrs['offset']) || 0
    }
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