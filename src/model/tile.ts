import Group from './group'
import { ProjectModel } from './model'
import * as box from '../geom/box'
import Path from './path'
import Project from './project'


export default class Tile extends ProjectModel<Path | Group> {

    bounds: box.Box = box.empty()

    constructor(readonly project: Project, id?: string|null, b?: box.Box) {
        super('tile', project, id)
        if (b) {
            this.bounds = b
        }
    }

    place(xmin: number, ymin: number, width: number, height: number) {
        this.bounds = box.make(xmin, ymin, width, height)   
    }

    get left(): number {
        return this.bounds.x
    }

    get top(): number {
        return this.bounds.y
    }

    get right(): number {
        return this.bounds.x + this.bounds.width
    }

    get bottom(): number {
        return this.bounds.y + this.bounds.height
    }
    
}