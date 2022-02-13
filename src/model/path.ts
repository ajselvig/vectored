
import { ProjectModel } from './model'
import Project from "./project"
import * as geom from '../util/geom'


export type VertexType = 'point' | 'symmetric' | 'asymmetric' | 'disjoint'

/**
 * Represents a single vertex with control points going in and out.
 */
export class Vertex {
    type: VertexType = 'point'
    point = geom.point()
    controlOut = geom.vector()
    controlIn = geom.vector()
}


export type OpenOrClosed = 'open' | 'closed'

/**
 * A series of vertices forming an open or closed path of straight and/or curved edges.
 */
export default class Path extends ProjectModel<never> {

    vertices = Array<Vertex>()

    openOrClosed: OpenOrClosed = 'open'

    constructor(readonly project: Project, id?: string) {
        super('path', project, id)
    }
}