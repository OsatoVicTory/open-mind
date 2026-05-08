import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/user";


export const createUser = async (data: any, img: string) => {
    
    const user = await User.findOne({ userId: data.userId });
    if(user) return new Error("User already exists");

    const { secure_url, public_id } = await cloudinary.uploader.upload(img, {
        overwrite: true,
        folder: "/Openfield/users", // tokens & users are the sub-folders under Openfield folder in my cloudinary
    });

    const newUser = new User({ 
        name: data.name, 
        userId: data.userId, 
        img: secure_url, public_id 
    });
    await newUser.save();
};


export const getUser = async (userId: string | null) => {
 
    if(!userId) return new Error("No user found");

    const user = await User.findOne({ userId });

    if(!user) return new Error("No user found");
    
    return user._doc;
};


export const updateUser = async (userId: string | null, data: any) => {
    if(!userId) return new Error("No user found");

    const { img, public_id } = data;

    if(public_id) {
        await cloudinary.api.delete_resources(
            [public_id], { type: 'upload', resource_type: "image" }
        );

        const res = await cloudinary.uploader.upload(img, {
            overwrite: true,
            folder: "/Openfield/users", // tokens & users are the sub-folders under Openfield folder in my cloudinary
        });

        data.public_id = res.public_id;
        data.secure_url = res.secure_url;
    }

    const newUser = await User.findOneAndUpdate({ userId }, { ...data }, { new: true });
    return newUser._doc;
};



export const updateUserCourseProgress = async (userId: string | null, instructor: string, courseIndex: number, materialIndex: number) => {
    if(!userId) return new Error("No user found");
    // 1. Find the user by ID
    // 2. Look into the 'user' array for an object with course_index: 1
    // 3. Push the new value into the 'courses' sub-array of that found object
    const result = await User.updateOne(
      { 
        userId, 
        "user.instructor": instructor, 
        "user.course_index": courseIndex 
      },
      { 
        $push: { "user.$.courses": materialIndex } 
      }
    );

    if (result.matchedCount === 0) {
      return new Error("No user or course index found.");
    } else {
      return("Course added successfully!");
    }
}



export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const user = await getUser(userId);
    return NextResponse.json({ data: { success: "success", user } }, { status: 200 });
};


export async function PUT(req: NextRequest) {
    await dbConnect();
    const data: any = await req.json();
    await createUser(data.data, data.img);
    return NextResponse.json({ data: { success: "success"} }, { status: 200 });
};


export async function PATCH(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const data: any = await req.json();
    await updateUser(userId, data.data);
    return NextResponse.json({ data: { success: "success"} }, { status: 200 });
};

export async function POST(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const data: any = await req.json();
    await updateUserCourseProgress(userId, data.instructor, data.courseIndex, data.materialIndex);
    return NextResponse.json({ data: { success: "success"} }, { status: 200 });
};