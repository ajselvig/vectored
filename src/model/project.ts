import * as box from '../geom/box'
import Model, { IModel } from './model'
import Tile from './tile'

export default class Project extends Model<Tile> {
    readonly items: {[id: string]: IModel}

    constructor(id?: string|null) {
        super('project', id)
        this.items = {}
    }

    makeTile(x: number, y: number, width: number, height: number): Tile {
        const tile = new Tile(this, undefined, box.make(x, y, width, height))
        this.append(tile)
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
    get boundingBox(): box.Box {
        let b: box.Box|undefined = undefined
        this.eachOfType("tile", tile => {
            if (b) {
                b = box.union(b, tile.bounds)
            }
            else {
                b = tile.bounds
            }
        })
        return b!
    }


    /**
     * The size of the dot grid on the backing plane.
     */
    planeGridSize: number = 25


}