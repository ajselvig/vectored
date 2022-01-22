
import { ProjectModel } from './model'
import Project from "./project"

export default class Path extends ProjectModel<never> {

    constructor(readonly project: Project, id?: string) {
        super('path', project, id)
    }
}