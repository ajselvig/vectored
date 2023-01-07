import { IModel, ModelKey, ModelTypeName } from "../model/model"
import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
const mat = tuff.mat
const box = tuff.box
const vec = tuff.vec
const arrays = tuff.arrays
import { Interactor } from "./interaction"
import { OverlayContext } from "../view/overlay"
import Tile, { tileUpdatedKey } from "../model/tile"
import { Vec } from "tuff-core/vec"
import { Box } from "tuff-core/box"
import { AppPart } from "../view/app-part"

const log = new tuff.logging.Logger("Selection")

export type SelectionListener = (fn: Selection) => any

export default class Selection {

    constructor(readonly app: AppPart) {

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
    get count() {
        return Object.keys(this.items).length
    }

    /**
     * @returns true if the selection is empty
     */
    get empty() {
        return this.count == 0
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
     * All tiles for selected items.
     */
    get tiles(): Tile[] {
        return arrays.unique(arrays.compact(this.map(c => c.tile)))
    }

    /**
     * The shared tile of all selected values, or undefined if there's more than one.
     */
    get tile(): Tile|undefined {
       const tiles = this.tiles
       if (tiles.length == 1) {
           return tiles[0]
       }
       return undefined
    }

    /**
     * Emits the tilesUpdatedKey message for all tiles.
     */
    emitTilesUpdated() {
        this.tiles.forEach(tile => {
            this.app.emitMessage(tileUpdatedKey, {id: tile.id})
        })
    }

    /**
     * Clear the interact transform on all selected items.
     */
    clearInteractTransform() {
        this.each(item => {
            item.interactTransform = undefined
        })
    }

    /**
     * A single item can be hovered at any given time.
     */
    hoverItem?: IModel = undefined

    /**
     * Translates all selected models by the given amount.
     * @param v the translation to apply
     */
    translate(v: Vec) {
        log.info(`Translating selection`, v)
        this.clearInteractTransform()
        const possibleActions = Object.values(this.items).map(item => {
            return item.computeTranslateAction(v)
        })
        const actions = arrays.compact(possibleActions)
        if (actions.length) {
            log.info(`Translating ${actions.length} items`, actions)
            this.app.history.push('translate', actions)
        }
        else {
            log.info("Nothing to translate")
        }
    }

}

/**
 * Have one consistent way of computing the position of a mouse event.
 * @param event a mouse event
 * @returns the client position of the event
 */
function eventPos(event: MouseEvent): Vec {
    return {x: event.clientX, y: event.clientY}
}

/**
 * The default interactor that lets the user select and move one or more model objects.
 */
export class SelectionInteractor extends Interactor {

    dragAnchor?: Vec

    constructor(readonly selection: Selection) {
        super()
    }

    onMouseOver(model: IModel, _: MouseEvent) {
        log.info('Mouse Over', model)
        this.selection.hoverItem = model
    }

    onMouseOut(model: IModel, _: MouseEvent) {
        log.info('Mouse Out', model)
        this.selection.hoverItem = undefined
    }
    
    onMouseDown(model: IModel, event: MouseEvent) {
        log.info(`Mouse down`, model)
        this.selection.append(model, !event.shiftKey)

        // only start a drag operation if the types are consistent
        const types = this.selection.types
        if (!types.includes('tile')) {
            this.dragAnchor = eventPos(event)
            log.info(`Beginning drag at `, this.dragAnchor)
        }

    }

    onMouseMove(event: MouseEvent) {
        if (!this.dragAnchor || this.selection.empty) {
            return
        }

        const pos = eventPos(event)
        const diff = vec.subtract(pos, this.dragAnchor)
        log.info(`Drag ${this.selection.count} items by `, diff)
        const transform = mat.builder().translate(diff).build()
        this.selection.each(item => {
            item.interactTransform = transform
        })
        this.selection.emitTilesUpdated()
    }

    onMouseUp(event: MouseEvent) {
        if (!this.dragAnchor || this.selection.empty) {
            return
        }
        const pos = eventPos(event)
        const diff = vec.subtract(pos, this.dragAnchor)
        log.info(`Translate ${this.selection.count} items by `, diff)
        this.selection.translate(diff)
        this.dragAnchor = undefined
    }

    onKeyPress(m: tuff.messages.Message<"keypress", tuff.messages.KeyPress>): void {
        log.info(`Selection KeyPress: ${m.data.id}`)

        // don't keep going if the selection is empty
        if (this.selection.empty) {
            return
        }
        
        switch (m.data.key) {
            case "arrowup": 
                this.selection.translate({x: 0, y: -1})
                m.event.preventDefault()
                return
            case "arrowdown": 
                this.selection.translate({x: 0, y: 1})
                m.event.preventDefault()
                return
            case "arrowleft": 
                this.selection.translate({x: -1, y: 0})
                m.event.preventDefault()
                return
            case "arrowright": 
                this.selection.translate({x: 1, y: 0})
                m.event.preventDefault()
                return
        }
    }

    renderOverlay(ctx: OverlayContext) {
        // highlight the hover element
        if (this.selection.hoverItem) {
            if (this.selection.hoverItem.tile) {
                ctx.setTile(this.selection.hoverItem.tile)
            }
            let localBounds = this.selection.hoverItem.localBounds

            // apply the interact transform
            if (this.selection.hoverItem.interactTransform) {
                localBounds = mat.transformBox(this.selection.hoverItem.interactTransform, localBounds)
            }

            const actualBounds = mat.transformBox(ctx.localToActual, localBounds)
            this.renderSelectionBox(ctx, actualBounds, 'hover')
        }

        const tile = this.selection.tile
        if (tile) {
            ctx.setTile(tile)
        }

        // highlight the selected elements
        const types = this.selection.types
        if (types.length == 1 && types[0] == 'tile') {
            // if they're all tiles, put a box around their bounds
            let bounds = box.unionAll(this.selection.map(t => (t as Tile).def.bounds))
            bounds = mat.transformBox(ctx.virtualToActual, bounds)
            this.renderSelectionBox(ctx, bounds)
        }
        else if (this.selection.count) {
            // something other than all tiles

            // get all local bounds with the interact transform applied
            const allLocalBounds = this.selection.map(m => {
                let lb = m.localBounds
                if (m.interactTransform) {
                    lb = mat.transformBox(m.interactTransform, lb)
                }
                return lb
            })

            const localBounds = box.unionAll(allLocalBounds)

            const actualBounds = mat.transformBox(ctx.localToActual, localBounds)
            this.renderSelectionBox(ctx, actualBounds)
        }
    }

    renderSelectionBox(ctx: OverlayContext, bounds: Box, reason: 'selection'|'hover' = 'selection') {
        log.debug(`Rendering ${reason} bounds at`, bounds)
        const attrs = {
            x: bounds.x, 
            y: bounds.y, 
            width: bounds.width,
            height: bounds.height,
            fill: 'transparent',
            stroke: styles.colors.selection,
            strokeWidth: 2,
            strokeDasharray: '6 6'
        }
        if (reason == 'hover') {
            attrs.strokeWidth = 1
            attrs.strokeDasharray = ''
            attrs.stroke = styles.colors.border
        }
        ctx.parent.rect(attrs)
    }
}