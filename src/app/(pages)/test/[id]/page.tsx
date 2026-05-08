import TestSession from "./test";


type Params = Promise<{ id: string }>;

export default async function TestPage({ params } : { params: Params }) {
    const { id } = await params || "";
    
    return (
        <div className={`w-full h-full`}>
            <TestSession id={id} />
        </div>
    );
}