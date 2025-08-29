interface TokenManagementProps {
  tokens: Token[];
  onAddToken: (tokenData: Omit<Token, 'id'>) => Promise<void>;
  onRemoveToken: (id: string, reason?: string, deletedBy?: string) => Promise<void>;
}