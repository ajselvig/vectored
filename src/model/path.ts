
import { ProjectModel } from './model'
import Project from "./project"
import * as geom from '../util/geom'


export type VertexType = 'point' | 'symmetric' | 'asymmetric' | 'disjoint'

/**
 * Represents a single vertex with control points going in and out.
 */
export type Vertex = {
    type: VertexType
    point: geom.Point
    controlOut?: geom.Vector
    controlIn?: geom.Vector
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
 * Parses a raw SVG path definition string into a PathDef object.
 * @param d an SVG path definition string
 * @returns a PathDef with vertices based on the raw definition string
 */
export function dToPathDef(d: string): PathDef {
    let currentVertex: Vertex = {
        point: geom.point(),
        type: "point"
    }
    let def: PathDef = {vertices: [], openOrClosed: "open"}
    let comps = d.trim().matchAll(/([A-Za-z])([\-\s\d\.]*)/g)

    function finishCurrentVertex() {
        def.vertices.push(currentVertex)
        currentVertex = {
            point: currentVertex.point,
            type: "point"
        }
    }

    for (let comp of comps) {
        const command = comp[1]
        const rawValues = (comp[2] || '').trim()
        const values = [...rawValues.matchAll(/\-*\d+\.*\d*/g)].map(v => {return parseFloat(v[0])})
        console.log(`comp ${command} [${values.join(',')}]`)
        switch (command) {
            case 'M':
                currentVertex.point = geom.arrayToPoint(values)
                break
            case 'm':
                currentVertex.point = currentVertex.point.translate(geom.arrayToVector(values))
                break
            case 'Z':
                def.openOrClosed = 'closed'
                break
            case 'L':
            case 'l':
                finishCurrentVertex()
                currentVertex.point = command=='L' ? geom.arrayToPoint(values) : currentVertex.point.translate(geom.arrayToVector(values))
                break
            default:
                throw(`Invalid path command '${command}'`)
        }
    }
    finishCurrentVertex()
    return def
}