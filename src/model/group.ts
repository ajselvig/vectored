
import { StyledModelDef, ModelRenderTag, StyledModel, ModelKey } from './model'
import Path from "./path"
import Project from "./project"
import { transforms2string } from './transform'
import * as tuff from 'tuff-core'
import Use from './use'
import * as box from '../geom/box'

export default class Group extends StyledModel<StyledModelDef, Path|Use|Group> {
    
    constructor(readonly project: Project, def: StyledModelDef|{}, key?: ModelKey|null) {
        super('group', project, def, key)
    }

    get localBounds(): box.Box {
        return box.unionAll(this.children.map(c => c.localBounds))
    }

    render(parent: ModelRenderTag): void {
        parent.g(group => {
            let attrs: tuff.svg.SvgBaseAttrs = {
                id: this.id
            }
            if (this.def.transforms) {
                attrs.transform = transforms2string(this.def.transforms)
            }
            const style = this.computedStyle
            if (style) {
                this.applyStyle(attrs, style)
            }
            group.attrs(attrs)
            this.each(child => {
                child.render(group)
            })
        })
    }
}