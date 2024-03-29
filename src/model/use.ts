import { SvgParentTag } from "tuff-core/svg"
import { ModelDef, StyledModel, ModelKey } from "./model"
import Project from "./project"
import * as tuff from 'tuff-core'
import { Box } from "tuff-core/box"
import { Mat } from "tuff-core/mat"
import { mat2string } from "./transform"




export type UseDef = ModelDef & {
    referenceId: string
    transform?: Mat
    x?: number
    y?: number
    width?: number
    height?: number
}

/**
 * Represents an SVG <use> element - creates a runtime copy of another element.
 */
export default class Use extends StyledModel<'use', never> {

    constructor(readonly project: Project, def: UseDef, key?: ModelKey) {
        super('use', project, def, key)
    }

    get localBounds(): Box {
        // TODO: properly compute use bounds
        return {
            x: this.def.x||0,
            y: this.def.y||0,
            width: this.def.width||1,
            height: this.def.height||1
        }
    }

    render(parent: SvgParentTag): void {
        let attrs: tuff.svg.UseTagAttrs = {
            id: this.id,
            href: '#' + this.def.referenceId
        }
        const style = this.computedStyle
        if (style) {
            this.applyStyle(attrs, style)
        }
        if (this.def.transform) {
            attrs.transform = mat2string(this.def.transform)
        }
        const elem = parent.use(attrs)
    
        this.attachInteractionEmits(elem)
    }

}