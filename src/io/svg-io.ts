import Project from '../model/project'
import Tile from '../model/tile'
import * as tuff from 'tuff-core'
import { IModel, ProjectDef } from '../model/model'
import * as vec from '../geom/vec'
import * as box from '../geom/box'
import Group from '../model/group'
import Path, { d2PathDef, OpenOrClosed, points2Def, printPathDef } from '../model/path'
import {SaxesParser, SaxesTagPlain} from 'saxes'
import { attributes2StyleDef, attrs2GradientStop, attrs2LinearGradientDef, attrs2RadialGradientDef, GradientStop, LinearGradientDef, PaintServerDef, RadialGradientDef } from '../model/style'
import { parseTransform } from '../model/transform'

const log = new tuff.logging.Logger("SVG IO")

type RawTag = SaxesTagPlain

type RawAttrs = Record<string, string>

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

    currentGradient?: LinearGradientDef | RadialGradientDef

    toTile(project: Project): Tile {
        let rootTile: Tile|null = null

        const stack: IModel[] = []
        let lastSkippedTag = ""
        
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
        }

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
            switch (tagName) {
                case "svg":
                    pushParent(this.parseSvg(tag, project))
                    break
                case "g":
                    pushParent(this.parseGroup(tag, project))
                    break
                case "polygon":
                    pushParent(this.parsePolygon(tag, project, "closed"))
                    break
                case "polyline":
                    pushParent(this.parsePolygon(tag, project, "open"))
                    break
                case "path":
                    pushParent(this.parsePath(tag, project))
                    break
                case "lineargradient":
                    this.parseLinearGradient(tag.attributes, rootTile!)
                    break
                case "stop":
                    this.parseGradientStop(tag.attributes)
                    break
                default:
                    lastSkippedTag = tagName
                    log.warn(`Skipping unsupported tag ${tagName}`)
            }
        })

        parser.on("closetag", tag => {
            const tagName = tag.name.toLowerCase()
            if (lastSkippedTag == tagName) {
                return // don't pop since we didn't push
            }
            log.info(`Close ${tag.name} tag`)
            popParent()
        })

        parser.write(this.raw).close()

        if (!rootTile) {
            throw `No root svg element in the document!`
        }
        project.append(rootTile)

        return rootTile
    }

    parseSvg(tag: RawTag, project: Project): Tile {
        log.info(`Parsing ${tag.name} tag`, tag.attributes)
        const viewBox = tag.attributes['viewBox'].split(/\s+/).map(n => {return parseFloat(n)})
        if (viewBox.length != 4) {
            throw `Expect viewBox attribute to have 4 values, not ${viewBox.length}: ${viewBox}`
        }
        const bounds = box.make(viewBox)
        const tile = new Tile(project, {bounds})
        return tile
    }

    parseGroup(tag: RawTag, project: Project): Group {
        log.info(`Parsing group`, tag.attributes)
        return new Group(project)
    }

    parsePolygon(tag: RawTag, project: Project, openOrClosed: OpenOrClosed) {
        const points = tag.attributes['points']
        if (!points) {
            throw `Polygon/Polyline tag doesn't have a 'points' attribute!`
        }
        log.info(`Parsing polygon with with points "${points}"`, tag.attributes)
        const def = points2Def(points, openOrClosed)
        def.style = attributes2StyleDef(tag.attributes)
        this.parseTransforms(tag, def)
        const path = new Path(project, def)
        path.def = def
        return path
    }

    parsePath(tag: RawTag, project: Project) {
        const d = tag.attributes["d"]!
        log.info(`Parsing path`, tag.attributes)
        const def = d2PathDef(d)
        def.style = attributes2StyleDef(tag.attributes)
        this.parseTransforms(tag, def)
        const path = new Path(project, def)
        log.info(`Parsed path "${d}" to:`, printPathDef(path.def))
        return path
    }

    parseTransforms(tag: RawTag, def: ProjectDef) {
        if (tag.attributes['transform']) {
            const transforms = parseTransform(tag.attributes['transform'])
            if (transforms.length) {
                def.transforms = transforms
            }
        }
    }


    parseLinearGradient(attrs: RawAttrs, tile: Tile) {
        log.info("Parsing linear gradient", attrs)
        this.currentGradient = attrs2LinearGradientDef(attrs)
        tile.addPaintServer(this.currentGradient!)
    }

    parseradialGradient(attrs: RawAttrs, tile: Tile) {
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