"use client";

import { DBUserType, DEFAULT_USER } from '@/types/app';
import React, { createContext, useState } from 'react';


const AppContext = createContext<{
    user: DBUserType,
    setUser: React.Dispatch<DBUserType>,
}>({
    user: DEFAULT_USER,
    setUser: (prev: DBUserType) => {},
});

const AppProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    
    const [user, setUser] = useState<DBUserType>(DEFAULT_USER);

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };