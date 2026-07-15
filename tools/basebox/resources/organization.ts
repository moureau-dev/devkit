import { Api } from "./api";
import { ApiKeyLevel } from "@moureau/basebox";

const api = new Api();

export async function organization(operation: string, input: any) {
  if (!api.basebox) {
    // not initialized. Must initialize first
  }

  const managed = api.managed;

  switch (operation) {
      case "create-api-key":
          const level = input.level as 'organization' | 'project' | undefined;
          const expiration = input.expiration as string | undefined;
          const projectId = input.projectId as string | undefined;

          const list = await managed.apiKeys.create({
              name: input.name,
              level,
              expires_at: expiration,
              project_id: projectId,
          });
      return list.items;

    case "create":
      const { project } = await managed.projects.create({ name: input.name, slug: input.name.toLowerCase().replace(/\s+/g, '-') });
      return project;

    case "delete":
      await managed.projects.delete(input.project);
      return { success: true };

    case "select":
      return api.selectProfile();

    default:
      throw new Error(`Unsupported project operation: ${operation}`)
  }
}
