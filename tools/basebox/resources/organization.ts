import { api } from "./api";

export async function organization(operation: string, input: any) {
  const managed = api.managed;

  switch (operation) {
    case "get": {
      const { data, error } = await managed.organization.get();
      if (error) throw new Error(`Failed to get organization: ${error.value.message}`);
      return data;
    }

    case "update": {
      const { data, error } = await managed.organization.update({
        name: input.name,
        slug: input.slug,
        platform_fees: input.platform_fees,
        payout_fees_bps: input.payout_fees_bps,
      });
      if (error) throw new Error(`Failed to update organization: ${error.value.message}`);
      return data;
    }

    case "delete": {
      const { data, error } = await managed.organization.delete();
      if (error) throw new Error(`Failed to delete organization: ${error.value.message}`);
      return data;
    }

    case "create-api-key": {
      return await api.createApiKey(input);
    }

    case "list-keys": {
      const { data, error } = await managed.apiKeys.list();
      if (error) throw new Error(`Failed to list API keys: ${error.value.message}`);
      return data;
    }

    case "revoke-key": {
      const { data, error } = await managed.apiKeys.revoke(input.key_id);
      if (error) throw new Error(`Failed to revoke API key: ${error.value.message}`);
      return data;
    }

    default:
      throw new Error(`Unsupported organization operation: ${operation}`);
  }
}
