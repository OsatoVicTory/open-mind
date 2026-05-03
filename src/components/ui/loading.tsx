export const Spinner = ({ className }: { className?: string }) => {
    return (
        <div className={`${className||""} loading-spinner`}></div>
    )
};


export const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`${className||""} Skeleton`}></div>
    );
};

export const FormatTokenPrice = ({ price }: { price: any }) => {
    const [f, s] = String(price).split(".");
    let spl = s || "";
    let i = 0;

    if(s) {
        while(i < s.length && s[i] == "0") i++;
        if(i > 3) spl = s.slice(i, i+4);
    }

    return (
        <span title={price}>
            {f}
            {s && <>
                {"."}
                {i > 3 && <sub>{`(${i})`}</sub>}
                {spl}
            </>}
        </span>
    )
};