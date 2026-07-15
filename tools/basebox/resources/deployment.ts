import { Api } from "./api";

const api = new Api();

export async function deployment(operation: string, input: any) {
  if (!api.basebox) {
    // not initialized. Must initialize first
  }

  const managed = api.managed;

  switch (operation) {
    case "deploy":
      const { success } = await managed.deploy({ dist: input.dist, domain: input.domain });
      return { success };

    default:
      throw new Error(`Unsupported project operation: ${operation}`)
  }
}
