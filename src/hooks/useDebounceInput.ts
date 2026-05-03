"use client";

import { useCallback, useEffect } from "react";
import debounce from "lodash.debounce";

const useDebounceInput = (eleId: string, searchFn: (s: any) => void, fn: (s: any) => void, cooldown = 500, deps: any[] = []) => {

    const debounce_fn = (value: string) => {
        searchFn(value);
    };

    const handleInput = useCallback((e: Event) => {
        if(!e) return;
        const { value } = e.target as HTMLInputElement;
        fn(value); // update search state, and show loading
        debounce(() => debounce_fn(value), cooldown);
    }, []);

    useEffect(() => {
        const ele = document.getElementById(eleId);

        if(ele) ele.addEventListener('input', handleInput);

        return () => {
            if(ele) ele.removeEventListener('input', handleInput);
        }
    }, [eleId, ...deps]);
};

export default useDebounceInput;