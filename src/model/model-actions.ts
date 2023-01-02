import { ActionBase } from "../ui/actions"
import { AppPart } from "../view/app-part"
import { ModelDefMap, ModelTypeMap, ModelTypeName } from "./model"
import { tileUpdatedKey } from "./tile"


/**
 * An action for updating the definition of an existing model.
 */
export class UpdateModelAction<TypeName extends ModelTypeName> extends ActionBase {

    constructor(readonly type: TypeName, readonly item: ModelTypeMap[TypeName], readonly fromDef: ModelDefMap[TypeName], readonly toDef: ModelDefMap[TypeName]) {
        super()
    }

    apply(app: AppPart) {
        this.item.def = this.toDef
        this.emitTileUpdate(app)
    }

    unapply(app: AppPart) {
        this.item.def = this.fromDef
        this.emitTileUpdate(app)
    }

    emitTileUpdate(app: AppPart) {
        if (this.item.type == 'tile') {
            app.emitMessage(tileUpdatedKey, {id: this.item.id})
            return
        }
        const tile = this.item.tile
        if (tile) {
            app.emitMessage(tileUpdatedKey, {id: tile.id})
        }
    }

}