CREATE POLICY users_select_own ON users
  FOR SELECT
  TO authenticated
  USING (github_id = requesting_github_id());
