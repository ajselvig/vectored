import { IModel, ModelKey, ModelTypeName } from "../model/model"
import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
import * as mat from '../geom/mat'
import * as box from '../geom/box'
import { Interactor } from "./interaction"
import { OverlayContext } from "../view/overlay"
import Tile from "../model/tile"
import { arrays } from "tuff-core"

const log = new tuff.logging.Logger("Selection")

export type SelectionListener = (fn: Selection) => any

export default class Selection {

    constructor() {

    }

    private items: {[id: string]: IModel} = {}

    /**
     * Appends an item to the selection.
     * @param item an item to be selected
     * @param clear whether to clear the selection before adding the item
     */
    append(item: IModel, clear: boolean = false) {
        const newTile = item.tile
        const existingTile = this.tile
        const types = this.types
        const allTiles = types.length==1 && types[0]=='tile' && item.type=='tile'
        if (clear || (newTile && existingTile && !allTiles && newTile != existingTile)) { // force clear if they're selecting from a different tile
            this.items = {}
        }
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
     * @returns the number of items in the selection
     */
    count() {
        return Object.keys(this.items).length
    }

    /**
     * Gets a list of all unique model types currently in the selection.
     */
    get types(): Array<ModelTypeName> {
        return arrays.unique(this.map(c => c.type))
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

    /**
     * Maps over the selected items.
     * @param fn a function to call on each selected item
     */
    map<T>(fn: (item: IModel) => T) {
        return Object.values(this.items).map(fn)
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

    /**
     * The shared tile of all selected values, or undefined if there's more than one.
     */
    get tile(): Tile|undefined {
       const tiles = arrays.unique(this.map(c => c.tile))
       if (tiles.length == 1) {
           return tiles[0]
       }
       return undefined
    }

}

export const color = '#'
export class SelectionInteractor extends Interactor {

    constructor(readonly selection: Selection) {
        super()
    }
    
    onMouseDown(model: IModel, event: MouseEvent) {
        log.info(`Mouse down`, model)
        this.selection.append(model, !event.shiftKey)
    }

    renderOverlay(ctx: OverlayContext) {
        const types = this.selection.types
        if (types.length == 1 && types[0] == 'tile') {
            // if they're all tiles, put a box around their bounds
            let bounds = box.unionAll(this.selection.map(t => (t as Tile).def.bounds))
            bounds = mat.transformBox(ctx.virtualToActual, bounds)
            this.renderSelectionBox(ctx, bounds)
        }
        else {
            // something other than all tiles
            const tile = this.selection.tile
            if (tile) {
                ctx.setTile(tile)
            }
            const localBounds = box.unionAll(this.selection.map(m => m.localBounds))
            const actualBounds = mat.transformBox(ctx.localToActual, localBounds)
            this.renderSelectionBox(ctx, actualBounds)
        }
    }

    renderSelectionBox(ctx: OverlayContext, bounds: box.Box) {
        log.info(`Rendering bounds at`, bounds)
        ctx.parent.rect({
            x: bounds.x, 
            y: bounds.y, 
            width: bounds.width,
            height: bounds.height,
            fill: 'transparent',
            stroke: styles.colors.selection,
            strokeWidth: 3,
            strokeDasharray: '6 6'
        })
    }
}