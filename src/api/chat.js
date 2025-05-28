import serviceAxios from "@/utils/request.js";

export const getToken = () => {
    return serviceAxios({
        url: "/api/v1/activity/token",
        method: 'get'
    });
};

// 获取题目
export const getTitle = (data) => {
    return serviceAxios({
        url: "/api/v1/session/token",
        method: 'POST',
        data
    });
};

// 提交答案
export const submitAnswer = (data) => {
    return serviceAxios({
        url: "/api/v1/submit/answer",
        method: 'POST',
        data
    });
};