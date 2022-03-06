import { v4 as uuidv4 } from 'uuid'
import Project from './project'
import * as tuff from 'tuff-core'
import Tile from './tile'
import Group from './group'
import Path from './path'
import { StyleDef, paintDef2string } from './style'
import { TransformList } from './transform'
import Use from './use'

const log = new tuff.logging.Logger("Model")


function generateId(): string {
    return uuidv4()
}

/**
 * Maps model names to their classes.
 */
interface ModelTypeMap {
    project: Project,
    tile: Tile,
    group: Group
    path: Path
    use: Use
}

/**
 * String values that can be used to identify a model class.
 */
export type ModelTypeName = keyof ModelTypeMap

/**
 * All models render to an SVG parent tag.
 */
export type ModelRenderTag = tuff.svg.SvgParentTag

/**
 * Base type for all model definitions.
 */
export type ModelDef = {
    name?: string
    externId?: string
}

/**
 * Untyped interface for models.
 */
export interface IModel {
    readonly id: string
    readonly type: ModelTypeName
    project: Project
    append(child: IModel): void
    get(index: number): IModel | null
    each(fn: (child: IModel) => any): void
    count: number
    def: ModelDef
    render(parent: ModelRenderTag): void
}

/**
 * Keep track of how many of each element have been created.
 */
const counters: {[type: string]: number} = {}

/**
 * @returns the next number for the given model type
 * Used for generating default names for new elements.
 */
function nextCount(type: ModelTypeName): number {
    if (!counters[type]) {
        counters[type] = 0
    }
    return counters[type] += 1
}

/**
 * Base class for all model objects that provides identity.
 */
export default abstract class Model<DefType extends ModelDef, ChildType extends IModel> {

    readonly id: string
    readonly children: Array<ChildType>
    abstract readonly project: Project

    constructor(readonly type: ModelTypeName, 
            public def: DefType, id?: string|null) {
        if (id) {
            this.id = id
        }
        else {
            this.id = generateId()
        }
        const num = nextCount(type)
        def.name = `${this.type} ${num}`
        log.debug(`New ${def.name}`)
        this.children = []
    }

    get count(): number {
        return Object.entries(this.children).length
    }

    get<T extends ChildType>(index: number): T {
        return this.children[index] as T
    }

    append<T extends ChildType>(child: T) {
        this.children.push(child)
    }

    each(fn: (child: IModel) => any) {
        for (let child of this.children) {
            fn(child)
        }
    }

    eachOfType<T extends ChildType>(type: ModelTypeName, fn: (child: T) => any, options: {sorted: boolean} = {sorted: false}) {
        let kids = this.children
        if (options.sorted) {
            kids = [...this.children].sort((a, b) => {
                return (a.def.name || '').localeCompare(b.def.name || '')
            })
        }
        for (let child of kids) {
            if (child.type == type) {
                fn(child as T)
            }
        }
    }

    abstract render(parent: ModelRenderTag): void

}

/**
 * Model definition for models belonging to a project.
 */
export type ProjectDef = ModelDef & {
    transforms?: TransformList
}


/**
 * Base class for all models belonging to a project.
 */
export abstract class ProjectModel<DefType extends ProjectDef, ChildType extends IModel> extends Model<DefType, ChildType> {

    constructor(type: ModelTypeName, readonly project: Project, def: DefType, id?: string|null) {
        super(type, def, id)
        this.project.register(this)
    }

}

/**
 * Model definition that includes style information.
 */
export type StyledModelDef = ProjectDef & {
    style?: StyleDef
    styleId?: string
}

export abstract class StyledModel<DefType extends StyledModelDef, ChildType extends IModel> extends ProjectModel<DefType, ChildType> {

    constructor(type: ModelTypeName, readonly project: Project, def: DefType, id?: string|null) {
        super(type, project, def, id)
    }

    /**
     * Computes the style either directly from the def or from the project using `def.styleId`.
     */
    get computedStyle(): StyleDef|undefined {
        // TODO: return the style using styleId from the project
        return this.def.style 
    }

    applyStyle(attrs: tuff.svg.SvgBaseAttrs, style: StyleDef) {
        if (style.fill) {
            attrs.fill = paintDef2string(style.fill)
        }
        if (style.stroke) {
            attrs.stroke = paintDef2string(style.stroke)
        }
        if (style.strokeWidth) {
            attrs.strokeWidth = style.strokeWidth
        }
        if (style.opacity != null) {
            attrs.opacity = style.opacity
        }
    }

}