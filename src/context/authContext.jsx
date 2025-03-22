import { createContext, useReducer, useEffect, useState } from "react";
import { AuthReducer } from "../reducers/AuthReducers";

export const AuthContext = createContext({ user: null });

const hydrateUser = () => {
    const user = localStorage.getItem("user");

    if(!user){
        return { user: null};
    }

    const parsedUser = JSON.parse(user);
    return parsedUser.user;
}

export default function AuthContextProvider({ children }) {
    const [authstate, dispatch] = useReducer(AuthReducer, hydrateUser());
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if(user){
            dispatch({ type: "LOGIN", payload: user });
            setIsAuthenticated(true);
        }
    },[]);
    return (
        <AuthContext.Provider value={{ ...authstate, dispatch, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
}