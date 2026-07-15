import { Api } from "./api";

const api = new Api();

export async function deployment(operation: string, input: any) {
  const managed = api.managed;

  switch (operation) {
    case "deploy": {
      const result = await managed.deploy({
        dist: input.dist,
        domain: input.domain,
      });

      return { ...result, domain: `https://${input.domain}` };
    }

    default:
      throw new Error(`Unsupported deployment operation: ${operation}`);
  }
}
