"use client";

import { useWallet } from "@/lib/wallet/context";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import IDL from "@/idl.json";

// Hardcoded to localnet for the MVP
// const connection = new Connection("http://127.0.0.1:8899", "confirmed"); "https://api.devnet.solana.com"
const connection = new Connection("https://api.devnet.solana.com", "confirmed"); 
export const PROGRAM_ID = new PublicKey(IDL.address); //"9fpt7n9eqpYZhHdFjJc7GJV4DZnhG87tYwpE9MBeCafP");//("HdAN3wh83nV7QgLK1AyLVs96KrGzwXptj63RqeGX5Qaj");

export function useOpenMind() {
    const { wallet } = useWallet();

    // Safely extract the public key from your custom WalletSession
    const userPublicKey = wallet?.account?.address ? new PublicKey(wallet.account.address) : null;

    const getProgram = () => {
        // If the user isn't connected, we create a dummy read-only wallet
        const dummyWallet = {
            publicKey: PublicKey.default,
            signTransaction: async () => { throw new Error("Read only") },
            signAllTransactions: async () => { throw new Error("Read only") }
        };

        const activeWallet = userPublicKey ? {
            publicKey: userPublicKey,
            signTransaction: async (tx: any) => await (window as any).solana.signTransaction(tx),
            signAllTransactions: async (txs: any[]) => await (window as any).solana.signAllTransactions(txs),
        } : dummyWallet;

        const provider = new anchor.AnchorProvider(connection, activeWallet as any, { commitment: "confirmed" });
        return new anchor.Program(IDL as anchor.Idl, provider);
    };

    const getProvider = () => {
        // If the user isn't connected, we create a dummy read-only wallet
        const dummyWallet = {
            publicKey: PublicKey.default,
            signTransaction: async () => { throw new Error("Read only") },
            signAllTransactions: async () => { throw new Error("Read only") }
        };

        const activeWallet = userPublicKey ? {
            publicKey: userPublicKey,
            signTransaction: async (tx: any) => await (window as any).solana.signTransaction(tx),
            signAllTransactions: async (txs: any[]) => await (window as any).solana.signAllTransactions(txs),
        } : dummyWallet;

        const provider = new anchor.AnchorProvider(connection, activeWallet as any, { commitment: "confirmed" });
        return provider;
    };

    
    const getUserPDA = (addressKey?: undefined | PublicKey) => {
        if(!userPublicKey) return null;
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user"), 
                !addressKey ? userPublicKey.toBuffer() : addressKey.toBuffer()
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const getCreatedCoursePDA = (user_created_courses_count: number) => {
        if(!userPublicKey) return null;
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(user_created_courses_count, 0);
        
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("created_course"), 
                userPublicKey.toBuffer(),
                buffer,
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const getInstructorCreatedCoursePDA = (addy: string, user_created_courses_count: number) => {
        const instructorKey = new PublicKey(addy);
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(user_created_courses_count, 0);
        
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("created_course"), 
                instructorKey.toBuffer(),
                buffer,
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const getCourseMaterialPDA = (
        user_created_courses_count: number, 
        course_material_count: number,
    ) => {
        if(!userPublicKey) return null;
        const buffer_course_index = Buffer.alloc(4);
        buffer_course_index.writeUInt32LE(user_created_courses_count, 0);
        
        const buffer_material_index = Buffer.alloc(4);
        buffer_material_index.writeUInt32LE(course_material_count, 0);

        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("course_material"), 
                userPublicKey.toBuffer(),
                buffer_course_index,
                buffer_material_index
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const getUserCertificatePDA = (  
        recipientAddressKey: PublicKey,
        certifications: number,
    ) => {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(certifications, 0);
        

        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_certificate"), 
                recipientAddressKey.toBuffer(),
                buffer,
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const getUserEnrolledCoursesPDA = (  
        index: number,
    ) => {
        if(!userPublicKey) return null;
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(index, 0);
        

        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("enrolled_course"), 
                userPublicKey.toBuffer(),
                buffer,
            ],
            PROGRAM_ID
        );
        return pda;
    };
    
    const getCertificatePDA = (issuer: string, cnt: number) => {

        if(!userPublicKey) return null;
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(cnt, 0);

        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("certificate"), 
                new PublicKey(issuer).toBuffer(),// issuer's key, our wallet in this case
                buffer,
            ],
            PROGRAM_ID
        );
        return pda;
    };

    const txWait = async (transactionSignature: string) => {
        try {

            // 1. Get the latest blockhash to verify the status
            const latestBlockhash = await connection.getLatestBlockhash();

            // 2. Wait for confirmation (The "wait" equivalent)
            const confirmation = await connection.confirmTransaction({
                signature: transactionSignature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, 'confirmed'); // You can use 'finalized' for absolute certainty

            if (confirmation.value.err) {
                console.error(`Transaction failed: ${confirmation.value.err.toString()}`);
                return;
            }

            console.log("✅ Transaction confirmed successfully!");
            return "successfully completed onchain";

        } catch (error) {
            console.log(error);
        }
    };

    return { 
        getProgram, getProvider, getUserEnrolledCoursesPDA,
        userPublicKey, getUserPDA, getCertificatePDA, getInstructorCreatedCoursePDA,
        getCourseMaterialPDA, getCreatedCoursePDA, getUserCertificatePDA, txWait 
    };
}