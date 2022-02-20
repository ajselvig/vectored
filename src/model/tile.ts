import Group from './group'
import { ProjectModel } from './model'
import * as box from '../geom/box'
import Path from './path'
import Project from './project'

type TileDef = {
    bounds: box.Box
}

export default class Tile extends ProjectModel<TileDef, Path | Group> {

    constructor(readonly project: Project, def: TileDef, id?: string|null) {
        super('tile', project, def, id)
    }

    place(xmin: number, ymin: number, width: number, height: number) {
        this.def.bounds = box.make(xmin, ymin, width, height)   
    }

    get left(): number {
        return this.def.bounds.x
    }

    get top(): number {
        return this.def.bounds.y
    }

    get right(): number {
        return this.def.bounds.x + this.def.bounds.width
    }

    get bottom(): number {
        return this.def.bounds.y + this.def.bounds.height
    }
    
}