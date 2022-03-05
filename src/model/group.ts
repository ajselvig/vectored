
import { StyledModelDef, ModelRenderTag, StyledModel } from './model'
import Path from "./path"
import Project from "./project"
import { transforms2string } from './transform'
import * as tuff from 'tuff-core'
import Use from './use'

export default class Group extends StyledModel<StyledModelDef, Path|Use|Group> {
    
    constructor(readonly project: Project, def: StyledModelDef|{}, id?: string|null) {
        super('group', project, def, id)
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