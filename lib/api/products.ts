import axios from "axios";

export const productApi = {
  fetchCafe24Products: async () => {
    const res = await axios.get("/api/products");

    return res.data;
  },
};
