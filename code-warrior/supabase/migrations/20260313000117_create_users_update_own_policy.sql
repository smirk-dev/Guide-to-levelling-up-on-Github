CREATE POLICY users_update_own ON users
  FOR UPDATE
  TO authenticated
  USING (github_id = requesting_github_id())
  WITH CHECK (github_id = requesting_github_id());
