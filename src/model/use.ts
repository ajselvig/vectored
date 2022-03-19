import { SvgParentTag } from "tuff-core/dist/svg"
import { StyledModelDef, StyledModel, ModelKey } from "./model"
import Project from "./project"
import * as tuff from 'tuff-core'
import { transforms2string } from "./transform"
import { Box } from "../geom/box"



export type UseDef = StyledModelDef & {
    referenceId: string
    x?: number
    y?: number
    width?: number
    height?: number
}

/**
 * Represents an SVG <use> element - creates a runtime copy of another element.
 */
export default class Use extends StyledModel<UseDef, never> {

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
        if (this.def.transforms) {
            attrs.transform = transforms2string(this.def.transforms)
        }
        const style = this.computedStyle
        if (style) {
            this.applyStyle(attrs, style)
        }
        const elem = parent.use(attrs)
    
        this.attachInteractionEmits(elem)
    }

}