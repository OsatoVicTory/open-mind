
const URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const createUser = async (data: any): Promise<any> => {
    
    // data.data = userName: data.name, userId: data.userId; data.img: string url of image file
    const res = await fetch(`${URL}/api/user`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
};


export const updateUser = async (_id: string, data: any): Promise<any> => {
    
    // const { img, public_id } = data; if we updating from user, img is base64 string of image file, prev public_id for deletion
    // or data = { courses: Array }, if user is enrolling or finishing watching a material
    const res = await fetch(`${URL}/api/user/?userId=${_id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
};


export const getUser = async (userId: string): Promise<any> => {
    const res = await fetch(`${URL}/api/user/?userId=${userId}`, {
        method: "GET",
    });
    const json = await res.json();
    return json.data;
};

export const updateUserCourseProgress = async (userId: string, data: any) => {
    
    // const { img, public_id } = data; if we updating from user, img is base64 string of image file, prev public_id for deletion
    // or data = { courses: Array }, if user is enrolling or finishing watching a material
    const res = await fetch(`${URL}/api/user/?userId=${userId}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
}

// Usage:
// enrollUserInCourse('65f...123', 1, 105);