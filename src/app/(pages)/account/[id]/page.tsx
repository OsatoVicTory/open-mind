import User from "./user";

type Params = Promise<{ id: string }>;

export default async function UserAccountPage({ params } : { params: Params }) {
    const { id } = await params || "";
    
    return (
        <div className={`w-full h-full`}>
            <User id={id} />
        </div>
    );
}