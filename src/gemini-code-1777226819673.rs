use anchor_lang::prelude::*;

declare_id!("CourseApp11111111111111111111111111111111111");

#[program]
pub mod course_platform {
    use super::*;

    /// Instructors call this to list a new course
    pub fn create_course(
        ctx: Context<CreateCourse>, 
        course_id: String, 
        price: u64, 
        metadata_uri: String
    ) -> Result<()> {
        let course = &mut ctx.accounts.course;
        course.instructor = ctx.accounts.instructor.key();
        course.course_id = course_id;
        course.price = price;
        course.metadata_uri = metadata_uri;
        course.total_subscribers = 0;
        course.bump = ctx.bumps.course;

        msg!("Course Created: {}", course.course_id);
        Ok(())
    }

    /// Users call this to pay and subscribe to a course
    pub fn subscribe_to_course(ctx: Context<SubscribeToCourse>) -> Result<()> {
        let course = &mut ctx.accounts.course;
        let subscriber = &ctx.accounts.subscriber;
        let subscription = &mut ctx.accounts.subscription;

        // Transfer SOL from subscriber to instructor
        let cpi_context = anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &subscriber.key(),
                &course.instructor,
                course.price,
            ),
            &[
                subscriber.to_account_info(),
                ctx.accounts.instructor.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Record the subscription
        subscription.subscriber = subscriber.key();
        subscription.course_pda = course.key();
        subscription.timestamp = Clock::get()?.unix_timestamp;
        subscription.bump = ctx.bumps.subscription;

        course.total_subscribers += 1;

        msg!("User {} subscribed to course {}", subscriber.key(), course.course_id);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(course_id: String)]
pub struct CreateCourse<'info> {
    #[account(mut)]
    pub instructor: Signer<'info>,

    #[account(
        init,
        payer = instructor,
        space = 8 + 32 + 4 + 64 + 8 + 4 + 128 + 8 + 1,
        seeds = [b"course", instructor.key().as_ref(), course_id.as_bytes()],
        bump
    )]
    pub course: Account<'info, Course>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubscribeToCourse<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,

    /// CHECK: The instructor receiving the payment
    #[account(mut)]
    pub instructor: AccountInfo<'info>,

    #[account(mut)]
    pub course: Account<'info, Course>,

    #[account(
        init,
        payer = subscriber,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"subscription", subscriber.key().as_ref(), course.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Course {
    pub instructor: Pubkey,
    pub course_id: String,
    pub price: u64,
    pub metadata_uri: String, // IPFS link to video titles/content
    pub total_subscribers: u64,
    pub bump: u8,
}

#[account]
pub struct Subscription {
    pub subscriber: Pubkey,
    pub course_pda: Pubkey,
    pub timestamp: i64,
    pub bump: u8,
}


//FRONTEND USAGE
// const fetchUserSubscriptions = async () => {
//     if (!userPublicKey) return [];

//     // 1. Setup your program instance as you defined
//     const activeWallet = {
//         publicKey: userPublicKey,
//         signTransaction: async (tx: any) => await (window as any).solana.signTransaction(tx),
//         signAllTransactions: async (txs: any[]) => await (window as any).solana.signAllTransactions(txs),
//     };

//     const provider = new anchor.AnchorProvider(connection, activeWallet as any, { commitment: "confirmed" });
//     const program = new anchor.Program(IDL as anchor.Idl, provider);

//     try {
//         // 2. Fetch all subscription accounts belonging to this user
//         // Anchor's .all() allows you to pass filters directly
//         const subscriptions = await program.account.subscription.all([
//             {
//                 memcmp: {
//                     // Offset 8 is because Anchor accounts start with an 8-byte discriminator
//                     offset: 8, 
//                     bytes: userPublicKey.toBase58(),
//                 },
//             },
//         ]);

//         // 3. Extract the course PDAs from the subscription data
//         const subscribedCourseAddresses = subscriptions.map(sub => sub.account.coursePda);

//         // 4. (Optional) Fetch the actual course details for these addresses
//         // This is a "Multi-Fetch" which is much faster than fetching one by one
//         if (subscribedCourseAddresses.length > 0) {
//             const courseDetails = await program.account.course.fetchMultiple(subscribedCourseAddresses);
//             return courseDetails;
//         }

//         return [];
//     } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         return [];
//     }
// };