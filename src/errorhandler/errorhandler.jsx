// eslint-disable-next-line
import React from "react";
import { toast } from 'react-toastify';


export const errorHandler = (error) => {
    if (error.response) {
        const toastId = "my-error-toast";
        const { status } = error.response;
        const {msg} = error.response.data;

        console.log("Error response:", error.response);
        if (status === 400) {
            const m = error.response.data.msg[0];
            console.log("Error message:", m);
            toast.error(m, { toastId });
        }
        // console.log("Error message:", msg);
        if (status === 401) {
            toast.error(msg, { toastId });
        }
        if (status === 403) {
            toast.error(msg, { toastId });
        } 
        if (status === 404) {
            toast.error(msg, { toastId });
        }  
        if (status === 409) {
            toast.error(msg, { toastId });
        }
        if (status === 415) {
            toast.error(msg, { toastId });
        } 
        if (status === 500) {
            toast.error(msg, { toastId });
        }
    }
    else{
        toast.info(error.message || "Network Error");
    }
}

