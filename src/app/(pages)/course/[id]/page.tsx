import CoursePlayer from "./course";


type Params = Promise<{ id: string }>;

export default async function CoursePlayerPage({ params } : { params: Params }) {
    const { id } = await params || "";
    
    return (
        <div className={`w-full h-full`}>
            <CoursePlayer id={id} />
        </div>
    );
}