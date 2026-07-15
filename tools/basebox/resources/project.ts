import { Api } from "./api";

const api = new Api();

export async function project(operation: string, input: any) {
  if (!api.basebox) {
    // not initialized. Must initialize first
  }

  const managed = api.managed;

  switch (operation) {
    case "list":
      const list = await managed.projects.list({ page: 1, page_size: 100 });
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
