import Group from './group'
import { ModelDef, ModelRenderTag, ProjectModel } from './model'
import * as box from '../geom/box'
import Path from './path'
import Project from './project'
import * as tuff from 'tuff-core'
import { PaintServerDef } from './style'
import { DefsTag } from 'tuff-core/dist/svg'

type TileDef = {
    bounds: box.Box
} & ModelDef

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


    /// Rendering

    renderInHtml(parent: tuff.html.HtmlParentTag) {
        parent.svg(svg => {
            svg.attrs({width: this.def.bounds.width, height: this.def.bounds.height})
            this.render(svg)
        })
    }

    render(parent: ModelRenderTag): void {
        this.renderDefinitions(parent)
        this.each(child => {
            child.render(parent)
        })
    }

    renderDefinitions(parent: ModelRenderTag): void {
        parent.defs(defs => {
            this.renderPaintServers(defs)
        })
    }


    /// Paint Servers

    private paintServers: {[id: string]: PaintServerDef} = {}

    addPaintServer(paintServer: PaintServerDef) {
        this.paintServers[paintServer.id] = paintServer
    }

    getPaintServer(id: string): PaintServerDef {
        return this.paintServers[id]!
    }

    renderPaintServers(defs: DefsTag) {
        for (let [id, ps] of Object.entries(this.paintServers)) {
            let gradTag: tuff.svg.LinearGradientTag | tuff.svg.RadialGradientTag
            switch (ps.type) {
                case 'linear':
                    gradTag = defs.linearGradient({
                        gradientUnits: ps.units,
                        x1: ps.point1.x,
                        y1: ps.point1.y,
                        x2: ps.point2.x,
                        y2: ps.point2.y
                    })
                    break
                case 'radial':
                    gradTag = defs.radialGradient({
                        gradientUnits: ps.units,
                        fx: ps.fromCenter.x,
                        fy: ps.fromCenter.y,
                        fr: ps.fromRadius,
                        cx: ps.toCenter.x,
                        cy: ps.toCenter.y,
                        r: ps.toRadius
                    })
                    break
            }
            gradTag.id(id)
            for (let stop of ps.stops) {
                gradTag.stop({
                    stopColor: stop.color,
                    offset: stop.offset
                })
            }
        }
    }
    
}