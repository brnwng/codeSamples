ALTER PROCEDURE [dbo].[ConversationsMsg_SelectBySender]
	@SenderId nvarchar(128)

AS

BEGIN

	SELECT c.[ID]
			, c.[SenderID]
			, [ReceiverId]
			, [Subject]
			, c.[Created]
			, c.[Updated]
			, m.[Content]
			, c.[IsRead]
			, pe.FirstName as SenderFirst
			, pe.LastName as SenderLast
			, p.FirstName as ReceiverFirst
			, p.LastName as ReceiverLast
			, pe.ID as SenderPersonId
			, p.ID as ReceiverPersonId

	FROM [dbo].[Conversations] c
	Left JOIN [dbo].[Messages] m on (c.[id] = m.[convoid] and c.[updated] = m.[updated]) or (m.[content] = 'New message...')
	 JOIN [dbo].[People] p on c.[ReceiverId] = p.[ComplexUserId]
	 JOIN [dbo].[People] pe on c.[SenderID] = pe.[ComplexUserId]
	WHERE  c.[SenderID] = @SenderId OR [ReceiverId] = @SenderId 
	ORDER BY c.[Updated] DESC
END


/* -------------------TEST CODE-------------------

DECLARE @SenderID nvarchar(128) = 'aab15bd2-ce4d-4de2-bcbf-530947f2a252'

EXEC [dbo].[ConversationsMsg_SelectBySender]
		@SenderID

SELECT * FROM dbo.people
select * from dbo.messages where convoid = 128
select * from dbo.conversations where id = 128
*/