import CourseP from "./c";
// import Course from "./course";

type Params = Promise<{ id: string }>;

export default async function CoursePage({ params } : { params: Params }) {
    const { id } = await params || "";
    
    return (
        <div className={`w-full h-full`}>
            <CourseP id={id} />
        </div>
    );
}