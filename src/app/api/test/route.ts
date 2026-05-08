import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Test from "@/models/test";


export const createTest = async (data: any) => {
    
    const test = await Test.findOne({ testId: data.testId });
    if(test) return new Error("Test already exists");
    
    const newTest = new Test({ ...data });
    await newTest.save();
};


export const getUser = async (testId: string | null) => {
 
    if(!testId) return new Error("No user found");

    const user = await Test.findOne({ testId });

    if(!user) return new Error("No user found");
    
    return user._doc;
};




export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const test = await getUser(testId);
    return NextResponse.json({ data: { success: "success", test } }, { status: 200 });
};


export async function PUT(req: NextRequest) {
    await dbConnect();
    const data: any = await req.json();
    await createTest(data);
    return NextResponse.json({ data: { success: "success"} }, { status: 200 });
};
