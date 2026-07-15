import { api } from "./api";

type PaymentStatus = "pending" | "completed" | "failed" | "canceled" | "refunded";
type Currency = "BRL" | "EUR" | "USD";
type UserRole = "user" | "admin" | "superuser" | "owner";
type DestinationType = "pix" | "iban";
type PixKeyType = "CPF" | "CNPJ" | "PHONE" | "EMAIL" | "RANDOM";

export async function project(operation: string, input: any) {
  const managed = api.managed;

  switch (operation) {
    // ── Projects ──

    case "list": {
      const { data, error } = await managed.projects.list({ page: 1, page_size: 100 });
      if (error) throw new Error(`Failed to list projects: ${error.value.message}`);
      return data;
    }

    case "get": {
      const { data, error } = await managed.projects.get(input.project);
      if (error) throw new Error(`Failed to get project: ${error.value.message}`);
      return data;
    }

    case "create": {
      const slug = input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-");
      const { data, error } = await managed.projects.create({ name: input.name, slug });
      if (error) throw new Error(`Failed to create project: ${error.value.message}`);
      return data;
    }

    case "update": {
      const { data, error } = await managed.projects.update(input.project, {
        name: input.name,
        slug: input.slug,
      });
      if (error) throw new Error(`Failed to update project: ${error.value.message}`);
      return data;
    }

    case "delete": {
      const { data, error } = await managed.projects.delete(input.project);
      if (error) throw new Error(`Failed to delete project: ${error.value.message}`);
      return data;
    }

    // ── Profiles (managed, per project) ──

    case "list-profiles": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.list({
        page: input.page || 1,
        page_size: input.page_size || 50,
        search: input.search,
        roles: input.roles as UserRole[] | undefined,
        status: input.status as "active" | "banned" | undefined,
      });
      if (error) throw new Error(`Failed to list project profiles: ${error.value.message}`);
      return data;
    }

    case "get-profile": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.get(input.profile_id);
      if (error) throw new Error(`Failed to get profile: ${error.value.message}`);
      return data;
    }

    case "ban-profile": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.ban(input.profile_id, {
        reason: input.reason,
        expires_at: input.expires_at,
      });
      if (error) throw new Error(`Failed to ban profile: ${error.value.message}`);
      return data;
    }

    case "unban-profile": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.unban(input.profile_id);
      if (error) throw new Error(`Failed to unban profile: ${error.value.message}`);
      return data;
    }

    case "update-role": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.updateRole(input.profile_id, {
        role: input.role as UserRole,
      });
      if (error) throw new Error(`Failed to update role: ${error.value.message}`);
      return data;
    }

    case "delete-profile": {
      const profilesApi = managed.profiles(input.project);
      const { data, error } = await profilesApi.delete(input.profile_id);
      if (error) throw new Error(`Failed to delete profile: ${error.value.message}`);
      return data;
    }

    // ── Payments (managed, per project) ──

    case "list-payments": {
      const paymentsApi = managed.payments(input.project);
      const { data, error } = await paymentsApi.list({
        page: input.page || 1,
        page_size: input.page_size || 50,
        status: input.status as PaymentStatus | undefined,
      });
      if (error) throw new Error(`Failed to list payments: ${error.value.message}`);
      return data;
    }

    case "get-payment": {
      const paymentsApi = managed.payments(input.project);
      const { data, error } = await paymentsApi.get(input.payment_id);
      if (error) throw new Error(`Failed to get payment: ${error.value.message}`);
      return data;
    }

    case "payment-summary": {
      const paymentsApi = managed.payments(input.project);
      const { data, error } = await paymentsApi.summary();
      if (error) throw new Error(`Failed to get payment summary: ${error.value.message}`);
      return data;
    }

    case "create-payment": {
      const paymentsApi = managed.payments(input.project);
      const { data, error } = await paymentsApi.create({
        profileId: input.profile_id,
        amount_cents: input.amount_cents,
        metadata: input.metadata,
      });
      if (error) throw new Error(`Failed to create payment: ${error.value.message}`);
      return data;
    }

    // ── Payout Accounts ──

    case "list-payout-accounts": {
      const accountsApi = managed.payoutAccounts(input.project);
      const { data, error } = await accountsApi.list({
        page: input.page || 1,
        page_size: input.page_size || 50,
      });
      if (error) throw new Error(`Failed to list payout accounts: ${error.value.message}`);
      return data;
    }

    case "set-payout-account": {
      const accountsApi = managed.payoutAccounts(input.project);
      const { data, error } = await accountsApi.set(input.currency as Currency, {
        destination_type: input.destination_type as DestinationType,
        destination: input.destination,
        pix_key_type: input.pix_key_type as PixKeyType | undefined,
      });
      if (error) throw new Error(`Failed to set payout account: ${error.value.message}`);
      return data;
    }

    case "delete-payout-account": {
      const accountsApi = managed.payoutAccounts(input.project);
      const { data, error } = await accountsApi.delete(input.currency as Currency);
      if (error) throw new Error(`Failed to delete payout account: ${error.value.message}`);
      return data;
    }

    default:
      throw new Error(`Unsupported project operation: ${operation}`);
  }
}
