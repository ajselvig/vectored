import Project from '../model/project'
import Tile from '../model/tile'
import * as tuff from 'tuff-core'
import { IModel, ProjectModel } from '../model/model'
import Group from '../model/group'
import Path, { d2PathDef, printPathDef } from '../model/path'
import saxes from 'saxes'

const log = new tuff.logging.Logger("SVG IO")

type RawTag = saxes.SaxesTagPlain

const supportedTags: {[tag: string]: boolean} = {
    "svg": true,
    "g": true,
    "path": true
}

/**
 * Parses a raw SVG document into a {Tile}.
 */
export class SvgParser {

    doc!: SVGSVGElement

    constructor(readonly raw: string) {
        // const domParser = new window.DOMParser()
        // this.doc = domParser.parseFromString(this.raw, 'image/svg+xml').documentElement as unknown as SVGSVGElement
        // log.info(`Loaded raw SVG into a ${this.doc.tagName} element`)
    }

    toTile(project: Project): Tile {
        let rootTile: Tile|null = null

        const stack: IModel[] = []
        
        // pushes a child to the stack and adds it to the previous parent
        const pushParent = (child: IModel) => {
            if (stack.length) {
                stack[stack.length-1].add(child)
            }
            else if (child.type == "tile") {
                rootTile = child as Tile
            }
            else { // stack is empty and we're not trying to add an svg element
                throw `Trying to add a "${child.type}" to an empty stack!`
            }
            stack.push(child)
        }

        // pops the latest parent from the stack
        const popParent = () => {
            return stack.pop()
        }

        const parser = new saxes.SaxesParser()
        parser.on("error", e => {
            log.warn("Error", e)
        })

        parser.on("opentag", tag => {
            const tagName = tag.name.toLowerCase()
            if (!supportedTags[tagName]) {
                return log.info(`Skipping unsupported tag ${tagName}`)
            }
            log.info(`Open ${tag.name} tag`, tag.attributes)
            switch (tagName) {
                case "svg":
                    pushParent(this.parseSvg(tag, project))
                    break
                case "g":
                    pushParent(this.parseGroup(tag, project))
                    break
                // case "polygon":
                //     this.parsePolygon(child as SVGPolygonElement, parent)
                //     break
                case "path":
                    pushParent(this.parsePath(tag, project))
                    break
                default:
                    throw `Tag ${tagName} is on the supported tags list but has not open event handler`
            }
        })

        parser.on("closetag", tag => {
            const tagName = tag.name.toLowerCase()
            if (!supportedTags[tagName]) {
                return
            }
            log.info(`Close ${tag.name} tag`)
            popParent()
        })

        parser.write(this.raw).close()

        if (!rootTile) {
            throw `No root svg element in the document!`
        }

        return rootTile
    }

    parseSvg(tag: RawTag, project: Project): Tile {
        log.info(`Parsing ${tag.name} tag`, tag.attributes)
        const tile = new Tile(project)
        const viewBox = tag.attributes['viewBox'].split(/\s+/).map(n => {return parseFloat(n)})
        if (viewBox.length != 4) {
            throw `Expect viewBox attribute to have 4 values, not ${viewBox.length}: ${viewBox}`
        }
        tile.place(viewBox[0], viewBox[1], viewBox[2], viewBox[3])
        return tile
    }

    parseGroup(tag: RawTag, project: Project): Group {
        log.info(`Parsing group`, tag.attributes)
        return new Group(project)
    }

    // parsePolygon(elem: SVGPolygonElement, parent: IModel) {
    //     log.info(`Parsing polygon with parent ${parent.name}`, elem.innerHTML)
    // }

    parsePath(tag: RawTag, project: Project) {
        const d = tag.attributes["d"]!
        log.info(`Parsing path`, tag.attributes)
        const path = new Path(project)
        path.def = d2PathDef(d)
        log.info(`Parsed path "${d}" to:`, printPathDef(path.def))
        return path
    }

}