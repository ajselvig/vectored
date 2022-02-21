
import { ModelDef, ModelRenderTag, ProjectModel } from './model'
import Path from "./path"
import Project from "./project"

export default class Group extends ProjectModel<ModelDef, Path> {
    
    constructor(readonly project: Project, id?: string|null) {
        super('group', project, {}, id)
    }

    render(parent: ModelRenderTag): void {
        parent.g(group => {
            this.each(child => {
                child.render(group)
            })
        })
    }
}