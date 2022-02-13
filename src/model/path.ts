
import { ProjectModel } from './model'
import Project from "./project"
import * as geom from '../util/geom'
import { assert } from 'vitest'


export type VertexType = 'point' | 'symmetric' | 'asymmetric' | 'disjoint'

/**
 * Represents a single vertex with control points going in and out.
 */
export type Vertex = {
    type: VertexType
    point: geom.Point
    out?: geom.Vector
    in?: geom.Vector
}


export type OpenOrClosed = 'open' | 'closed'

export type PathDef = {
    vertices: Vertex[]
    openOrClosed: OpenOrClosed
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
 * Control points within this ratio of each other are considered the same (or mirrored).
 */
const EpsilonRatio = 0.001

function areMirrors(v1: geom.Vector, v2: geom.Vector): boolean {
    const mag1 = v1.length
    const mag2 = v2.length
    const maxMag = Math.max(mag1, mag2)
    return maxMag > 0 && Math.abs(mag1-mag2)/maxMag < EpsilonRatio && Math.abs(v1.x+v2.x)/maxMag < EpsilonRatio
}

/**
 * Parses a raw SVG path definition string into a PathDef object.
 * @param d an SVG path definition string
 * @returns a PathDef with vertices based on the raw definition string
 */
export function dToPathDef(d: string): PathDef {
    let vertex: Vertex = {
        point: geom.p(),
        type: "point"
    }
    let def: PathDef = {vertices: [], openOrClosed: "open"}
    let comps = d.trim().matchAll(/([A-Za-z])([\-\s\d\.,]*)/g)

    // pushes the current vertex onto the stack and starts a new one
    function finishVertex() {
        if (vertex.out) { 
            if (vertex.in) {
                // infer the type based on the control points
                if (areMirrors(vertex.in, vertex.out)) {
                    // the control points are mirrors with equal lengths
                    vertex.type = "symmetric"
                }
                else if (areMirrors(vertex.in.normalize(), vertex.out.normalize())) {
                    // the control points are mirrors with different lengths
                    vertex.type = "asymmetric"
                }
                else {
                    // the control points don't line up at all
                    vertex.type = "disjoint"
                }
            }
            else { // default to symmetric if there's no in control point
                vertex.type = "symmetric"
            }
        }
        else if (vertex.in) { //default to symmetric if there's no out control point
            vertex.type = "symmetric"
        }
        def.vertices.push(vertex)
        vertex = {
            point: vertex.point,
            type: "point"
        }
    }

    for (let comp of comps) {
        const command = comp[1]
        const rawValues = (comp[2] || '').trim()
        
        // an array of arrays of numbers for each point
        const values = rawValues.split(',').map(pair => {
            return [...pair.trim().matchAll(/\-*\d+\.*\d*/g)].map(v => {return parseFloat(v[0])})
        })

        console.log(`comp ${command} ${values.join(' ')}`)
        switch (command) {
            case 'M':
            case 'm':
                assert(values.length == 1, `Move command must specify one point, not ${values.length}`)
                vertex.point = command=='M' ? geom.a2p(values[0]) : vertex.point.translate(geom.a2v(values[0]))
                break
            case 'Z':
                def.openOrClosed = 'closed'
                break
            case 'L':
            case 'l':
                assert(values.length == 1, `Line command must specify one point, not ${values.length}`)
                finishVertex()
                vertex.point = command=='L' ? geom.a2p(values[0]) : vertex.point.translate(geom.a2v(values[0]))
                break
            case 'C':
            case 'c':
                assert(values.length == 3, `Cubic command must specify three points, not ${values.length}: ${values.join(', ')}`)
                const absOut = command=='C' ? geom.a2p(values[0]) : vertex.point.translate(geom.a2v(values[0]))
                vertex.out = geom.v(absOut.x - vertex.point.x, absOut.y - vertex.point.y)
                const absIn = command=='C' ? geom.a2p(values[1]) : vertex.point.translate(geom.a2v(values[1]))
                const nextPoint = command=='C' ? geom.a2p(values[2]) : vertex.point.translate(geom.a2v(values[2]))
                const nextIn = geom.v(absIn.x - nextPoint.x, absIn.y - nextPoint.y)
                finishVertex()
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