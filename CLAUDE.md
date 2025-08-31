- NOW YOU MUST FOLLOW THIS STESP

I want everything on chain, all the moves will be considered as a transaction from wallet on monad testnet. 
I want everything dynamic, no dummy data. 
I want everything recoreded on blockchain.
I want you to implemennt things as per the monad game id concept mentioned above and everything should worked as described in in the mission. 
Dont work on assumption, we need real and dynamic things.
focus on the concept. 
I want you to init project, install aall the dependencies, create all the folders, relevant files and code all the files.
I want you to create a folder to deploy contract, write contract and make it ready to deploy once i say deploy, 
create all the files and logic related to blackjack as per the monad game id and mission. \\
\
  CREATE YOUR OWN CHECKLIST, YOU HAVE ALL THE PERMISSION FROM MY END, YOU DONT NEED TO ASK FOR THE PROJECT TO RUN OR CHECK, YOU CAN
monad rpc - https://monad-testnet.drpc.org\
chai id\
currency symbol - MON\
\
& 'c:\Users\yltri\Desktop\mission 7\mission7.txt'\
CREATE YOUR OWN CHECKLIST, YOU HAVE ALL THE PERMISSION FROM MY END, YOU DONT NEED TO ASK FOR THE PROJECT TO RUN OR CHECK, YOU CAN DO ALL THE TESTING WITHOUT ASKING ME< I GRANT YOU ALL THE READ AND WRITE PERMISSION HERE> \
COMPLETE THE ENTIRE PROJECT IN ONE GO, BUT MAKE SURE YOU STICK TO LOGIC AND CONCEPT
- you dont have to ask me this again and again when i said you got all the permission to do things your way. dont ask me again just finish this.


STICK TO CONCEPT OF BLACKJACK AND REDUX WITH MONAD GAME ID

How to integrate Monad Games ID
Monad Games ID is a cross-game solution that players can use to reserve a username. This username will be their identity in every game that integrates Monad Games ID.
This is very similar to something like Steam or PS Network!
The benefit is that now, we can create a single leaderboard comprised of scores from all games!
Monad Games ID is great UX unlock for players and the games that integrate Monad Games ID will attract more players!
Monad Games ID uses Privy Global wallet.
Games wishing to integrate Monad Games ID must register onchain. Follow the steps outlined below.
Once the game is registered, games can submit scores and transactions performed by the player onchain, steps are outlined below:
* Register your game with Monad Games ID
   * Visit the smart contract on the explorer

<https://testnet.monadexplorer.com/address/0xceCBFF203C8B6044F52CE23D914A1bfD997541A4?tab=Contract>
Register the game using the registerGame function
_game : Address that the game will use to submit scores and transaction counts onchain
_name : Game Name
_image : Game Icon/Logo
_url : URL that players can visit to play the game
Integrate “Sign in with Monad Games ID” Follow this Privy guide Privy DocsLogin with a global wallet - Privy Docs It is recommended to use loginMethodsAndOrder method instead of loginWithCrossAppAccount method If your game allows multiple different wallets, a dedicated button for “Sign in with Monad Games ID” is recommended When asked for Cross App ID or Provider App ID use the below value, This is not the appId this is the Cross App ID. appId has to be your own appId from the Privy Dashboard cmd8euall0037le0my79qpz42
Get the player wallet address When the user signs in using their Monad Games ID, an embedded wallet is created for them automatically! Below is the code that you can use in your game to get that wallet address import { usePrivy, CrossAppAccountWithMetadata, } from "@privy-io/react-auth"; export default function App() { const { authenticated, user, ready, logout, login } = usePrivy(); ... useEffect(() => { // Check if privy is ready and user is authenticated if (authenticated && user && ready) { // Check if user has linkedAccounts if (user.linkedAccounts.length > 0) { // Get the cross app account created using Monad Games ID const crossAppAccount: CrossAppAccountWithMetadata = user.linkedAccounts.filter(account => account.type === "cross_app" && account.providerApp.id === "cmd8euall0037le0my79qpz42")[0] as CrossAppAccountWithMetadata; // The first embedded wallet created using Monad Games ID, is the wallet address if (crossAppAccount.embeddedWallets.length > 0) { setAccountAddress(crossAppAccount.embeddedWallets[0].address); } } else { setMessage("You need to link your Monad Games ID account to continue."); } } }, [authenticated, user, ready]); ... }
Get the username Use the below endpoint to get the username
<https://monad-games-id-site.vercel.app/api/check-wallet?wallet={walletAddress}>
Method: GET
The walletAddress is the player’s Monad Games ID wallet, check “Get the player wallet address” section to learn more on how to get the wallet address. Example Response:
{
    "hasUsername": true,
    "user": {
        "id": 2,
        "username": "harpal",
        "walletAddress": "0x6523d..."
    }
}

It is possible that a player might have not reserved a username!
If the player does not have a username, show a button or a link with a message, redirecting the user to the below url for registering a username.
https://monad-games-id-site.vercel.app/                                                   Submitting scores and transaction count onchain
- You can use the `updatePlayerData` function on the smart contract to submit `scoreAmount` and `transactionAmount` for a specific `player` using their address
    - [Contract Address](https://testnet.monadexplorer.com/address/0xceCBFF203C8B6044F52CE23D914A1bfD997541A4?tab=Contract)
    
    ```jsx
    0xceCBFF203C8B6044F52CE23D914A1bfD997541A4
Make sure to submit scores and transactions to be added and not the total

You can use Viem or Ethers.js or any library of your choice to make the function calls from your server or game!
You can get the ABI from the explorer.
Make sure to have the score and transaction update code on the server side otherwise the player can hack the game and make it submit any score of their choice!
Verifying score and transaction submission [COMING SOON]



In this mission we will be building games with a HUGE leaderboard Dates: Aug 13 - Aug 31 Rules: 
* Anything built for this mission should be open source
* You can work as a team of 2-3 people or solo
* Do not build r/place clones
* Build games that are novel experiences!
Prizes: Prizes for New Games 
* 1st place: 4000 Testnet MON
* 2nd place: 3000 Testnet MON
* 3rd place: 2000 Testnet MON
* Quality participation: 250 Testnet MON
 Prizes for Existing Games 
* 1st place: 3000 Testnet MON
* 2nd place: 2000 Testnet MON
* 3rd place: 1000 Testnet MON
* Quality participation: 250 Testnet MON
Ideas
Leaderboards work best in games where performance is measurable, repeatable, and comparable: especially if the core fun comes from skill mastery, competition, or replayability.
The websites below all have lots of cool games to build prototypes of.
* https://itch.io/
* https://armorgames.com/
* https://bitvint.com/pages/top-100-arcade-games-of-all-time
The list below is generated by ChatGPT and it is a good place to start thinking if you have 0 ideas about what to build.



i just selected BLACKJACK FOR MY PROJECT, here is the concept.

NOW YOU MUST FOLLOW THIS STESP

I want everything on chain, all the moves will be considered as a transaction from wallet on monad testnet. 
I want everything dynamic, no dummy data. 
I want everything recoreded on blockchain.
I want you to implemennt things as per the monad game id concept mentioned above and everything should worked as described in in the mission. 
Dont work on assumption, we need real and dynamic things.
focus on the concept. 
I want you to init project, install aall the dependencies, create all the folders, relevant files and code all the files.
I want you to create a folder to deploy contract, write contract and make it ready to deploy once i say deploy, 
create all the files and logic related to blackjack as per the monad game id and mission. 


Blackjack - Perfect Redux Game!
Brilliant Choice!
Blackjack is actually ideal for this hackathon because it perfectly showcases Redux architecture while being highly competitive. Great suggestion!
Why Blackjack + Redux is Perfect
✅ Redux Showcase: Card games are the perfect use case for Redux state management
✅ Quick Sessions: 30-60 seconds per hand = high replay rate
✅ Multiple Metrics: Win rate, streaks, bankroll growth, perfect plays
✅ Easy Validation: Server can verify game logic and prevent cheating
✅ Universal Appeal: Everyone knows Blackjack rules
✅ Competitive Depth: Strategy + luck = engaging leaderboards


🏆 Why Blackjack + Redux Dominates
✅ Redux Showcase Excellence

Perfect State Management: Card games are the textbook example for Redux
Complex State Transitions: Betting → Dealing → Player Turn → Dealer Turn → Payout
Predictable Updates: Every action has clear state implications
Time Travel Debugging: Can replay entire hands for validation



🎯 Why This Wins Hackathons
Technical Excellence

Redux Mastery: Shows advanced state management skills
Game Logic Complexity: Proper Blackjack implementation is non-trivial
Real-time Updates: Smooth card animations and state transitions
Server Integration: Clear points for blockchain score submission

User Experience

Universal Appeal: Everyone knows Blackjack
Quick Sessions: 1-3 minutes per hand = high replay
Progressive Improvement: Players can see their strategy improve
Social Competition: "I have a 75% win rate!" = bragging rights

Business Viability

Monetization Ready: Easy to add tournaments, cosmetics, premium features
Data Rich: Tons of analytics for player behavior
Scalable: Can add poker, baccarat, other card games
Community Building: Tournaments and leaderboards drive engagement

💡 Extension Ideas 

Multi-Hand Blackjack: Play 3 hands simultaneously
Side Bets: 21+3, Perfect Pairs, Lucky Lucky
Live Tournaments: Real-time multiplayer competitions
Strategy Trainer: AI coach that suggests optimal plays
NFT Card Skins: Special deck designs for collectors
Spike as Dealer: Animated character reactions to wins/losses

🏅 The Perfect Storm
Blackjack + Redux + Monad Games ID hits every hackathon judging criteria:

This concept perfectly balances technical complexity with user accessibility!
Want me to help you implement the Redux-Saga integration or design the tournament system?
