import { AppPart } from "../view/app-part"
import * as tuff from 'tuff-core'
const log = new tuff.logging.Logger("Actions")

/**
 * Groups a named set of actions together to be applied at the same time.
 */
type ActionSet = {
    name: string
    actions: Set<ActionBase>
}

function makeActionSet(name: string, actions: Iterable<ActionBase>): ActionSet {
    return {
        name,
        actions: new Set(actions)
    }
}

/**
 * Base class for all user actions tracked by `ActionHistory`.
 */
export abstract class ActionBase {

    abstract apply(app: AppPart): void

    abstract unapply(app: AppPart): void

}

/**
 * Keeps a history of all actions performed by the user
 * and facilitates undo/redo.
 */
export class ActionHistory {

    private actionSets: Array<ActionSet> = []
    private index: number = -1

    constructor(readonly app: AppPart) {
        
    }

    get count() : number {
        return this.actionSets.length
    }

    push(name: string, actions: Iterable<ActionBase>) {
        this.pushSet(makeActionSet(name, actions))
    }

    pushSet(set: ActionSet) {
        if (this.index >= this.count) {
            this.actionSets = this.actionSets.slice(0, this.index)
        }
        this.actionSets.push(set)
        this.index = this.actionSets.length-1
        this.applySet(set)
        log.info(`Action history at ${this.index} after ${set.name}`)
    }

    private applySet(set: ActionSet) {
        set.actions.forEach((a) => {
            a.apply(this.app)
        })
    }

    private unapplySet(set: ActionSet) {
        set.actions.forEach((a) => {
            a.unapply(this.app)
        })
    }

    get canUndo() {
        return this.index > -1
    }

    undo() : boolean {
        if (this.index < 0) {
            return false
        }
        const set = this.actionSets[this.index]
        this.unapplySet(set)
        this.index -= 1
        log.info(`Action history at ${this.index} after ${set.name} undo`)
        return true
    }

    get canRedo() {
        return this.index < this.count-1
    }

    redo() : boolean {
        if (this.index >= this.count-1) {
            return false
        }
        this.index += 1
        const set = this.actionSets[this.index]
        this.applySet(set)
        log.info(`Action history at ${this.index} after ${set.name} redo`)
        return true
    }

}