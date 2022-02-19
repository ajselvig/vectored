import { ProjectModel } from './model'
import Project from "./project"
import * as vec from '../geom/vec'
import { assert } from 'vitest'
import * as tuff from 'tuff-core'

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
    let s = vec.print(v.point)
    const inString = v.in ? vec.print(v.in) : ''
    const outString = v.out ? vec.print(v.out) : ''
    return `(${inString})->[${s}]->(${outString}) ${v.type}`
}

/**
 * Whether a path is open or closed.
 */
export type OpenOrClosed = 'open' | 'closed'

/**
 * Internal representation of paths.
 */
export type PathDef = {
    vertices: Vertex[]
    openOrClosed: OpenOrClosed
}

/**
 * @returns a nicely formatted string for the {PathDef}.
 */
export function printPathDef(def: PathDef): string {
    const lines = ['{']
    for (let v of def.vertices) {
        lines.push(`  ${printVertex(v)}`)
    }
    lines.push(`  ${def.openOrClosed}`)
    lines.push('}')
    return lines.join("\n")
}

/**
 * A series of vertices forming an open or closed path of straight and/or curved edges.
 */
export default class Path extends ProjectModel<never> {

    def: PathDef = {vertices: [], openOrClosed: "open"}

    constructor(readonly project: Project, id?: string) {
        super('path', project, id)
    }
}



/**
 * Parses a raw SVG path definition string into a PathDef object.
 * @param d an SVG path definition string
 * @returns a `PathDef` with vertices based on the raw definition string
 */
export function d2PathDef(d: string): PathDef {
    let vertex: Vertex = {
        point: vec.origin(),
        type: "point"
    }
    let def: PathDef = {vertices: [], openOrClosed: "open"}
    let comps = d.trim().matchAll(/([A-Za-z])([\-\s\d\.,]*)/g) // split by command

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
                if (def.vertices.length == 0) { 
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
        def.vertices.push(vertex)
        vertex = {
            point: vec.dup(vertex.point),
            type: "point"
        }
    }

    for (let comp of comps) {
        const command = comp[1]
        const rawValues = (comp[2] || '').trim()
        
        // an array of arrays of numbers for each point
        log.debug("Parsing raw comp", rawValues)
        const values = rawValues.split(/\s+/g).map(pair => {
            return [...pair.trim().matchAll(/\-*\d+\.*\d*/g)].map(v => {return parseFloat(v[0])})
        })

        switch (command) {
            case 'M':
            case 'm':
                assert(values.length == 1, `Move command must specify one point, not ${values.length}: ${values}`)
                vertex.point = command=='M' ? vec.make(values[0]) : vec.add(vertex.point, vec.make(values[0]))
                break
            case 'Z':
                def.openOrClosed = 'closed'
                break
            case 'L':
            case 'l':
                assert(values.length == 1, `Line command must specify one point, not ${values.length}`)
                finishVertex('L')
                vertex.point = command=='L' ? vec.make(values[0]) : vec.add(vertex.point, vec.make(values[0]))
                break
            case 'C':
            case 'c':
                assert(values.length == 3, `Cubic command must specify three points, not ${values.length}: ${values.join(', ')}`)
                const absOut = command=='C' ? vec.make(values[0]) : vec.add(vertex.point, vec.make(values[0]))
                vertex.out = vec.make(absOut.x - vertex.point.x, absOut.y - vertex.point.y)
                const absIn = command=='C' ? vec.make(values[1]) : vec.add(vertex.point, vec.make(values[1]))
                const nextPoint = command=='C' ? vec.make(values[2]) : vec.add(vertex.point, vec.make(values[2]))
                const nextIn = vec.make(absIn.x - nextPoint.x, absIn.y - nextPoint.y)
                finishVertex('C')
                vertex.point = nextPoint
                vertex.in = nextIn
                break
            default:
                throw(`Invalid path command '${command}'`)
        }
    }
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
    if (!def.vertices.length) {
        return "" // maybe we should raise here?
    }

    // a convenience function to push commands to the stack
    function command(char: string, ...vecs: vec.Vec[]) {
        comps.push(`${char} ` + vecs.map(v => {return `${v.x},${v.y}`}).join(' '))
    }

    // move to the first vertex
    const v0 = def.vertices[0]
    if (v0.point.x || v0.point.y) {
        command('M', v0.point)
    }

    // iterate over each pair of vertices
    for (let i=0; i<def.vertices.length-1; i++) {
        const v1 = def.vertices[i]
        const v2 = def.vertices[i+1]
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
    if (def.openOrClosed == 'closed') {
        comps.push('Z')
    }

    return comps.join(' ')
}