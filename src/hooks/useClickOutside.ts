import { useCallback } from "react";
import { useEffect } from "react";

const useClickOutside = (...args: any[]) => {

    const [ref, clickedOutside] = args;
    const deps = args.slice(2);

    const fn = useCallback((e: any) => {
        if(ref.current && !ref.current.contains(e.target)) {
            clickedOutside();
        }
    }, []);

    useEffect(() => {
        const check = () => { //modify actions based on dependencies (if apply)
            if(deps.length < 1) return true;
            return deps[0];
        }

        const run = check();
        if(run) {
            document.addEventListener("mousedown", fn, true);
        }
        
        return () => {
            if(run) document.removeEventListener("mousedown", fn, true);
        }
    }, deps);
};

export default useClickOutside;