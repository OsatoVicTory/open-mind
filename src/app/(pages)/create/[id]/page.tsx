import TestGenerator from "./create_test";


type Params = Promise<{ id: string }>;

export default async function TestCreatePage({ params } : { params: Params }) {
    const { id } = await params || "";
    
    return (
        <div className={`w-full h-full`}>
            <TestGenerator id={id} />
        </div>
    );
}