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
