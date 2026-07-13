import axios from "axios";

export const productApi = {
  fetchCafe24Products: async () => {
    const res = await axios.get("/api/products");
    console.log("상품리스트 데이터", res);
    return res.data;
  },
};
