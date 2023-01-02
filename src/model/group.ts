
import { ModelDef, ModelRenderTag, StyledModel, ModelKey } from './model'
import Path from "./path"
import Project from "./project"
import * as tuff from 'tuff-core'
import Use from './use'
import { Box } from 'tuff-core/box'
const box = tuff.box

export type GroupDef = ModelDef

export default class Group extends StyledModel<'group', Path|Use|Group> {
    
    constructor(readonly project: Project, def: ModelDef|{}, key?: ModelKey|null) {
        super('group', project, def, key)
    }

    get localBounds(): Box {
        return box.unionAll(this.children.map(c => c.localBounds))
    }

    render(parent: ModelRenderTag): void {
        parent.g(group => {
            let attrs: tuff.svg.SvgBaseAttrs = {
                id: this.id
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