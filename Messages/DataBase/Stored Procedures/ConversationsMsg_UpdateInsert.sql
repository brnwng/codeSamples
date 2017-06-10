ALTER PROCEDURE [dbo].[ConversationsMsg_UpdateInsert]
	@ID int output
	, @SenderId nvarchar (128)
	, @ReceiverId nvarchar (128)
	, @Subject nvarchar (100)
	, @Content nvarchar (3000)

AS

		DECLARE
			@Today datetime = GetUTCDate()
			, @IsRead bit = 0

IF EXISTS (SELECT * FROM dbo.conversations where (senderid = @senderId or receiverid = @senderId) and (senderId = @ReceiverId or receiverid = @ReceiverId)
)



BEGIN
		DECLARE
			@cId int = (SELECT c.[Id] From dbo.Conversations c where (senderid = @senderId or receiverid = @senderId) and (senderId = @ReceiverId or receiverid = @ReceiverId))

		UPDATE dbo.conversations set [subject] = @subject, [updated] = @Today, [IsRead] = @IsRead
		WHERE [id] = @cId

		INSERT INTO [dbo].[Messages] (
			[ConvoId]
			, [SenderId]
			, [Content]
			, [Created]
			, [Updated]
			, [IsRead]
			, [IsNotified]
			)
		VALUES (
			@cId
			, @SenderId
			, @Content
			, @Today
			, @Today
			, @IsRead
			, @IsRead
			);
END
ELSE
BEGIN

	INSERT [dbo].[Conversations] (
		[SenderId]
		, [ReceiverId]
		, [Subject]
		, [Created]
		, [Updated]
		, [IsRead])
	VALUES (
		@SenderId
		, @ReceiverId
		, @Subject
		, @Today
		, @Today
		, @IsRead
	);

	SET @ID = SCOPE_IDENTITY()

		INSERT INTO [dbo].[Messages] (
		[ConvoId]
		, [SenderId]
		, [Content]
		, [Created]
		, [Updated]
		, [IsRead]
		, [IsNotified]
	)
	VALUES (
		@ID
		, @SenderId
		, @Content
		, @Today
		, @Today
		, @IsRead
		, @IsRead
	);
END

/* -------------------TEST CODE-------------------
DECLARE
	@ID int = 0,
	@SenderId nvarchar(128) = '4c362805-3630-4695-a692-485c8d3f3fd2',
	@ReceiverId nvarchar(128) = '1A599F4C-0698-4DE9-8B80-563B099CD299',
	@Subject nvarchar(100) = 'YChECK UPSERT',
	@Content nvarchar(3000) = 'THIS IS MY NEW CONTENT'

EXEC [dbo].[ConversationsMsg_InsertCheckTest]
	@ID,
	@SenderId,
	@ReceiverId,
	@Subject,
	@Content

SELECT * FROM dbo.CONVERSATIONS
SELECT * FROM dbo.MESSAGES

DELETE FROM dbo.messages where convoid = 43
DELETE FROM dbo.conversations where id = 43

SELECT c.[Id] From dbo.Conversations c where (senderid = @senderId or receiverid = @senderId) and (senderId = @ReceiverId or receiverid = @ReceiverId)

*/