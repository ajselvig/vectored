import * as tuff from 'tuff-core'
import { IModel, ModelKey } from '../model/model'
import { OverlayContext } from '../view/overlay'


export const modelKey = tuff.messages.typedKey<ModelKey>()


export function attachEmits(model: IModel, elem: tuff.svg.SvgParentTag) {
    elem.emitMouseDown(modelKey, model.key)
    elem.emitMouseOver(modelKey, model.key)
    elem.emitMouseOut(modelKey, model.key)
    // we don't need to emit MouseMove or MouseUp since 
    // those are emitted from the viewport directly
}


export abstract class Interactor {
    onMouseDown(_model: IModel, _event: MouseEvent) {
    }
    
    onMouseOver(_model: IModel, _event: MouseEvent) {
    }
    
    onMouseOut(_model: IModel, _event: MouseEvent) {
    }
    
    onMouseMove(_event: MouseEvent) {
    }
    
    onMouseUp(_event: MouseEvent) {
    }

    onKeyPress(_m: tuff.messages.Message<"keypress", tuff.messages.KeyPress>) {

    }

    abstract renderOverlay(ctx: OverlayContext): void
}