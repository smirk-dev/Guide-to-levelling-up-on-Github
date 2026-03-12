CREATE POLICY user_quests_select_own ON user_quests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = user_quests.user_id
        AND users.github_id = requesting_github_id()
    )
  );
