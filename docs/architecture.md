#### 1\. High-Level Stack

*   **Framework:** Next.js 14+ (App Router)
    
    *   _Reason:_ Best-in-class for React apps, easy API routes for backend logic, and server-side rendering for initial dashboard load speed.
        
*   **Language:** TypeScript
    
    *   _Reason:_ Essential for maintaining the complex types of GitHub API responses and our RPG data structures.
        
*   **Styling:** Tailwind CSS
    
    *   _Reason:_ Rapid development, easily customizable for the "Cyber-Fantasy" theme via tailwind.config.js.
        
*   **Database:** Supabase (PostgreSQL)
    
    *   _Reason:_ Relational data is perfect for User/Quest/Badge relationships. Built-in Auth helpers for Next.js are a huge plus.
        
*   **Authentication:** NextAuth.js
    
    *   _Provider:_ GitHub (Scoped for read:user, repo access to check private stats if requested).
        
*   **State Management:** React Query (TanStack Query)
    
    *   _Reason:_ Efficiently handles server state (fetching GitHub data, caching it to avoid rate limits).
        

#### 2\. Database Schema (Supabase)

**Table: users**

*   id (UUID, PK)
    
*   github\_id (String, Unique)
    
*   username (String)
    
*   avatar\_url (String)
    
*   xp (Integer) - Total experience points.
    
*   rank\_tier (Enum: C, B, A, S, SS, SSS)
    
*   last\_synced\_at (Timestamp) - To prevent spamming GitHub API.
    

**Table: quests**

*   id (UUID, PK)
    
*   title (String) - e.g., "The First Step"
    
*   description (String)
    
*   xp\_reward (Integer)
    
*   criteria\_type (Enum: REPO\_COUNT, PR\_MERGED, STAR\_COUNT)
    
*   criteria\_threshold (Integer)
    

**Table: user\_quests** (Join Table)

*   user\_id (FK)
    
*   quest\_id (FK)
    
*   status (Enum: ACTIVE, COMPLETED)
    
*   completed\_at (Timestamp)
    

**Table: badges**

*   id (UUID, PK)
    
*   name (String) - e.g., "Pull Shark"
    
*   icon\_slug (String)
    
*   stat\_boost (JSON) - e.g., {"strength": 10}
    

#### 3\. Integration Strategy (GitHub API)

We will use a "Sync Engine" pattern to avoid hitting GitHub's API on every page load.

1.  **User Logs In:** Trigger POST /api/sync.
    
2.  **Sync Service:**
    
    *   Fetches User Profile (Followers, Bio).
        
    *   Fetches Repos (Stars, Forks).
        
    *   Fetches Events (Recent Commits, PRs).
        
3.  **Calculation:**
    
    *   Compute "Code Warrior Stats" (HP, Mana, STR) based on raw data.
        
    *   Check active Quests against new data.
        
4.  **Update DB:** Save new XP, Rank, and Completed Quests to Supabase.
    
5.  **Frontend:** Reads only from Supabase (fast, no rate limits).
    

#### 4\. Project Structure

Plaintext

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /src    /app           (Next.js App Router pages)      /dashboard   (Protected Game View)      /api         (Backend Routes)    /components    (UI Building Blocks)      /rpg         (Avatar, StatBar, QuestCard)    /lib      /github      (API wrappers)      /game-logic  (XP formulas, Rank calculations)    /types         (TypeScript interfaces)   `