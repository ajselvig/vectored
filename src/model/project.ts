import * as box from '../geom/box'
import { SvgParser } from '../io/svg-io'
import Model, { IModel, ModelDef, ModelRenderTag } from './model'
import Tile from './tile'

type ProjectDef = ModelDef

export default class Project extends Model<ProjectDef, Tile> {
    readonly items: {[id: string]: IModel}

    constructor(id?: string|null) {
        super('project', {}, id)
        this.items = {}
    }

    /**
     * Creates a blank tile in the project.
     * @param x the left position
     * @param y the top position
     * @param width the tile width
     * @param height the tile height
     * @returns a new {Tile}
     */
    makeTile(x: number, y: number, width: number, height: number): Tile {
        const tile = new Tile(this, {bounds: box.make(x, y, width, height)})
        this.append(tile)
        return tile
    }

    /**
     * Loads a raw SVG string into a new tile
     * @param svg a raw SVG string
     * @returns a new tile from the SVG
     */
    loadTile(svg: string): Tile {
        const parser = new SvgParser(svg)
        return parser.toTile(this)
    }

    // TODO: accept params for how to arrange tiles
    arrangeTiles() {
        let x = 0
        this.eachOfType("tile", tile => {
            tile.def.bounds = {...tile.def.bounds, x}
            x = this.clampToPlaneGrid(x + tile.def.bounds.width + 2*this.planeGridSize)
        })
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

    clampToPlaneGrid(x: number): number {
        return Math.round(x / this.planeGridSize) * this.planeGridSize
    }
    
    // this doesn't really apply to projects
    render(_: ModelRenderTag): void {
        throw "Why are you trying to render a project?"
    }


}