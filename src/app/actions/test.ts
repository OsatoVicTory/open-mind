
const URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const createTest = async (data: any): Promise<any> => {
    
    // data.data = testName: data.name, testId: data.testId; data.img: string url of image file
    const res = await fetch(`${URL}/api/test`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
};


export const updatetest = async (_id: string, data: any): Promise<any> => {
    
    // const { img, public_id } = data; if we updating from test, img is base64 string of image file, prev public_id for deletion
    // or data = { courses: Array }, if test is enrolling or finishing watching a material
    const res = await fetch(`${URL}/api/test/?testId=${_id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
};


export const getTest = async (testId: string): Promise<any> => {
    const res = await fetch(`${URL}/api/test/?testId=${testId}`, {
        method: "GET",
    });
    const json = await res.json();
    return json.data;
};