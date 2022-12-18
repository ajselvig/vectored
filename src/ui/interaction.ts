import * as tuff from 'tuff-core'
import { IModel, ModelKey } from '../model/model'
import { OverlayContext } from '../view/overlay'


export const key = tuff.messages.typedKey<ModelKey>()


export function attachEmits(model: IModel, elem: tuff.svg.SvgParentTag) {
    elem.emitMouseDown(key, model.key)
    elem.emitMouseOver(key, model.key)
    elem.emitMouseOut(key, model.key)
}


export abstract class Interactor {

    abstract onMouseDown(model: IModel, event: MouseEvent): void
    
    onMouseOver(_model: IModel, _event: MouseEvent) {

    }
    
    onMouseOut(_model: IModel, _event: MouseEvent) {

    }

    abstract renderOverlay(ctx: OverlayContext): void
}