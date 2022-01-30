import Flatten from '@flatten-js/core'
import Model, { IModel } from './model'
import Tile from './tile'

export default class Project extends Model<Tile> {
    readonly items: {[id: string]: IModel}

    constructor(id?: string|null) {
        super('project', id)
        this.items = {}
    }

    makeTile(xmin: number, ymin: number, xmax: number, ymax: number): Tile {
        const tile = new Tile(this, undefined, new Flatten.Box(xmin, ymin, xmax, ymax))
        this.add(tile)
        return tile
    }

    get project(): Project {
        return this
    }

    register(item: IModel) {
        this.items[item.id] = item
    }

    /**
     * Globally looks up an item by id
     * @param id the id of the item
     * @returns the item
     */
    find<T extends IModel>(id: string): T {
        return this.items[id] as any as T
    }

    /**
     * @returns the bounding box of all tiles in the project
     */
    get boundingBox(): Flatten.Box {
        let box = new Flatten.Box()
        this.each("tile", tile => {
            box = box.merge(tile.box)
        })
        return box
    }

}