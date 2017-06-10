ALTER PROCEDURE [dbo].[Messages_SelectByConvoIdPage]
	@ConvoId int,
	@PageNumber int

AS

BEGIN
SELECT [ID]
		, [ConvoId]
		, [SenderId]
		, [Content]
		, [Created]
		, [Updated]
		, [IsRead]
		, [IsNotified]
	FROM [dbo].[Messages]
	WHERE [ConvoId] = @ConvoId
	ORDER BY [ID] DESC
		OFFSET ((@PageNumber - 1) * 20) ROWS
		FETCH NEXT 20 ROWS ONLY
END

/*------------------TEST CODE--------------
DECLARE @ConvoId int = 12, @PageNumber int = 1
EXEC [dbo].[Messages_SelectByConvoIdPage]
	@ConvoId, @PageNumber
SELECT * FROM messages

*/