export type UserBasic = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type allUsers = {
  name: string;
  id: string;
  email: string;
  image: string | null;
}[];

export type CreateUserActionState = {
  status: "success" | "error" | "idle"; // idle is the initial state
  message: string | null; // For toast messages
  errors?: Record<string, string[]> | null; // For field-specific errors from Zod
  values?: Record<string, string> | null; // For field-specific errors from Zod
};

export const initialCreateUserState: CreateUserActionState = {
  status: "idle",
  message: null,
  errors: null,
};
