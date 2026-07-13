import { cafe24Api } from "../axios-instances";

export const cafe24 = {
  getProducts: async (mallId: string) => {
    const res = await cafe24Api.get(
      `https://${mallId}.cafe24api.com/api/v2/admin/products`,
    );
    return res.data;
  },
};
