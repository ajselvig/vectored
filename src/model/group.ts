
import { ProjectModel } from './model'
import Path from "./path"
import Project from "./project"

export default class Group extends ProjectModel<{}, Path> {
    
    constructor(readonly project: Project, id?: string|null) {
        super('group', project, {}, id)
    }
}