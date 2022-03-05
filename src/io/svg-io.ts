import Project from '../model/project'
import Tile, { TileDef } from '../model/tile'
import * as tuff from 'tuff-core'
import { IModel, ModelDef, ProjectDef, StyledModelDef } from '../model/model'
import * as box from '../geom/box'
import Group from '../model/group'
import Path, { d2PathDef, OpenOrClosed, PathDef, points2Def, printPathDef } from '../model/path'
import {SaxesParser} from 'saxes'
import { attributes2StyleDef, attrs2GradientStop, attrs2LinearGradientDef, attrs2RadialGradientDef, LinearGradientDef, RadialGradientDef } from '../model/style'
import { parseTransform } from '../model/transform'
import Use, { UseDef } from '../model/use'

const log = new tuff.logging.Logger("SVG IO")

type RawAttrs = Record<string, string>

/**
 * Parses a raw SVG document into a {Tile}.
 */
export class SvgParser {

    doc!: SVGSVGElement

    constructor(readonly raw: string) {
    }

    currentGradient?: LinearGradientDef | RadialGradientDef

    toTile(project: Project): Tile {
        let rootTile: Tile|null = null

        const stack: IModel[] = []
        
        // keep track of which tags are skipped on open so 
        // we can also skip them on close
        const skippedTags: Record<string, boolean> = {}

        // map all document ids to the imported model objects
        const idMap: {[id: string]: IModel} = {}
        
        // pushes a child to the stack and adds it to the previous parent
        const pushParent = (child: IModel) => {
            if (stack.length) {
                stack[stack.length-1].append(child)
            }
            else if (child.type == "tile") {
                rootTile = child as Tile
            }
            else { // stack is empty and we're not trying to add an svg element
                throw `Trying to add a "${child.type}" to an empty stack!`
            }
            stack.push(child)

            if (child.def.externId) {
                idMap[child.def.externId] = child
            }
        }

        // keep track of all use elements imported
        const uses = Array<Use>()

        // pops the latest parent from the stack
        const popParent = () => {
            return stack.pop()
        }

        // happy-dom does not support using DOMParser to parse XML documents:
        // https://github.com/capricorn86/happy-dom/issues/282
        // and jsdom didn't seem to work correctly either, so we're using a generic SAX parser
        const parser = new SaxesParser()
        parser.on("error", e => {
            log.warn("Error", e)
        })

        parser.on("opentag", tag => {
            const tagName = tag.name.toLowerCase()
            if (skippedTags[tagName]) {
                return
            }
            switch (tagName) {
                case "svg":
                    pushParent(this.parseSvg(tag.attributes, project))
                    break
                case "g":
                    pushParent(this.parseGroup(tag.attributes, project))
                    break
                case "polygon":
                    pushParent(this.parsePolygon(tag.attributes, project, "closed"))
                    break
                case "polyline":
                    pushParent(this.parsePolygon(tag.attributes, project, "open"))
                    break
                case "path":
                    pushParent(this.parsePath(tag.attributes, project))
                    break
                case "lineargradient":
                    this.parseLinearGradient(tag.attributes, rootTile!)
                    break
                case "radialgradient":
                    this.parseRadialGradient(tag.attributes, rootTile!)
                    break
                case "stop":
                    this.parseGradientStop(tag.attributes)
                    break
                case "use":
                    const use = this.parseUse(tag.attributes, project)
                    uses.push(use)
                    pushParent(use)
                    break
                default:
                    skippedTags[tagName] = true
            }
        })

        parser.on("closetag", tag => {
            const tagName = tag.name.toLowerCase()
            if (skippedTags[tagName]) {
                return
            }
            if (tagName.includes('gradient')) {
                this.currentGradient = undefined
            }
            popParent()
        })

        parser.write(this.raw).close()

        if (!rootTile) {
            throw `No root svg element in the document!`
        }
        project.append(rootTile)

        // assign the internal ids to all of the uses
        for (let use of uses) {
            const id = use.def.href.replace('#', '')
            const model = idMap[id]
            log.info(`use references ${id}, which maps to `, model)
            if (model && model.def.externId) {
                use.def.href = '#' + model.id
            }
        }

        return rootTile
    }

    parseBaseDef(attrs: RawAttrs, def: ModelDef) {
        const id = attrs['id']
        if (id && id.length) {
            def.externId = id
            def.name = id
        }
    }

    parseSvg(attrs: RawAttrs, project: Project): Tile {
        log.info(`Parsing svg tag`, attrs)
        const viewBox = attrs['viewBox'].split(/\s+/).map(n => {return parseFloat(n)})
        if (viewBox.length != 4) {
            throw `Expect viewBox attribute to have 4 values, not ${viewBox.length}: ${viewBox}`
        }
        const bounds = box.make(viewBox)
        const def: TileDef = {bounds}
        this.parseBaseDef(attrs, def)
        const tile = new Tile(project, def)
        return tile
    }

    parseGroup(attrs: RawAttrs, project: Project): Group {
        log.info(`Parsing group`, attrs)
        const def = {}
        this.parseBaseDef(attrs, def)
        this.parseTransforms(attrs, def)
        this.parseStyle(attrs, def)
        return new Group(project, def)
    }

    parsePolygon(attrs: RawAttrs, project: Project, openOrClosed: OpenOrClosed) {
        const points = attrs['points']
        if (!points) {
            throw `Polygon/Polyline tag doesn't have a 'points' attribute!`
        }
        log.info(`Parsing polygon with with points "${points}"`, attrs)
        const def: PathDef = {
            subpaths: [points2Def(points, openOrClosed)]
        }
        this.parseBaseDef(attrs, def)
        this.parseTransforms(attrs, def)
        this.parseStyle(attrs, def)
        const path = new Path(project, def)
        path.def = def
        return path
    }

    parsePath(attrs: RawAttrs, project: Project) {
        const d = attrs["d"]!
        log.info(`Parsing path`, attrs)
        const def = d2PathDef(d)
        this.parseBaseDef(attrs, def)
        this.parseTransforms(attrs, def)
        this.parseStyle(attrs, def)
        const path = new Path(project, def)
        log.info(`Parsed path "${d}" to:`, printPathDef(path.def))
        return path
    }

    parseUse(attrs: RawAttrs, project: Project): Use {
        log.info(`Parsing use tag`, attrs)
        const href = attrs['xlink:href'] || attrs['href']
        const def: UseDef = {href}
        this.parseBaseDef(attrs, def)
        this.parseTransforms(attrs, def)
        this.parseStyle(attrs, def)
        return new Use(project, def)
    }

    parseTransforms(attrs: RawAttrs, def: ProjectDef) {
        if (attrs['transform']) {
            const transforms = parseTransform(attrs['transform'])
            if (transforms.length) {
                def.transforms = transforms
            }
        }
    }

    parseStyle(attrs: RawAttrs, def: StyledModelDef) {
        const style = attributes2StyleDef(attrs)
        if (style) {
            def.style = style
        }
    }


    parseLinearGradient(attrs: RawAttrs, tile: Tile) {
        log.info("Parsing linear gradient", attrs)
        this.currentGradient = attrs2LinearGradientDef(attrs)
        tile.addPaintServer(this.currentGradient!)
    }

    parseRadialGradient(attrs: RawAttrs, tile: Tile) {
        log.info("Parsing radial gradient", attrs)
        this.currentGradient = attrs2RadialGradientDef(attrs)
        tile.addPaintServer(this.currentGradient!)
    }

    parseGradientStop(attrs: RawAttrs) {
        log.info("Parsing gradient stop", attrs)
        if (!this.currentGradient) {
            throw `Parsing a gradient stop with no current gradient!`
        }
        const stop = attrs2GradientStop(attrs)
        this.currentGradient.stops.push(stop)
    }

}