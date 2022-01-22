import { v4 as uuidv4 } from 'uuid'
import Project from './project'
import * as tuff from 'tuff-core'

const log = new tuff.logging.Logger("Model")


function generateId(): string {
    return uuidv4()
}

export type ModelTypeName = "project" | "tile" | "group" | "path"

export type IModel = {id: string}

/**
 * Base class for all model objects that provides identity.
 */
export default abstract class Model<ChildType extends IModel> {

    readonly id: string
    readonly children: {[id: string]: ChildType}
    abstract readonly project: Project

    constructor(readonly type: ModelTypeName, id?: string|null) {
        if (id) {
            this.id = id
        }
        else {
            this.id = generateId()
        }
        log.info(`New ${this.type} ${this.id}`)
        this.children = {}
    }

    get<T extends ChildType>(id: string): T {
        return this.children[id] as T
    }

    add<T extends ChildType>(child: T) {
        this.children[child.id] = child
    }

}

export abstract class ProjectModel<ChildType extends IModel> extends Model<ChildType> {

    constructor(type: ModelTypeName, readonly project: Project, id?: string|null) {
        super(type, id)
    }

}