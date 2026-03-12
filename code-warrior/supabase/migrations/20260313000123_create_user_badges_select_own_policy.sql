CREATE POLICY user_badges_select_own ON user_badges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = user_badges.user_id
        AND users.github_id = requesting_github_id()
    )
  );
