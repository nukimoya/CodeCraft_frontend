// // eslint-disable-next-line 

export const AuthReducer = (state = { user: null }, action) => {
    switch (action.type) {
        case "LOGIN":
            return { user: action.payload };

        case "LOGOUT":
            return { user: null };

        case "UPDATE_USER": // ✅ New case for updating user profile
            return {
                user: {
                    ...state.user,
                    data: {
                        ...state.user.data,
                        user: { ...state.user.data.user, ...action.payload.user }
                    }
                }
            };

        default:
            throw Error("Unknown action type: " + action.type);
    }
};
