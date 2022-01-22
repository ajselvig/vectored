import Flatten from '@flatten-js/core'
import Group from './group'
import { ProjectModel } from './model'
import Path from './path'
import Project from './project'

type Box = Flatten.Box

export default class Tile extends ProjectModel<Path | Group> {

    box: Flatten.Box

    constructor(readonly project: Project, id?: string|null, box?: Box) {
        super('tile', project, id)
        if (box) {
            this.box = box
        }
        else {
            this.box = new Flatten.Box(0, 0, 0, 0)
        }
    }

    place(xmin: number, ymin: number, xmax: number, ymax: number) {
        this.box = new Flatten.Box(xmin, ymin, xmax, ymax)   
    }
    
}