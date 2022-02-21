import Group from './group'
import { ModelRenderTag, ProjectModel } from './model'
import * as box from '../geom/box'
import Path from './path'
import Project from './project'
import * as tuff from 'tuff-core'

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

    renderInHtml(parent: tuff.html.HtmlTagBase<tuff.tags.Attrs>) {
        parent.svg(svg => {
            svg.attrs({width: this.def.bounds.width, height: this.def.bounds.height})
            this.render(svg)
        })
    }

    render(parent: ModelRenderTag): void {
        this.each(child => {
            child.render(parent)
        })
    }
    
}