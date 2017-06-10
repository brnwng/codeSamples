ALTER PROCEDURE [dbo].[Messages_Insert]
	@ID int output
	, @ConvoId int
	, @SenderId nvarchar (128)
	, @Content nvarchar (3000)

AS

BEGIN

	DECLARE
		@Today datetime = GetUTCDate(),
		@IsRead bit = 0,
		@IsNotified bit = 0

	INSERT [dbo].[Messages] (
		[ConvoId]
		, [SenderId]
		, [Content]
		, [Created]
		, [Updated]
		, [IsRead]
		, [IsNotified]
	)
	VALUES (
		@ConvoId
		, @SenderId
		, @Content
		, @Today
		, @Today
		, @IsRead
		, @IsNotified
	);

	SET @ID = SCOPE_IDENTITY()

	UPDATE [dbo].[Conversations]
	SET [Updated] = @Today
	WHERE [ID] = @ConvoId

END

/* -------------------TEST CODE-------------------

DECLARE
	@ID int = 0
	, @ConvoId int = 1
	, @SenderId nvarchar (128) = '4c362805-3630-4695-a692-485c8d3f3fd2'
	, @Content nvarchar (3000) = 'hello?'
EXEC [dbo].[Messages_Insert]
	@ID
	, @ConvoId
	, @SenderId
	, @Content
GO

SELECT * FROM [dbo].[Messages]
SELECT * FROM [dbo].[Conversations]
SELECT * FROM [dbo].[People]

*/
