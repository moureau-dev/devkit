import { api } from "./api";

/**
 * Resolve a session-authenticated client.
 *
 * If a `session_id` is passed in input, it's persisted to the in-memory store
 * first (so subsequent operations don't need to pass it). Then validates the
 * session with `auth.check()` — fails with a clear message if invalid.
 */
async function resolveClient(input: any) {
  // If a new session ID is provided, persist it first
  if (input.session_id) {
    api.setSession(input.session_id);
  }

  const session = await api.getClientSession();
  if (!session) {
    throw new Error(
      "No valid user session. Authenticate with `auth oauth2 initiate` first, " +
        "or pass a `session_id` obtained from a previous OAuth flow.",
    );
  }
  return session.client;
}

export async function file(operation: string, input: any) {
  const client = await resolveClient(input);

  switch (operation) {
    case "list": {
      const { data, error } = await client.admin.cdn.files({
        page: input.page || 1,
        page_size: input.page_size || 50,
        type: input.type,
      });
      if (error) throw new Error(`Failed to list files: ${error.value.message}`);
      return data;
    }

    case "delete": {
      const { data, error } = await client.admin.cdn.delete(input.file_id);
      if (error) throw new Error(`Failed to delete file: ${error.value.message}`);
      return data;
    }

    case "storage": {
      const { data, error } = await client.admin.cdn.storage();
      if (error) throw new Error(`Failed to get storage info: ${error.value.message}`);
      return data;
    }

    case "upload-url": {
      const { data, error } = await client.cdn.upload({
        filename: input.filename,
        content_type: input.content_type,
        size: input.size,
      });
      if (error) throw new Error(`Failed to get upload URL: ${error.value.message}`);
      return data;
    }

    case "list-own": {
      const { data, error } = await client.cdn.files({
        page: input.page || 1,
        page_size: input.page_size || 50,
        type: input.type,
      });
      if (error) throw new Error(`Failed to list own files: ${error.value.message}`);
      return data;
    }

    case "delete-own": {
      const { data, error } = await client.cdn.delete(input.file_id);
      if (error) throw new Error(`Failed to delete own file: ${error.value.message}`);
      return data;
    }

    default:
      throw new Error(
        `Unsupported file operation: "${operation}". ` +
        `Available: upload-url (get presigned URL), list, list-own, delete, delete-own, storage. ` +
        `For upload-url you need filename, content_type (MIME), and size (bytes).`
      );
  }
}
