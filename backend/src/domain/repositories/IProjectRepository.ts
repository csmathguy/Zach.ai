import { Project } from '@domain/models/Project';
import { CreateProjectDto, UpdateProjectDto } from '@domain/types';

export interface IProjectRepository {
  create(data: CreateProjectDto): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  update(id: string, data: UpdateProjectDto): Promise<Project>;
  delete(id: string): Promise<void>;
  linkThought(projectId: string, thoughtId: string): Promise<void>;
  unlinkThought(projectId: string, thoughtId: string): Promise<void>;
  setNextAction(projectId: string, actionId: string | null): Promise<void>;
}
