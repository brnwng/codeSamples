ALTER PROCEDURE [dbo].[Message_IsRead]
	(@TableParam [dbo].[MessageIsRead] READONLY)

AS
	UPDATE [dbo].[Messages]
	SET [IsRead] = 1
	FROM [dbo].[Messages]
	INNER JOIN @TableParam as paramTb1
	ON [dbo].[Messages].[ID] = [paramTb1].[ID]