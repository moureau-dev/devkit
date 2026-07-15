import { api } from "./api";

export async function apikey(operation: string, input: any) {
  const managed = api.managed;

  switch (operation) {
    case "create": {
      return await api.createApiKey(input);
    }

    case "list": {
      const { data, error } = await managed.apiKeys.list();
      if (error) throw new Error(`Failed to list API keys: ${error.value.message}`);
      return data;
    }

    case "revoke": {
      const { data, error } = await managed.apiKeys.revoke(input.key_id);
      if (error) throw new Error(`Failed to revoke API key: ${error.value.message}`);
      return data;
    }

    default:
      throw new Error(`Unsupported apikey operation: ${operation}`);
  }
}
