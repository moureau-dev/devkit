import { api } from "./api";

export async function profile(operation: string, input: any) {
  switch (operation) {
    case "list": {
      return api.listProfiles();
    }

    case "add": {
      return api.addProfile({
        name: input.name,
        public_key: input.public_key,
        secret_key: input.secret_key,
        // These are optional — decoded from public_key if not provided
        organization_id: input.organization_id,
        project_id: input.project_id,
      });
    }

    case "remove": {
      return api.removeProfile(input.name);
    }

    case "select": {
      return api.selectProfile(input.name);
    }

    case "current": {
      const p = api.profile;
      return { profile: p };
    }

    default:
      throw new Error(`Unsupported profile operation: ${operation}`);
  }
}
