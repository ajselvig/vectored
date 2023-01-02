import { AppPart } from "../view/app-part"
import * as tuff from 'tuff-core'
const log = new tuff.logging.Logger("Actions")

type ActionSet = Set<ActionBase>

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

    numActions() : number {
        return this.actionSets.length
    }

    pushAction(action: ActionBase) {
        this.pushSet(new Set([action]))
    }

    pushActions(actions: Iterable<ActionBase>) {
        this.pushSet(new Set(actions))
    }

    pushSet(set: ActionSet) {
        if (this.index >= this.numActions()) {
            this.actionSets = this.actionSets.slice(0, this.index)
        }
        this.actionSets.push(set)
        this.index = this.actionSets.length-1
        this.applySet(set)
        log.info(`Action history at ${this.index}`)
    }

    private applySet(set: ActionSet) {
        set.forEach((a) => {
            a.apply(this.app)
        })
    }

    private unapplySet(set: ActionSet) {
        set.forEach((a) => {
            a.unapply(this.app)
        })
    }

    canUndo() {
        return this.index > -1
    }

    undo() : boolean {
        log.info('Undo')
        if (this.index < 0) {
            return false
        }
        const set = this.actionSets[this.index]
        this.unapplySet(set)
        this.index -= 1
        log.info(`Action history at ${this.index}`)
        return true
    }

    canRedo() {
        return this.index < this.numActions()-1
    }

    redo() : boolean {
        log.info('Redo')
        if (this.index >= this.numActions()-1) {
            return false
        }
        this.index += 1
        const set = this.actionSets[this.index]
        this.applySet(set)
        log.info(`Action history at ${this.index}`)
        return true
    }

}