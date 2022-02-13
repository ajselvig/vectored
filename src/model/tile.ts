import Flatten from '@flatten-js/core'
import Group from './group'
import { ProjectModel } from './model'
import * as geom from '../util/geom'
import Path from './path'
import Project from './project'

type Box = Flatten.Box

export default class Tile extends ProjectModel<Path | Group> {

    box = geom.b()

    constructor(readonly project: Project, id?: string|null, box?: Box) {
        super('tile', project, id)
        if (box) {
            this.box = box
        }
    }

    place(xmin: number, ymin: number, xmax: number, ymax: number) {
        this.box = geom.b(xmin, ymin, xmax, ymax)   
    }

    get left(): number {
        return this.box.xmin
    }

    get top(): number {
        return this.box.ymin
    }

    get width(): number {
        return this.box.xmax - this.box.xmin
    }

    get height(): number {
        return this.box.ymax - this.box.ymin
    }
    
}