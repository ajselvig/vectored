import { IModel, ModelKey } from "../model/model"
import * as tuff from 'tuff-core'

const log = new tuff.logging.Logger("Selection")

export type SelectionListener = (fn: Selection) => any

export default class Selection {

    constructor() {

    }

    private items: {[id: string]: IModel} = {}

    /**
     * Appends an item to the selection.
     * @param item an item to be selected
     */
    append(item: IModel) {
        this.items[item.id] = item
        log.info(`Selected ${item.type} "${item.def.name}"`)
        this.notifyListeners()
    }

    /**
     * Clears the selection.
     */
    clear() {
        this.items = {}
        log.info('Cleared selection')
        this.notifyListeners()
    }

    /**
     * @param key a model key
     * @returns true if the item with the given key is selected
     */
    isSelected(key: ModelKey): boolean {
        return !!this.items[key.id]
    }

    /**
     * Iterates over the selected items.
     * @param fn a function to call on each selected item
     */
    each(fn: (item: IModel) => any) {
        for (let [_, item] of Object.entries(this.items)) {
            fn(item)   
        }
    }

    private listeners: Record<string,SelectionListener> = {}

    /**
     * Registers a listener function that will get called when the selection changes.
     * @param key a unique key that identifies the listener (to be used by removeListener)
     * @param listener a function that will be called whenever the selection changes
     */
    addListener(key: string, listener: SelectionListener) {
        this.listeners[key] = listener
    }

    /**
     * Removes a change listener.
     * @param key the unique key of the listener passed to addListener
     */
    removeListener(key: string) {
        delete this.listeners[key]
    }

    private notifyListeners() {
        for (let listener of Object.values(this.listeners)) {
            listener(this)
        }
    }

}