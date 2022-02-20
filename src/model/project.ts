import * as box from '../geom/box'
import Model, { IModel, ModelRenderTag } from './model'
import Tile from './tile'

type ProjectDef = {}

export default class Project extends Model<ProjectDef, Tile> {
    readonly items: {[id: string]: IModel}

    constructor(id?: string|null) {
        super('project', {}, id)
        this.items = {}
    }

    makeTile(x: number, y: number, width: number, height: number): Tile {
        const tile = new Tile(this, {bounds: box.make(x, y, width, height)})
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
                b = box.union(b, tile.def.bounds)
            }
            else {
                b = tile.def.bounds
            }
        })
        return b || box.make(0, 0, 100, 100)
    }


    /**
     * The size of the dot grid on the backing plane.
     */
    planeGridSize: number = 25
    
    // this doesn't really apply to projects
    render(_: ModelRenderTag): void {
        throw "Why are you trying to render a project?"
    }


}