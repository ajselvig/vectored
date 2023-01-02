import Project from '../model/project'
import Tile, { TileDef } from '../model/tile'
import * as tuff from 'tuff-core'
import { IModel, ModelDef } from '../model/model'
const box = tuff.box
import Group from '../model/group'
import Path, { d2PathDef, OpenOrClosed, PathDef, points2Def, printPathDef, transformPath } from '../model/path'
import {SaxesParser} from 'saxes'
import { attributes2StyleDef, attrs2GradientStop, attrs2LinearGradientDef, attrs2RadialGradientDef, LinearGradientDef, RadialGradientDef } from '../model/style'
import { parseTransform, transform2Mat } from '../model/transform'
import Use, { UseDef } from '../model/use'
import { Mat } from 'tuff-core/mat'
const mat = tuff.mat

const log = new tuff.logging.Logger("SVG IO")

type RawAttrs = Record<string, string>

type ParseParent = {tag: string, model: IModel|null, transform: Mat}

/**
 * Parses a raw SVG document into a {Tile}.
 */
export class SvgParser {

    doc!: SVGSVGElement

    constructor(readonly raw: string) {
    }

    currentGradient?: LinearGradientDef | RadialGradientDef
    currentTransform = mat.identity()

    toTile(project: Project): Tile {
        const stack = Array<ParseParent>()
        
        const tileStack = Array<Tile>()

        const topTile = () => {
            return tileStack[tileStack.length-1]
        }
        
        // keep track of which tags are skipped on open so 
        // we can also skip them on close
        const skippedTags: Record<string, boolean> = {}

        // map all document ids to the imported model objects
        const idMap: {[id: string]: IModel} = {}
        
        // pushes a child to the stack and adds it to the previous parent
        const pushParent = (tag: string, model: IModel|null, transform: Mat|null) => {
            if (model) {
                if (stack.length) {
                    const parent = stack[stack.length-1]
                    if (parent.model) {
                        parent.model.append(model)
                    }
                    else {
                        throw `Trying to append a ${model.type} model to a ${parent.tag} parent with no model!`
                    }
                }
                else if (model.type == "tile") {
                    // this will become the root tile
                }
                else { // stack is empty and we're not trying to add an svg element
                    throw `Trying to add a "${tag}" to an empty stack!`
                }

                if (model.type == 'tile') {
                    tileStack.push(model as Tile)
                }

                if (model.def?.externId?.length) {
                    idMap[model.def.externId] = model
                }
            }

            // apply the new transform to the previous one
            if (transform) {
                this.currentTransform = tuff.mat.multiply(this.currentTransform, transform)
            }
            stack.push({tag, model, transform: this.currentTransform})
        }

        // keep track of all use elements imported
        const uses = Array<Use>()

        // peeks at the latest parent on the stack
        const peekParent = () => {
            return stack[stack.length-1]
        }

        // pops the latest parent from the stack
        const popParent = (tag: string) => {
            const parent = peekParent()
            if (parent.tag == tag) {
                stack.pop()
                if (parent.model == topTile() && tileStack.length > 1) {
                    tileStack.pop()
                }
            }
            else {
                throw `Popping tag ${tag} when the top of the stack is ${parent.tag}, this doesn't seem right!`
            }
            const grandparent = peekParent()
            if (grandparent) {
                this.currentTransform = grandparent.transform
            }
            else {
                this.currentTransform = mat.identity()
            }
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
            const attrs = tag.attributes
            let child: IModel|null = null
            let transform: Mat|null = null
            switch (tagName) {
                case "svg":
                    child = this.parseSvg(attrs, project)
                    break
                case "g":
                    [child, transform] = this.parseGroup(attrs, project)
                    break
                case "polygon":
                    [child, transform] = this.parsePolygon(attrs, project, "closed")
                    break
                case "polyline":
                    [child, transform] = this.parsePolygon(attrs, project, "open")
                    break
                case "path":
                    [child, transform] = this.parsePath(attrs, project)
                    break
                case "lineargradient":
                    this.parseLinearGradient(attrs, topTile())
                    break
                case "radialgradient":
                    this.parseRadialGradient(attrs, topTile())
                    break
                case "stop":
                    this.parseGradientStop(attrs)
                    break
                case "title":
                    log.debug(`title tag`, tag)
                    break
                case "use":
                    [child, transform] = this.parseUse(attrs, project)
                    uses.push(child as Use)
                    break
                default:
                    skippedTags[tagName] = true
                    return
            }
            pushParent(tagName, child, transform)
        })

        parser.on("text", text => {
            if (!text || !text.trim().length) {
                return
            }
            const parent = peekParent()
            if (parent.tag == 'title') {
                log.debug(`Assigning tile name '${text}'`)
                topTile().def.name = text
            }
            else if (parent.tag == 'svg') {
                // don't really care, it's probably from a skipped meta tag
            }
            else {
                log.warn(`Don't know what to do with text for tag ${parent.tag}: "${text}"`)
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
            popParent(tagName)
        })

        parser.write(this.raw).close()

        const rootTile = tileStack[0]
        if (!rootTile) {
            throw `No root svg element in the document!`
        }
        project.append(rootTile)

        // assign the internal ids to all of the uses
        for (let use of uses) {
            const id = use.def.referenceId
            const model = idMap[id]
            log.debug(`<use> references ${id}, which maps to `, model)
            if (model?.def?.externId) {
                use.def.referenceId = model.id
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
        log.debug(`Parsing svg tag`, attrs)
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

    parseGroup(attrs: RawAttrs, project: Project): [Group,Mat|null] {
        log.debug(`Parsing group`, attrs)
        const def = {}
        this.parseBaseDef(attrs, def)
        const transform = this.parseTransforms(attrs)
        this.parseStyle(attrs, def)
        return [new Group(project, def), transform]
    }

    parsePolygon(attrs: RawAttrs, project: Project, openOrClosed: OpenOrClosed): [Path,Mat|null] {
        const points = attrs['points']
        if (!points) {
            throw `Polygon/Polyline tag doesn't have a 'points' attribute!`
        }
        log.debug(`Parsing polygon with with points "${points}"`, attrs)
        let def: PathDef = {
            subpaths: [points2Def(points, openOrClosed)]
        }
        this.parseBaseDef(attrs, def)
        const transform = this.parseTransforms(attrs)
        let totalTransform = this.currentTransform
        if (transform) {
            totalTransform = mat.multiply(totalTransform, transform)
        }
        def = transformPath(def, totalTransform)
        this.parseStyle(attrs, def)
        const path = new Path(project, def)
        path.def = def
        return [path, transform]
    }

    parsePath(attrs: RawAttrs, project: Project): [Path,Mat|null] {
        const d = attrs["d"]!
        log.debug(`Parsing path`, attrs)
        let def = d2PathDef(d)
        this.parseBaseDef(attrs, def)
        const transform = this.parseTransforms(attrs)
        let totalTransform = this.currentTransform
        if (transform) {
            totalTransform = mat.multiply(totalTransform, transform)
        }
        def = transformPath(def, totalTransform)
        this.parseStyle(attrs, def)
        const path = new Path(project, def)
        log.debug(`Parsed path "${d}" to:`, printPathDef(path.def))
        return [path, transform]
    }

    parseUse(attrs: RawAttrs, project: Project): [Use,Mat|null] {
        log.debug(`Parsing use tag`, attrs)
        let referenceId = attrs['xlink:href'] || attrs['href']
        if (referenceId?.length) {
            referenceId = referenceId.replace('#', '')
        }
        const def: UseDef = {referenceId}
        this.parseBaseDef(attrs, def)
        const transform = this.parseTransforms(attrs)
        if (transform) {
            // we need to undo the current transform, add this element's transform,
            // then add the current transform back
            log.info(`this.currentTransform: `, this.currentTransform)
            let totalTransform = mat.multiply(transform, mat.invert(this.currentTransform))
            totalTransform = mat.multiply(this.currentTransform, totalTransform)
            def.transform = totalTransform
        }
        else {
            def.transform = this.currentTransform
        }
        this.parseStyle(attrs, def)
        return [new Use(project, def), transform]
    }

    parseTransforms(attrs: RawAttrs): Mat | null {
        if (attrs['transform']) {
            const list = parseTransform(attrs['transform'])
            if (list.length) {
                let m = mat.identity()
                for (const transform of list) {
                    m = mat.multiply(m, transform2Mat(transform))
                }
                return m
            }
        }
        return null
    }

    parseStyle(attrs: RawAttrs, def: ModelDef) {
        const style = attributes2StyleDef(attrs)
        if (style) {
            def.style = style
        }
    }

    parseLinearGradient(attrs: RawAttrs, tile: Tile) {
        log.debug("Parsing linear gradient", attrs)
        this.currentGradient = attrs2LinearGradientDef(attrs)
        tile.addPaintServer(this.currentGradient!)
    }

    parseRadialGradient(attrs: RawAttrs, tile: Tile) {
        log.debug("Parsing radial gradient", attrs)
        this.currentGradient = attrs2RadialGradientDef(attrs)
        tile.addPaintServer(this.currentGradient!)
    }

    parseGradientStop(attrs: RawAttrs) {
        log.debug("Parsing gradient stop", attrs)
        if (!this.currentGradient) {
            throw `Parsing a gradient stop with no current gradient!`
        }
        const stop = attrs2GradientStop(attrs)
        this.currentGradient.stops.push(stop)
    }

}