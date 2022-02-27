
import { StyledModelDef, ModelRenderTag, StyledModel } from './model'
import Path from "./path"
import Project from "./project"
import { transforms2string } from './transform'
import * as tuff from 'tuff-core'

export default class Group extends StyledModel<StyledModelDef, Path> {
    
    constructor(readonly project: Project, def: StyledModelDef|{}, id?: string|null) {
        super('group', project, def, id)
    }

    render(parent: ModelRenderTag): void {
        parent.g(group => {
            let attrs: tuff.svg.SvgBaseAttrs = {}
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