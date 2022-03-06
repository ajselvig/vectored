import { ModelKey, ModelRenderTag, StyledModel, StyledModelDef } from './model'
import Project from "./project"
import * as vec from '../geom/vec'
import * as tuff from 'tuff-core'
import { transforms2string } from './transform'
import svgpath from 'svgpath'

const log = new tuff.logging.Logger("Path")


export type VertexType = 'point' | 'symmetric' | 'asymmetric' | 'disjoint'

/**
 * Represents a single vertex with control points going in and out.
 */
export type Vertex = {
    type: VertexType
    point: vec.Vec
    out?: vec.Vec
    in?: vec.Vec
}

/**
 * @returns a nicely formatted string with the format "(in)->[point]->(out) type"
 */
export function printVertex(v: Vertex): string {
    let s = vec.print(v.point, 3)
    const inString = v.in ? vec.print(v.in, 3) : ''
    const outString = v.out ? vec.print(v.out, 3) : ''
    return `(${inString})->[${s}]->(${outString}) ${v.type}`
}

/**
 * Whether a path is open or closed.
 */
export type OpenOrClosed = 'open' | 'closed'

/**
 * Paths consist of a set of subpaths which are lists of vertices.
 */
export type SubpathDef = {
    vertices: Vertex[]
    openOrClosed: OpenOrClosed
}

/**
 * Internal representation of a path as a collection of subpaths.
 */
export type PathDef = StyledModelDef & {
    subpaths: Array<SubpathDef>
}

export function printSubpathDef(def: SubpathDef): string {
    const lines = ['  {']
    for (let v of def.vertices) {
        lines.push(`    ${printVertex(v)}`)
    }
    lines.push(`    ${def.openOrClosed}`)
    lines.push('  }')
    return lines.join("\n")
}

/**
 * @returns a nicely formatted string for the {PathDef}.
 */
export function printPathDef(def: PathDef): string {
    const lines = ['Path: [']
    for (let subpath of def.subpaths) {
        lines.push(printSubpathDef(subpath))
    }
    lines.push(']')
    return lines.join("\n")
}

/**
 * A series of vertices forming an open or closed path of straight and/or curved edges.
 */
export default class Path extends StyledModel<PathDef, never> {

    constructor(readonly project: Project, def: PathDef, key?: ModelKey) {
        super('path', project, def, key)
    }
    
    render(parent: ModelRenderTag): void {
        const d = pathDef2d(this.def)
        let attrs: tuff.svg.PathTagAttrs = {
            id: this.id,
            d: d
        }
        if (this.def.transforms) {
            attrs.transform = transforms2string(this.def.transforms)
        }
        const style = this.computedStyle
        if (style) {
            this.applyStyle(attrs, style)
        }
        parent.path(attrs)
    }
}


/**
 * Parses a raw points string into a path definition.
 * @param rawPoints a string containing space and/or comma-separated values
 * @param openOrClosed whether the path is open or closed
 * @returns a {SubpathDef} with point vertices for each point
 */
export function points2Def(rawPoints: string, openOrClosed: OpenOrClosed): SubpathDef {
    const values = rawPoints.split(/[\s,]+/g).map(p => {return parseFloat(p)})
    const vertices = Array<Vertex>()
    for (let i=0; i<values.length; i+=2) {
        const v1 = values[i]
        const v2 = values[i+1]
        if (typeof v2 == 'number') { // there may be an odd number of values
            // the spec says to skip the last one
            vertices.push({point: vec.make(v1, v2), type: 'point'})
        }
    }
    return {vertices, openOrClosed}
}


/**
 * Parses a raw SVG path definition string into a PathDef object.
 * @param d an SVG path definition string
 * @returns a `PathDef` with subpaths based on the raw definition string
 */
export function d2PathDef(d: string): PathDef {
    let vertex: Vertex = {
        point: vec.origin(),
        type: "point"
    }
    let subdef: SubpathDef = {vertices: [], openOrClosed: "open"}
    const def: PathDef = {
        subpaths: [subdef]
    }

    // pushes the current vertex onto the stack and starts a new one
    function finishVertex(nextCommand: 'L' | 'C' | undefined = undefined) {
        if (vertex.out) { 
            if (vertex.in) {
                // infer the type based on the control points
                if (vec.isMirror(vertex.in, vertex.out)) {
                    // the control points are mirrors with equal lengths
                    vertex.type = "symmetric"
                }
                else if (vec.isMirror(vec.norm(vertex.in), vec.norm(vertex.out))) {
                    // the control points are mirrors with different lengths
                    vertex.type = "asymmetric"
                }
                else {
                    // the control points don't line up at all
                    vertex.type = "disjoint"
                }
            }
            else { // no in control point
                if (subdef.vertices.length == 0) { 
                    // this is the first vertex, assume it's symmetric
                    vertex.type = "symmetric"
                    // and compute the in control
                    vertex.in = vec.mirror(vertex.out)
                }
                else {
                    // the last vertex must be a point, so this is disjoint
                    vertex.type = "disjoint"
                }
            }
        }
        else if (vertex.in) { // in but no out control point
            if (nextCommand == 'L') {
                // the next command is a line, so this must be disjoint
                vertex.type = "disjoint"
            }
            else {
                // this is probably the last vertex, assume it's symmetric
                vertex.type = "symmetric"
                vertex.out = vec.mirror(vertex.in)
            }
        }
        subdef.vertices.push(vertex)
        vertex = {
            point: vec.dup(vertex.point),
            type: "point"
        }
    }

    // expand short curves and convert arcs to curves using svgpath
    const svgPath = svgpath(d)
        .unarc().unshort()
    log.debug(`Optimized '${d}' to ${svgPath.toString()}`)

    // iterate over the path segments and convert them into vertices
    svgPath.iterate((segment) => {
        const command = segment[0]
        const values = segment.slice(1).map(v => {return v as number})
        
        switch (command) {
            case 'A':
            case 'a':
                break
            case 'M':
            case 'm':
                // assert(values.length == 1, `Move command must specify one point, not ${values.length}: ${values}`)
                if (subdef.vertices.length > 1) {
                    finishVertex('L')
                    // the current subpath has at least two connected vertices, 
                    // start a new subpath
                    subdef.vertices.pop()
                    subdef = {vertices: [vertex], openOrClosed: "open"}
                    def.subpaths.push(subdef)
                }
                vertex.point = command=='M' ? vec.make(values) : vec.add(vertex.point, vec.make(values))
                break
            case 'Z':
            case 'z':
                subdef.openOrClosed = 'closed'
                break
            case 'L':
            case 'l':
                for (let i=0; i<values.length; i+=2) {
                    finishVertex('L')
                    const v = vec.slice(values, i)
                    vertex.point = command=='L' ? v : vec.add(vertex.point, v)
                }
                break
            case 'H':
            case 'h':
                finishVertex('L') // same as starting a line
                vertex.point = command=='H' ? vec.make(values[0], vertex.point.y) : vec.add(vertex.point, vec.make(values[0], 0))
                break
            case 'V':
            case 'v':
                finishVertex('L') // same as starting a line
                vertex.point = command=='V' ? vec.make(vertex.point.x, values[0]) : vec.add(vertex.point, vec.make(0, values[0]))
                break
            case 'C':
            case 'c':
                // assert(values.length == 3, `Cubic command must specify three points, not ${values.length}: ${values.join(', ')}`)
                const absOut = command=='C' ? vec.make(values[0], values[1]) : vec.add(vertex.point, vec.make(values[0], values[1]))
                vertex.out = vec.make(absOut.x - vertex.point.x, absOut.y - vertex.point.y)
                const absIn = command=='C' ? vec.make(values[2], values[3]) : vec.add(vertex.point, vec.make(values[2], values[3]))
                const nextPoint = command=='C' ? vec.make(values[4], values[5]) : vec.add(vertex.point, vec.make(values[4], values[5]))
                const nextIn = vec.make(absIn.x - nextPoint.x, absIn.y - nextPoint.y)
                finishVertex('C')
                vertex.point = nextPoint
                vertex.in = nextIn
                break
            default:
                throw(`Invalid path command '${command}'`)
        }
    })

    finishVertex()
    return def
}



/**
 * Converts an internal path definition into an svg d string.
 * @param def a path definition in internal representation
 * @returns an SVG path d string
 */
export function pathDef2d(def: PathDef): string {
    const comps: string[] = []
    if (!def.subpaths.length) {
        return "" // maybe we should raise here?
    }

    // a convenience function to push commands to the stack
    function command(char: string, ...vecs: vec.Vec[]) {
        comps.push(`${char} ` + vecs.map(v => {return `${v.x},${v.y}`}).join(' '))
    }

    // iterate over the subpaths
    for (let subpath of def.subpaths) {

        // move to the first vertex
        const v0 = subpath.vertices[0]
        command('M', v0.point)

        // iterate over each pair of vertices
        for (let i=0; i<subpath.vertices.length-1; i++) {
            const v1 = subpath.vertices[i]
            const v2 = subpath.vertices[i+1]
            if (!v1.out && !v2.in) {
                // no control points in between the vertices, must be a line
                command('L', v2.point)
            }
            else {
                // at least one control point, must be a curve
                const c1 = vec.add(v1.out || vec.origin(), v1.point)
                const c2 = vec.add(v2.in || vec.origin(), v2.point)
                command('C', c1, c2, v2.point)
            }
        }

        // close the path
        if (subpath.openOrClosed == 'closed') {
            comps.push('Z')
        }
    }

    return comps.join(' ')
}