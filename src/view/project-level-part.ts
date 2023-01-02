import Project from "../model/project"
import { AppPart } from "./app-part"
import * as tuff from 'tuff-core'


/**
 * State for al project-level parts.
 */
export type ProjectState = {
    project: Project
    app: AppPart
}

/**
 * Base class for parts that work at the project level.
 */
export abstract class ProjectLevelPart<T extends ProjectState> extends tuff.parts.Part<T> {

    get app() {
        return this.state.app
    }

    get project() {
        return this.state.project
    }

}