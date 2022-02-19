import { v4 as uuidv4 } from 'uuid'
import Project from './project'
import * as tuff from 'tuff-core'
import Tile from './tile'
import Group from './group'
import Path from './path'

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
    group: Group,
    path: Path
}

/**
 * String values that can be used to identify a model class.
 */
export type ModelTypeName = keyof ModelTypeMap

/**
 * Untyped interface for models.
 */
export interface IModel {
    readonly id: string
    readonly type: ModelTypeName
    name: string
    project: Project
    add(child: IModel): void
    get(index: number): IModel | null
    count: number
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

type ModelMap<T> = {[id: string]: T}

/**
 * Base class for all model objects that provides identity.
 */
export default abstract class Model<ChildType extends IModel> {

    readonly id: string
    name: string
    readonly children: Array<ChildType>
    abstract readonly project: Project

    constructor(readonly type: ModelTypeName, id?: string|null) {
        if (id) {
            this.id = id
        }
        else {
            this.id = generateId()
        }
        const num = nextCount(type)
        this.name = `${this.type} ${num}`
        log.info(`New ${this.name}`)
        this.children = []
    }

    get count(): number {
        return Object.entries(this.children).length
    }

    get<T extends ChildType>(index: number): T {
        return this.children[index] as T
    }

    add<T extends ChildType>(child: T) {
        this.children.push(child)
    }

    eachOfType<T extends ChildType>(type: ModelTypeName, fn: (child: T) => any) {
        for (let [_, child] of Object.entries(this.children)) {
            if (child.type == type) {
                fn(child as T)
            }
        }
    }

}

export abstract class ProjectModel<ChildType extends IModel> extends Model<ChildType> {

    constructor(type: ModelTypeName, readonly project: Project, id?: string|null) {
        super(type, id)
        this.project.register(this)
    }

}