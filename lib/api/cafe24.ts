import { cafe24Api } from "../axios-instances";

export const cafe24 = {
  getProducts: async () => {
    const res = await cafe24Api.get(`/api/v2/admin/products`);
    return res.data;
  },
};
