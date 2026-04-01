// ═════════════════════════════════════════════════════════════════════════════
// CrowdVerse Tutorial — Non-skippable onboarding for first-time users
// ═════════════════════════════════════════════════════════════════════════════

const TUTORIAL_VERSION = '1.0'; // Increment to force returning users to see new tutorials

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    type: 'fullscreen',
    title: 'Welcome to CrowdVerse! 🎉',
    subtitle: 'India\'s First Prediction Market',
    content: `
      <div style="text-align: center; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: float 3s ease-in-out infinite;">🔮</div>
        <p style="font-size: 1.1rem; line-height: 1.8; color: var(--cv-white2); margin-bottom: 1.5rem;">
          Get ready to predict the future, compete with friends, and earn tokens! 
          This quick tutorial will show you everything you need to know.
        </p>
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1rem; margin-top: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap;">
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--cv-green);">1,000+</div>
              <div style="font-size: 0.75rem; color: var(--cv-white3);">Free Tokens</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--cv-green);">100%</div>
              <div style="font-size: 0.75rem; color: var(--cv-white3);">Free to Play</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--cv-green);">18+</div>
              <div style="font-size: 0.75rem; color: var(--cv-white3);">Adults Only</div>
            </div>
          </div>
        </div>
      </div>
    `,
    buttonText: 'Start Tutorial →',
    allowSkip: false
  },
  {
    id: 'age-verification',
    type: 'fullscreen',
    title: 'Age Verification 🛡️',
    subtitle: 'Required by Indian Law',
    content: `
      <div style="max-width: 500px; margin: 0 auto;">
        <div style="background: rgba(224, 112, 112, 0.1); border: 1px solid rgba(224, 112, 112, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <span style="font-size: 2rem;">⚠️</span>
            <div>
              <div style="font-weight: 700; color: var(--cv-red); font-size: 1.1rem;">Important Legal Notice</div>
              <div style="font-size: 0.85rem; color: var(--cv-white2);">You must acknowledge all statements to continue</div>
            </div>
          </div>
        </div>
        
        <div style="text-align: left; space-y: 1rem;">
          <label id="age-check-1" style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 10px; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onclick="toggleTutorialCheckbox('age-check-1')">
            <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--cv-green); margin-top: 2px; flex-shrink: 0;" onchange="updateTutorialButton()">
            <div>
              <div style="font-weight: 600; color: var(--cv-white); margin-bottom: 0.25rem;">I am 18 years of age or older</div>
              <div style="font-size: 0.8rem; color: var(--cv-white3);">CrowdVerse is strictly for adults only. Providing false age information will result in permanent account deletion.</div>
            </div>
          </label>
          
          <label id="age-check-2" style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 10px; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onclick="toggleTutorialCheckbox('age-check-2')">
            <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--cv-green); margin-top: 2px; flex-shrink: 0;" onchange="updateTutorialButton()">
            <div>
              <div style="font-weight: 600; color: var(--cv-white); margin-bottom: 0.25rem;">I understand this is a game, not gambling</div>
              <div style="font-size: 0.8rem; color: var(--cv-white3);">CrowdVerse uses virtual tokens with NO monetary value. You cannot win or lose real money.</div>
            </div>
          </label>
          
          <label id="age-check-3" style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 10px; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onclick="toggleTutorialCheckbox('age-check-3')">
            <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--cv-green); margin-top: 2px; flex-shrink: 0;" onchange="updateTutorialButton()">
            <div>
              <div style="font-weight: 600; color: var(--cv-white); margin-bottom: 0.25rem;">I agree to play responsibly</div>
              <div style="font-size: 0.8rem; color: var(--cv-white3);">I understand that prediction markets involve skill and opinion, and I will not chase losses or play beyond my means.</div>
            </div>
          </label>
        </div>
      </div>
    `,
    buttonText: 'Continue (Check all boxes)',
    buttonDisabled: true,
    allowSkip: false
  },
  {
    id: 'what-is-crowdverse',
    type: 'fullscreen',
    title: 'What is CrowdVerse? 🤔',
    subtitle: 'Predict. Earn. Compete.',
    content: `
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📊</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Browse Markets</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Explore predictions on sports, economy, entertainment & more</div>
          </div>
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💰</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Stake Tokens</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Use free tokens to bet on outcomes you believe in</div>
          </div>
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🏆</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Win & Climb</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Correct predictions multiply your tokens. Top the leaderboard!</div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, rgba(125, 216, 125, 0.1) 0%, rgba(125, 216, 125, 0.05) 100%); border: 1px solid rgba(125, 216, 125, 0.2); border-radius: 12px; padding: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 2rem;">💡</span>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: var(--cv-green); margin-bottom: 0.25rem;">The Crowd Decides</div>
              <div style="font-size: 0.9rem; color: var(--cv-white2);">As more people predict, odds shift in real-time. The collective wisdom determines the payouts!</div>
            </div>
          </div>
        </div>
      </div>
    `,
    buttonText: 'Next →',
    allowSkip: false
  },
  {
    id: 'tokens-explained',
    type: 'fullscreen',
    title: 'Understanding Tokens 🪙',
    subtitle: 'Virtual Points, Not Real Money',
    content: `
      <div style="max-width: 550px; margin: 0 auto;">
        <div style="background: var(--cv-dark2); border-radius: 16px; padding: 2rem; text-align: center; margin-bottom: 1.5rem; border: 2px solid var(--cv-border2);">
          <img src="assets/Token.png" style="width: 80px; height: 80px; margin-bottom: 1rem; animation: token-float 3s ease-in-out infinite;">
          <div style="font-size: 2rem; font-weight: 800; color: var(--cv-green); margin-bottom: 0.5rem;">1,000 Tokens</div>
          <div style="color: var(--cv-white2); font-size: 1rem;">Starting balance for new users</div>
        </div>
        
        <div style="text-align: left; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--cv-border);">
            <span style="font-size: 1.5rem;">✅</span>
            <div>
              <div style="font-weight: 600; color: var(--cv-white);">Completely FREE</div>
              <div style="font-size: 0.85rem; color: var(--cv-white3);">Never pay a single rupee. Ever.</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--cv-border);">
            <span style="font-size: 1.5rem;">✅</span>
            <div>
              <div style="font-weight: 600; color: var(--cv-white);">Weekly Bonuses</div>
              <div style="font-size: 0.85rem; color: var(--cv-white3);">Get +200 tokens every Monday</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--cv-border);">
            <span style="font-size: 1.5rem;">✅</span>
            <div>
              <div style="font-weight: 600; color: var(--cv-white);">Win More</div>
              <div style="font-size: 0.85rem; color: var(--cv-white3);">Correct predictions multiply your tokens</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(224, 112, 112, 0.05); border-radius: 0 0 8px 8px;">
            <span style="font-size: 1.5rem;">❌</span>
            <div>
              <div style="font-weight: 600; color: var(--cv-red);">NO Cash Value</div>
              <div style="font-size: 0.85rem; color: var(--cv-white3);">Cannot be withdrawn or converted to money</div>
            </div>
          </div>
        </div>
        
        <div style="background: rgba(232, 197, 71, 0.1); border: 1px solid rgba(232, 197, 71, 0.2); border-radius: 8px; padding: 1rem; display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">⚠️</span>
          <div style="font-size: 0.85rem; color: var(--cv-white2);">
            <strong style="color: var(--cv-yellow);">Remember:</strong> Tokens are virtual game points only. Think of them like points in a video game!
          </div>
        </div>
      </div>
    `,
    buttonText: 'Got it! →',
    allowSkip: false
  },
  {
    id: 'how-to-predict',
    type: 'spotlight',
    target: '#page-markets',
    simulated: true,
    title: 'How to Make Predictions 🎯',
    subtitle: 'Step-by-step guide',
    content: `
      <div style="max-width: 500px;">
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; background: var(--cv-green); color: var(--cv-black); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
            <div style="font-weight: 600;">Browse Markets</div>
          </div>
          <div style="font-size: 0.85rem; color: var(--cv-white2); padding-left: 3rem;">
            Find questions about sports, economy, entertainment, and more
          </div>
        </div>
        
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; background: var(--cv-green); color: var(--cv-black); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</div>
            <div style="font-weight: 600;">Choose YES or NO</div>
          </div>
          <div style="font-size: 0.85rem; color: var(--cv-white2); padding-left: 3rem;">
            Click on the outcome you think will happen
          </div>
        </div>
        
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; background: var(--cv-green); color: var(--cv-black); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</div>
            <div style="font-weight: 600;">Stake Tokens</div>
          </div>
          <div style="font-size: 0.85rem; color: var(--cv-white2); padding-left: 3rem;">
            Decide how many tokens to bet (min 25, includes 20 fee)
          </div>
        </div>
        
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; background: var(--cv-green); color: var(--cv-black); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">4</div>
            <div style="font-weight: 600;">Wait & Win!</div>
          </div>
          <div style="font-size: 0.85rem; color: var(--cv-white2); padding-left: 3rem;">
            When the event concludes, winners receive tokens based on the odds
          </div>
        </div>
      </div>
    `,
    buttonText: 'Next →',
    allowSkip: false
  },
 {
    id: 'odds-explained',
    type: 'fullscreen',
    title: 'Understanding Odds 📊',
    subtitle: 'How payouts work',
    content: `
      <div style="max-width: 550px; margin: 0 auto;">
        <div style="background: var(--cv-dark2); border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--cv-border2);">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 0.9rem; color: var(--cv-white3); margin-bottom: 0.5rem;">Example Market</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: var(--cv-white);">"Will India win the World Cup?"</div>
          </div>
          
          <div style="display: flex; height: 48px; border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
            <div style="flex: 0.7; background: linear-gradient(135deg, var(--cv-green) 0%, var(--cv-green-dim) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--cv-black);">
              <div style="font-weight: 700; font-size: 1rem;">YES 70%</div>
            </div>
            <div style="flex: 0.3; background: linear-gradient(135deg, var(--cv-red) 0%, var(--cv-red-dim) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--cv-white);">
              <div style="font-weight: 700; font-size: 1rem;">NO 30%</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="text-align: center; padding: 1rem; background: var(--cv-dark); border-radius: 8px;">
              <div style="font-size: 0.8rem; color: var(--cv-white3); margin-bottom: 0.25rem;">If you bet YES</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--cv-green);">1.43x payout</div>
              <div style="font-size: 0.75rem; color: var(--cv-white3);">Lower risk, lower reward</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--cv-dark); border-radius: 8px;">
              <div style="font-size: 0.8rem; color: var(--cv-white3); margin-bottom: 0.25rem;">If you bet NO</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--cv-red);">3.33x payout</div>
              <div style="font-size: 0.75rem; color: var(--cv-white3);">Higher risk, higher reward</div>
            </div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, rgba(107, 158, 255, 0.1) 0%, rgba(107, 158, 255, 0.05) 100%); border: 1px solid rgba(107, 158, 255, 0.2); border-radius: 8px; padding: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">💡</span>
            <div style="font-size: 0.9rem; color: var(--cv-white2);">
              <strong style="color: var(--cv-blue);">Pro Tip:</strong> The less popular option pays more! If you're confident in an underdog prediction, you can win big!
            </div>
          </div>
        </div>
      </div>
    `,
    buttonText: 'Next →',
    allowSkip: false
  },
  {
    id: 'features-overview',
    type: 'fullscreen',
    title: 'Cool Features! 🚀',
    subtitle: 'Make the most of CrowdVerse',
    content: `
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🔥</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Daily Streaks</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Predict every day to build your streak. Longer streaks = bragging rights!</div>
          </div>
          
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🏅</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Achievements</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Unlock badges for milestones like First Win, 5 Wins, Top 10%, and more!</div>
          </div>
          
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🎯</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Challenges</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Complete weekly challenges to earn bonus tokens!</div>
          </div>
          
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🎁</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Invite Friends</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Share your referral code and get 100 tokens for each friend who joins!</div>
          </div>
          
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🏆</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Leaderboard</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Compete with other predictors and climb to the top!</div>
          </div>
          
          <div style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 12px; padding: 1.25rem;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">✍️</div>
            <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 0.5rem;">Create Markets</div>
            <div style="font-size: 0.85rem; color: var(--cv-white2);">Submit your own prediction questions (costs 20 tokens)</div>
          </div>
        </div>
      </div>
    `,
    buttonText: 'Next →',
    allowSkip: false
  },
  {
    id: 'rules-disclaimer',
    type: 'fullscreen',
    title: 'Rules & Guidelines 📜',
    subtitle: 'Please read carefully',
    content: `
      <div style="max-width: 600px; margin: 0 auto; text-align: left;">
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🚫</span> Prohibited Content
          </div>
          <div style="font-size: 0.9rem; color: var(--cv-white2); line-height: 1.8;">
            • No political predictions involving elections<br>
            • No harmful, violent, or illegal content<br>
            • No personal attacks or harassment<br>
            • No spam or duplicate markets<br>
            • No markets about tragic events or deaths
          </div>
        </div>
        
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚖️</span> Legal Compliance
          </div>
          <div style="font-size: 0.9rem; color: var(--cv-white2); line-height: 1.8;">
            • CrowdVerse operates under Indian law as a skill-based game<br>
            • This is NOT gambling or betting<br>
            • Tokens have zero monetary value<br>
            • No real money deposits or withdrawals<br>
            • KYC required for paid features (when launched)
          </div>
        </div>
        
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="font-weight: 700; color: var(--cv-white); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>👤</span> Account Rules
          </div>
          <div style="font-size: 0.9rem; color: var(--cv-white2); line-height: 1.8;">
            • One account per person<br>
            • Must be 18+ years old<br>
            • Accurate information required<br>
            • False info = permanent ban<br>
            • Account sharing prohibited
          </div>
        </div>
        
        <label id="rules-confirm" style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 10px; cursor: pointer;" onclick="toggleTutorialCheckbox('rules-confirm')">
          <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--cv-green); margin-top: 2px; flex-shrink: 0;" onchange="updateTutorialButton()">
          <div>
            <div style="font-weight: 600; color: var(--cv-white);">I have read and agree to follow all rules</div>
            <div style="font-size: 0.8rem; color: var(--cv-white3);">Violation may result in account suspension</div>
          </div>
        </label>
      </div>
    `,
    buttonText: 'I Agree (Check box)',
    buttonDisabled: true,
    allowSkip: false
  },
  {
    id: 'final',
    type: 'fullscreen',
    title: 'You\'re All Set! 🎉',
    subtitle: 'Start your prediction journey',
    content: `
      <div style="text-align: center; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: cv-pop-in 0.5s ease;">🚀</div>
        <p style="font-size: 1.1rem; line-height: 1.8; color: var(--cv-white2); margin-bottom: 1.5rem;">
          You're now ready to make your first prediction! Remember:
        </p>
        <div style="background: var(--cv-dark2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: left;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <span style="font-size: 1.5rem;">✅</span>
            <span>You have <strong style="color: var(--cv-green);">1,000 tokens</strong> to start</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <span style="font-size: 1.5rem;">✅</span>
            <span>Browse markets and predict on anything</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.5rem;">✅</span>
            <span>Build your streak and unlock achievements</span>
          </div>
        </div>
        <div style="font-size: 0.9rem; color: var(--cv-white3);">
          Need help? Visit your Profile page anytime for a refresher!
        </div>
      </div>
    `,
    buttonText: 'Start Predicting! 🎯',
    allowSkip: false
  }
];

let currentTutorialStep = 0;
let tutorialCompleted = false;

// ═════════════════════════════════════════════════════════════════════════════
// TUTORIAL FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Check if user needs to see tutorial
 */
function shouldShowTutorial() {
  // Only show for logged-in users who haven't completed the tutorial
  if (!State.currentUser) return false;
  
  // Check localStorage first (fast check)
  const localVersion = localStorage.getItem('cv_tutorial_completed');
  if (localVersion === TUTORIAL_VERSION) return false;
  
  // Will also check Firestore when user data loads
  return true;
}

/**
 * Start the tutorial
 */
function startTutorial() {
  currentTutorialStep = 0;
  tutorialCompleted = false;
  
  // Create tutorial overlay
  createTutorialOverlay();
  
  // Show first step
  showTutorialStep(0);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Create tutorial overlay container
 */
function createTutorialOverlay() {
  // Remove existing if any
  const existing = document.getElementById('tutorial-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(13, 13, 15, 0.98);
    backdrop-filter: blur(20px);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  document.body.appendChild(overlay);
}

/**
 * Show a specific tutorial step
 */
function showTutorialStep(index) {
  const step = TUTORIAL_STEPS[index];
  if (!step) return;
  
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  
  // Calculate progress
  const progress = ((index + 1) / TUTORIAL_STEPS.length) * 100;
  
  overlay.innerHTML = `
    <!-- Progress Bar -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--cv-dark2);">
      <div style="height: 100%; width: ${progress}%; background: linear-gradient(90deg, var(--cv-green) 0%, var(--cv-green-dim) 100%); transition: width 0.3s ease;"></div>
    </div>
    
    <!-- Step Counter -->
    <div style="position: absolute; top: 1.5rem; right: 1.5rem; font-family: var(--font-mono); font-size: 0.85rem; color: var(--cv-white3);">
      Step ${index + 1} of ${TUTORIAL_STEPS.length}
    </div>
    
    <!-- Content Container -->
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
      <div style="width: 100%; max-width: 700px; animation: cv-fade-in 0.4s ease;">
        ${step.type === 'fullscreen' ? renderFullscreenStep(step) : renderSpotlightStep(step)}
      </div>
    </div>
    
    <!-- Navigation -->
    <div style="padding: 1.5rem 2rem; border-top: 1px solid var(--cv-border); background: var(--cv-dark);">
      <div style="max-width: 700px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <button 
          onclick="prevTutorialStep()"
          style="padding: 0.75rem 1.5rem; background: transparent; border: 1px solid var(--cv-border2); border-radius: 8px; color: var(--cv-white2); font-family: var(--font-body); font-size: 0.9rem; cursor: pointer; transition: all 0.2s; ${index === 0 ? 'visibility: hidden;' : ''}"
          onmouseover="this.style.borderColor='var(--cv-green)';this.style.color='var(--cv-green)';"
          onmouseout="this.style.borderColor='var(--cv-border2)';this.style.color='var(--cv-white2)';"
        >
          ← Back
        </button>
        
        <button 
          id="tutorial-next-btn"
          onclick="nextTutorialStep()"
          style="padding: 0.75rem 2rem; background: ${step.buttonDisabled ? 'var(--cv-border2)' : 'linear-gradient(135deg, var(--cv-green) 0%, var(--cv-green-dim) 100%)'}; border: none; border-radius: 8px; color: ${step.buttonDisabled ? 'var(--cv-white3)' : 'var(--cv-black)'}; font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; cursor: ${step.buttonDisabled ? 'not-allowed' : 'pointer'}; transition: all 0.2s;"
          ${step.buttonDisabled ? 'disabled' : ''}
        >
          ${step.buttonText}
        </button>
      </div>
    </div>
  `;
  
  // Add animation styles if not present
  addTutorialStyles();
}

/**
 * Render fullscreen step content
 */
function renderFullscreenStep(step) {
  return `
    <div style="text-align: center;">
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--cv-green); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">
        ${step.subtitle}
      </div>
      <h2 style="font-family: var(--font-display); font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: 2rem; color: var(--cv-white);">
        ${step.title}
      </h2>
      <div style="color: var(--cv-white2);">
        ${step.content}
      </div>
    </div>
  `;
}

/**
 * Render spotlight step content
 */
function renderSpotlightStep(step) {
  return `
    <div style="text-align: center;">
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--cv-green); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">
        ${step.subtitle}
      </div>
      <h2 style="font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; margin-bottom: 1.5rem; color: var(--cv-white);">
        ${step.title}
      </h2>
      <div style="color: var(--cv-white2);">
        ${step.content}
      </div>
    </div>
  `;
}

/**
 * Go to next step
 */
function nextTutorialStep() {
  const currentStep = TUTORIAL_STEPS[currentTutorialStep];
  
  // Check if current step requires checkbox validation
  if (currentStep.buttonDisabled) {
    const checkboxes = document.querySelectorAll('#tutorial-overlay input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    if (!allChecked) {
      // Shake animation for feedback
      const btn = document.getElementById('tutorial-next-btn');
      if (btn) {
        btn.style.animation = 'shake 0.5s ease';
        setTimeout(() => btn.style.animation = '', 500);
      }
      showToast('Please check all boxes to continue', 'yellow');
      return;
    }
  }
  
  currentTutorialStep++;
  
  if (currentTutorialStep >= TUTORIAL_STEPS.length) {
    completeTutorial();
  } else {
    showTutorialStep(currentTutorialStep);
  }
}

/**
 * Go to previous step
 */
function prevTutorialStep() {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    showTutorialStep(currentTutorialStep);
  }
}

/**
 * Complete the tutorial
 */
function completeTutorial() {
  tutorialCompleted = true;
  
  // Save to localStorage
  localStorage.setItem('cv_tutorial_completed', TUTORIAL_VERSION);
  
  // Save to Firestore
  if (!demoMode && db && State.currentUser) {
    db.collection('users').doc(State.currentUser.uid).update({
      tutorialCompleted: true,
      tutorialVersion: TUTORIAL_VERSION,
      tutorialCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(() => {});
  }
  
  // Close tutorial
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 500);
  }
  
  // Show celebration
  triggerConfetti(100);
  showToast('🎉 Tutorial complete! Welcome to CrowdVerse!', 'green');
  
  // Navigate to markets
  setTimeout(() => {
    showPage('markets');
  }, 1500);
}

/**
 * Toggle checkbox styling
 */
function toggleTutorialCheckbox(labelId) {
  const label = document.getElementById(labelId);
  if (label) {
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (checkbox && event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      updateTutorialButton();
    }
  }
}

/**
 * Update button state based on checkboxes
 */
function updateTutorialButton() {
  const currentStep = TUTORIAL_STEPS[currentTutorialStep];
  if (!currentStep.buttonDisabled) return;
  
  const checkboxes = document.querySelectorAll('#tutorial-overlay input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  const btn = document.getElementById('tutorial-next-btn');
  if (btn) {
    btn.disabled = !allChecked;
    btn.style.background = allChecked 
      ? 'linear-gradient(135deg, var(--cv-green) 0%, var(--cv-green-dim) 100%)' 
      : 'var(--cv-border2)';
    btn.style.color = allChecked ? 'var(--cv-black)' : 'var(--cv-white3)';
    btn.style.cursor = allChecked ? 'pointer' : 'not-allowed';
    btn.textContent = allChecked 
      ? currentStep.buttonText.replace(' (Check all boxes)', '').replace(' (Check box)', '') 
      : currentStep.buttonText;
  }
}

/**
 * Add tutorial-specific styles
 */
function addTutorialStyles() {
  if (document.getElementById('tutorial-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'tutorial-styles';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
    
    #tutorial-overlay label:hover {
      border-color: var(--cv-green) !important;
      background: rgba(125, 216, 125, 0.05) !important;
    }
    
    #tutorial-overlay label:has(input:checked) {
      border-color: var(--cv-green) !important;
      background: rgba(125, 216, 125, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION WITH AUTH
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Check tutorial status after auth
 */
async function checkTutorialStatus() {
  if (!State.currentUser) return;
  
  // First check localStorage (fast)
  const localVersion = localStorage.getItem('cv_tutorial_completed');
  if (localVersion === TUTORIAL_VERSION) return;
  
  // Then check Firestore
  if (!demoMode && db) {
    try {
      const snap = await db.collection('users').doc(State.currentUser.uid).get();
      if (snap.exists) {
        const data = snap.data();
        if (data.tutorialCompleted && data.tutorialVersion === TUTORIAL_VERSION) {
          localStorage.setItem('cv_tutorial_completed', TUTORIAL_VERSION);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to check tutorial status:', e);
    }
  }
  
  // Show tutorial after a short delay
  setTimeout(() => {
    startTutorial();
  }, 500);
}

// Override onAuthSuccess to include tutorial check
const originalOnAuthSuccess = window.onAuthSuccess;
window.onAuthSuccess = function(isNew) {
  originalOnAuthSuccess(isNew);
  
  // Show tutorial ONLY for brand new signups (not logins)
  if (isNew) {
    setTimeout(() => {
      startTutorial();
    }, 3500); // Wait for auth success animation
  }
};

// Tutorial only shows on new account creation - no automatic showing for returning users

// Export for manual triggering
window.startTutorial = startTutorial;
window.shouldShowTutorial = shouldShowTutorial;
