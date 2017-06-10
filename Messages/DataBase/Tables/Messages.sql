CREATE TABLE [dbo].[Messages](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ConvoId] [int] NULL,
	[SenderId] [nvarchar](128) NOT NULL,
	[Content] [nvarchar](3000) NOT NULL,
	[Created] [datetime] NOT NULL,
	[Updated] [datetime] NULL,
	[IsRead] [bit] NOT NULL,
	[IsNotified] [bit] NULL,
 CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Messages_ConvoId] FOREIGN KEY([ConvoId])
REFERENCES [dbo].[Conversations] ([ID])
GO

ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Messages_ConvoId]
GO