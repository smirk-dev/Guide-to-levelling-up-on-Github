#### 1\. Design System & Theme

*   **Core Aesthetic:** "Cyber-Fantasy". Dark, immersive backgrounds with neon accents.
    
*   **Color Palette:**
    
    *   _Background:_ Midnight Void (#0d1117 - matching GitHub's dark mode).
        
    *   _Primary (Actions):_ Loot Gold (#ffd700) for buttons/rewards.
        
    *   _Secondary (Stats):_ Mana Blue (#58a6ff) and Health Green (#2ea043).
        
    *   _Accent:_ Critical Hit Red (#da3633) for errors or alerts.
        
*   **Typography:**
    
    *   _Headers:_ Press Start 2P (or similar Google Font) – Retro pixel style for ranks/titles.
        
    *   _Body/UI:_ Inter or Fira Code – Clean, readable, developer-friendly.
        

#### 2\. Key Layouts (Views)

**A. The Dashboard (Home)**

*   **Layout:** 3-Column Grid.
    
    *   _Left (The Hero):_ Large Avatar (pixelated filter applied to GitHub PFP). Below it: Level, Current Rank (e.g., "Rank B - Middle Committer"), and equipped Badges.
        
    *   _Center (The Stats):_
        
        *   **Health Bar (HP):** Tied to Commit Consistency.
            
        *   **Mana Bar (MP):** Tied to Review/Issue activity.
            
        *   **Main Quest Card:** The current active tutorial quest (e.g., "Quest: The First Pull Request").
            
    *   _Right (The Inventory):_ List of recent achievements and "Loot" (recent PRs merged).
        

**B. The Quest Log**

*   **Visual Style:** Looks like an old parchment or a holographic data-pad.
    
*   **Interaction:** Accordion list. Clicking a quest expands it to show "Victory Conditions" (e.g., "Merge 1 PR into a public repo").
    
*   **Feedback:** When a quest is completed, a modal overlay appears with a "Chest Opening" animation and sound.
    

**C. Leaderboard (Hall of Fame)**

*   **Visual Style:** Arcade high-score table.
    
*   **Data:** Rank #, Avatar, Username, Title, Total XP. Top 3 players have gold/silver/bronze glow effects.
    

#### 3\. UX Micro-interactions ("The Juice")

*   **On Login:** Screen "powers up" like a CRT monitor.
    
*   **XP Gain:** Floating numbers (e.g., "+50 XP") appear near the avatar when data syncs.
    
*   **Hover Effects:** Buttons glow and play a subtle "select" sound on hover.
    
*   **Sound Design:**
    
    *   _Success:_ 8-bit victory jingle.
        
    *   _Click:_ Mechanical keyboard clack.
        

#### 4\. Responsiveness

*   **Mobile:** Sidebar collapses into a "Burger Menu" (styled as a treasure chest icon). Stats stack vertically.