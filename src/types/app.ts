export interface DBUserType {
    _id: string;
    name: string;
    profile: any;
    banner: any;
    password: string;
    email: string;
    id_verified: boolean;
    meta_data?: any;
};

export const DEFAULT_USER = {
    _id: "",
    name: "",
    profile: null,
    banner: null,
    password: "",
    email: "",
    id_verified: false,
};
