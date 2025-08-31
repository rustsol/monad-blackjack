// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMonadGamesID {
    function updatePlayerData(address player, uint256 scoreAmount, uint256 transactionAmount) external;
}

contract BlackjackGame {
    struct Card {
        uint8 suit;    // 0=Spades, 1=Hearts, 2=Diamonds, 3=Clubs
        uint8 value;   // 1=Ace, 11=Jack, 12=Queen, 13=King
    }
    
    struct GameState {
        address player;
        Card[] playerCards;
        Card[] dealerCards;
        uint256 bet;
        uint8 gameStatus; // 0=InProgress, 1=PlayerWin, 2=DealerWin, 3=Push
        bool isActive;
        uint256 gameId;
        bool dealerTurn;
        uint256 timestamp;
        bool[52] usedCards; // Track which cards have been used in this game
    }
    
    struct PlayerStats {
        uint256 totalGames;
        uint256 wins;
        uint256 losses;
        uint256 pushes;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 currentStreak;
        uint256 bestStreak;
    }
    
    mapping(address => GameState) public currentGames;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => GameState) public gameHistory;
    
    address public owner;
    address public monadGamesIDContract;
    uint256 public gameCounter;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    
    // Events for real-time updates
    event GameStarted(address indexed player, uint256 gameId, uint256 bet);
    event CardDealt(address indexed player, uint256 gameId, uint8 suit, uint8 value, bool isDealer);
    event PlayerAction(address indexed player, uint256 gameId, string action);
    event GameEnded(address indexed player, uint256 gameId, uint8 result, uint256 payout);
    event StatsUpdated(address indexed player, uint256 wins, uint256 losses, uint256 streak);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier gameActive(address player) {
        require(currentGames[player].isActive, "No active game");
        _;
    }
    
    modifier noActiveGame(address player) {
        require(!currentGames[player].isActive, "Game already active");
        _;
    }
    
    constructor(address _monadGamesIDContract) {
        owner = msg.sender;
        monadGamesIDContract = _monadGamesIDContract;
        gameCounter = 0;
    }
    
    function startGame() external payable noActiveGame(msg.sender) {
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet amount");
        
        gameCounter++;
        GameState storage game = currentGames[msg.sender];
        
        // Initialize new game
        game.player = msg.sender;
        game.bet = msg.value;
        game.gameStatus = 0; // InProgress
        game.isActive = true;
        game.gameId = gameCounter;
        game.dealerTurn = false;
        game.timestamp = block.timestamp;
        
        // Clear previous cards
        delete game.playerCards;
        delete game.dealerCards;
        
        // Reset the used cards array for new game
        for (uint i = 0; i < 52; i++) {
            game.usedCards[i] = false;
        }
        
        // Deal initial cards
        _dealCard(msg.sender, false); // Player first card
        _dealCard(msg.sender, true);  // Dealer first card
        _dealCard(msg.sender, false); // Player second card
        _dealCard(msg.sender, true);  // Dealer second card
        
        emit GameStarted(msg.sender, gameCounter, msg.value);
        
        // Check for natural blackjack
        uint256 playerValue = _getHandValue(game.playerCards);
        uint256 dealerValue = _getHandValue(game.dealerCards);
        
        if (playerValue == 21 && dealerValue == 21) {
            _endGame(msg.sender, 3); // Push
        } else if (playerValue == 21) {
            _endGame(msg.sender, 1); // Player wins with blackjack
        } else if (dealerValue == 21) {
            _endGame(msg.sender, 2); // Dealer wins with blackjack
        }
    }
    
    function playerHit() public gameActive(msg.sender) {
        GameState storage game = currentGames[msg.sender];
        require(!game.dealerTurn, "Not player turn");
        require(game.gameStatus == 0, "Game already ended");
        
        _dealCard(msg.sender, false);
        emit PlayerAction(msg.sender, game.gameId, "HIT");
        
        uint256 playerValue = _getHandValue(game.playerCards);
        if (playerValue > 21) {
            _endGame(msg.sender, 2); // Player busts, dealer wins
        } else if (playerValue == 21) {
            // Auto-stand on 21
            playerStand();
        }
    }
    
    // Keeping original function name for compatibility
    function hit() external {
        playerHit();
    }
    
    function playerStand() public gameActive(msg.sender) {
        GameState storage game = currentGames[msg.sender];
        require(!game.dealerTurn, "Not player turn");
        require(game.gameStatus == 0, "Game already ended");
        
        game.dealerTurn = true;
        emit PlayerAction(msg.sender, game.gameId, "STAND");
        
        // Dealer plays
        uint256 dealerValue = _getHandValue(game.dealerCards);
        while (dealerValue < 17) {
            _dealCard(msg.sender, true);
            dealerValue = _getHandValue(game.dealerCards);
        }
        
        uint256 playerValue = _getHandValue(game.playerCards);
        
        if (dealerValue > 21) {
            _endGame(msg.sender, 1); // Dealer busts, player wins
        } else if (playerValue > dealerValue) {
            _endGame(msg.sender, 1); // Player wins
        } else if (dealerValue > playerValue) {
            _endGame(msg.sender, 2); // Dealer wins
        } else {
            _endGame(msg.sender, 3); // Push
        }
    }
    
    // Keeping original function name for compatibility
    function stand() external {
        playerStand();
    }
    
    function doubleDown() external payable gameActive(msg.sender) {
        GameState storage game = currentGames[msg.sender];
        require(!game.dealerTurn, "Not player turn");
        require(game.playerCards.length == 2, "Can only double down on initial hand");
        require(msg.value == game.bet, "Double down requires matching original bet");
        require(game.gameStatus == 0, "Game already ended");
        
        game.bet += msg.value;
        emit PlayerAction(msg.sender, game.gameId, "DOUBLE_DOWN");
        
        // Deal one card and auto-stand
        _dealCard(msg.sender, false);
        
        uint256 playerValue = _getHandValue(game.playerCards);
        if (playerValue > 21) {
            _endGame(msg.sender, 2); // Player busts
        } else {
            playerStand(); // Auto-stand after double down
        }
    }
    
    function forfeitGame() external gameActive(msg.sender) {
        GameState storage game = currentGames[msg.sender];
        require(game.playerCards.length == 2, "Can only forfeit initial hand");
        require(!game.dealerTurn, "Cannot forfeit after standing");
        require(game.gameStatus == 0, "Game already ended");
        
        emit PlayerAction(msg.sender, game.gameId, "FORFEIT");
        
        // Return half the bet
        uint256 refund = game.bet / 2;
        game.isActive = false;
        game.gameStatus = 2; // Dealer wins (but player gets half back)
        
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGames++;
        stats.losses++;
        stats.totalWagered += game.bet;
        stats.currentStreak = 0;
        
        gameHistory[game.gameId] = game;
        
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        
        emit GameEnded(msg.sender, game.gameId, 2, refund);
        emit StatsUpdated(msg.sender, stats.wins, stats.losses, stats.currentStreak);
    }
    
    function _getCardIndex(uint8 suit, uint8 value) private pure returns (uint8) {
        // Convert card to index 0-51
        // Each suit has 13 cards (0-12)
        // Spades: 0-12, Hearts: 13-25, Diamonds: 26-38, Clubs: 39-51
        return uint8(suit * 13 + (value - 1));
    }
    
    function _dealCard(address player, bool isDealer) private {
        GameState storage game = currentGames[player];
        
        uint256 attempts = 0;
        uint8 cardIndex;
        uint8 suit;
        uint8 value;
        bool cardFound = false;
        
        // Try to find an unused card (max 100 attempts to prevent infinite loop)
        while (!cardFound && attempts < 100) {
            // Generate random card
            uint256 randomHash = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                player,
                game.gameId,
                game.playerCards.length + game.dealerCards.length,
                attempts // Add attempts to ensure different hash each try
            )));
            
            suit = uint8(randomHash % 4);
            value = uint8((randomHash >> 8) % 13) + 1;
            cardIndex = _getCardIndex(suit, value);
            
            // Check if this card has already been used
            if (!game.usedCards[cardIndex]) {
                game.usedCards[cardIndex] = true;
                cardFound = true;
            }
            
            attempts++;
        }
        
        // If we couldn't find an unused card after 100 attempts, 
        // find the first unused card sequentially
        if (!cardFound) {
            for (uint8 i = 0; i < 52; i++) {
                if (!game.usedCards[i]) {
                    cardIndex = i;
                    suit = i / 13;
                    value = (i % 13) + 1;
                    game.usedCards[i] = true;
                    cardFound = true;
                    break;
                }
            }
        }
        
        require(cardFound, "No cards left in deck");
        
        Card memory newCard = Card(suit, value);
        
        if (isDealer) {
            game.dealerCards.push(newCard);
        } else {
            game.playerCards.push(newCard);
        }
        
        emit CardDealt(player, game.gameId, suit, value, isDealer);
    }
    
    function _getHandValue(Card[] memory cards) private pure returns (uint256) {
        uint256 total = 0;
        uint256 aces = 0;
        
        for (uint i = 0; i < cards.length; i++) {
            if (cards[i].value == 1) {
                aces++;
                total += 11;
            } else if (cards[i].value > 10) {
                total += 10;
            } else {
                total += cards[i].value;
            }
        }
        
        // Adjust for aces
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        
        return total;
    }
    
    function _endGame(address player, uint8 result) private {
        GameState storage game = currentGames[player];
        PlayerStats storage stats = playerStats[player];
        
        game.gameStatus = result;
        game.isActive = false;
        
        uint256 payout = 0;
        
        if (result == 1) { // Player wins
            if (game.playerCards.length == 2 && _getHandValue(game.playerCards) == 21) {
                // Blackjack pays 3:2
                payout = game.bet + (game.bet * 3) / 2;
            } else {
                // Regular win pays 1:1
                payout = game.bet * 2;
            }
            stats.wins++;
            stats.totalWon += payout;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
            payable(player).transfer(payout);
        } else if (result == 2) { // Dealer wins
            stats.losses++;
            stats.currentStreak = 0;
        } else { // Push
            payout = game.bet;
            stats.pushes++;
            payable(player).transfer(payout);
        }
        
        stats.totalGames++;
        stats.totalWagered += game.bet;
        
        // Store game in history
        gameHistory[game.gameId] = game;
        
        emit GameEnded(player, game.gameId, result, payout);
        emit StatsUpdated(player, stats.wins, stats.losses, stats.currentStreak);
        
        // Submit to Monad Games ID
        if (monadGamesIDContract != address(0)) {
            try IMonadGamesID(monadGamesIDContract).updatePlayerData(
                player,
                result == 1 ? 1 : 0, // Score: 1 for win, 0 for loss/push
                1 // Transaction count: 1 per game
            ) {} catch {
                // Silent fail if Monad Games ID contract call fails
            }
        }
    }
    
    function getGameState(address player) external view returns (GameState memory) {
        return currentGames[player];
    }
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function getPlayerCards(address player) external view returns (Card[] memory) {
        return currentGames[player].playerCards;
    }
    
    function getDealerCards(address player) external view returns (Card[] memory) {
        return currentGames[player].dealerCards;
    }
    
    function isGameActive(address player) external view returns (bool) {
        return currentGames[player].isActive;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Owner functions
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send funds");
    }
    
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
    }
    
    function updateMonadGamesIDContract(address _newContract) external onlyOwner {
        monadGamesIDContract = _newContract;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
    
    // Fallback function to receive ETH
    receive() external payable {}
}