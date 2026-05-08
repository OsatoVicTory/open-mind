
// import { ThirdwebStorage } from "@thirdweb-dev/storage";
// import { PinataSDK } from 'pinata';

import { createThirdwebClient } from "thirdweb";
import { resolveScheme, upload } from "thirdweb/storage";


export const THIRD_WEB_ID = process.env.NEXT_PUBLIC_THIRD_WEB_ID;
export const THIRD_WEB_SECRET : string = process.env.NEXT_PUBLIC_THIRD_WEB_SECRET || "";


export const Z = (z: number) => z >= 10 ? z : `0${z}`;

export const getTime = (time: number) => {
    const date = new Date(time);
    const hrs = date.getHours();
    const meridian = hrs >= 12 ? "PM" : "AM";
    return `${Z(hrs)}:${Z(date.getMinutes())} ${meridian}`;
};

export const imageToBase64 = async (image: File) : Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            resolve(reader.result as string);
        };
    });
};

export const formatValue = (val: number) => {
    if(val >= 1E9) {
        return `${(val / 1E9).toFixed(2)}B`;
    } else if (val >= 1E6) {
        return `${(val / 1E6).toFixed(2)}M`;
    } else if (val >= 1E3) {
        return `${(val / 1E3).toFixed(2)}K`;
    } else {
        return val.toFixed(2);
    }
};

export const parseFileNameForIpfs = (name: string) => {
    name = name.replaceAll(" ", "_");
    return name.replaceAll(/[^\w\d.-]/g, "_");
};

export const uploadToIpfs = async (file: File | File[]) => {

    const fType = (f: string) => {
        if(f.startsWith("video")) return "video";
        else return "image";
    };
    
    // ✅ initialize client
    const client = createThirdwebClient({
        clientId: THIRD_WEB_ID,
        secretKey: THIRD_WEB_SECRET,
    });

    if(!Array.isArray(file)) {
        const fileData = new File([file], parseFileNameForIpfs(file.name), { type: fType(file.type) });

        const uri = await upload({
            client,
            files: [fileData],
        });

        const url = resolveScheme({
            client,
            uri
        });

        return url;
    } else {
        
        const fileData = (file as File[]).map((f: File) => {
            return new File([f], parseFileNameForIpfs(f.name), { type: fType(f.type) })
        })

        const uris = await upload({
            client,
            files: fileData,
        });

        const urls = uris.map(uri => {
            return resolveScheme({
                client,
                uri
            })
        });

        return urls;
    }

};



export const formatDuration = (seconds: number) => {
  const date = new Date(0);
  date.setSeconds(seconds);
  // Returns MM:SS or HH:MM:SS
  return date.toISOString().substring(11, 19).replace(/^00:/, '');
};

export const getVideoDuration = (src: string) : Promise<number | string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    // Ensure we don't actually play the video or download the whole thing
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Clean up the object to free memory
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      resolve("Failed to load video metadata.");
    };

    video.src = src;
  });
};

//