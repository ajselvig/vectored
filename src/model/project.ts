import Flatten from '@flatten-js/core'
import Model, { IModel } from './model'
import Tile from './tile'

export default class Project extends Model<Tile> {
    readonly allChildren: {[id: string]: IModel}

    constructor(id?: string|null) {
        super('project', id)
        this.allChildren = {}
    }

    makeTile(xmin: number, ymin: number, xmax: number, ymax: number): Tile {
        const tile = new Tile(this, undefined, new Flatten.Box(xmin, ymin, xmax, ymax))
        this.add(tile)
        return tile
    }

    get project(): Project {
        return this
    }

    /**
     * Globally looks up a record by id
     * @param id the id of the record
     * @returns the child
     */
    find<T extends IModel>(id: string): T {
        return this.children[id] as any as T
    }

}