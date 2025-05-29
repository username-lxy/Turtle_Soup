import axios from "axios";
import serverConfig from "./baseUrl";

// 创建 axios 请求实例
const serviceAxios = axios.create({
  baseURL: serverConfig.baseURL, // 基础请求地址
  timeout: 180000, // 请求超时设置
  withCredentials: false, // 跨域请求是否需要携带 cookie
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 创建请求拦截
serviceAxios.interceptors.request.use(
  (config) => {
    console.log("发送请求:", config.url, config.data);
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 创建响应拦截
serviceAxios.interceptors.response.use(
  (res) => {
    console.log("响应成功:", res.data);
    return res.data;
  },
  (error) => {
    console.error("响应错误:", error.response || error);
    let message = "";
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = "请求参数错误";
          break;
        case 401:
          message = "未授权，请重新登录";
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求错误,未找到该资源";
          break;
        case 500:
          message = "服务器端出错";
          break;
        default:
          message = `连接错误${error.response.status}`;
      }
    } else {
      message = "网络连接异常,请稍后再试";
    }
    return Promise.reject(message);
  }
);

export default serviceAxios;
