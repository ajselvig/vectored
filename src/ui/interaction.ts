import * as tuff from 'tuff-core'
import { IModel, ModelKey } from '../model/model'
import { OverlayContext } from '../view/overlay'


export const key = tuff.messages.typedKey<ModelKey>()


export function attachEmits(model: IModel, elem: tuff.svg.SvgParentTag) {
    elem.emitMouseEnter(key, model.key)
    elem.emitMouseLeave(key, model.key)
    elem.emitMouseDown(key, model.key)
}


export abstract class Interactor {

    abstract onMouseDown(model: IModel, event: MouseEvent): void

    abstract renderOverlay(ctx: OverlayContext): void
}