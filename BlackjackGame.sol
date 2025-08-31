
pragma solidity ^0.8.19;

interface IMonadGamesID {
    function updatePlayerData(address player, uint256 scoreAmount, uint256 transactionAmount) external;
}

contract BlackjackGame {
    struct Card {
        uint8 suit;
        uint8 value;
    }
    
    struct GameState {
        address player;
        Card[] playerCards;
        Card[] dealerCards;
        uint256 bet;
        uint8 gameStatus;
        bool isActive;
        uint256 gameId;
        bool dealerTurn;
        uint256 timestamp;
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
    
    address public owner;
    address public monadGamesIDContract;
    uint256 public gameCounter;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    
    event GameStarted(address indexed player, uint256 gameId, uint256 bet, uint256 timestamp);
    event CardDealt(address indexed player, uint256 gameId, uint8 suit, uint8 value, bool isDealer, uint256 timestamp);
    event GameEnded(address indexed player, uint256 gameId, uint8 result, uint256 payout, uint256 timestamp);
    
    constructor(address _monadGamesIDContract) {
        owner = msg.sender;
        monadGamesIDContract = _monadGamesIDContract;
        gameCounter = 0;
    }
    
    modifier validBet() {
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet amount");
        _;
    }
    
    modifier activeGame() {
        require(currentGames[msg.sender].isActive, "No active game");
        _;
    }
    
    function startGame() external payable validBet {
        require(!currentGames[msg.sender].isActive, "Game already active");
        
        gameCounter++;
        GameState storage game = currentGames[msg.sender];
        
        game.player = msg.sender;
        game.bet = msg.value;
        game.gameStatus = 0;
        game.isActive = true;
        game.gameId = gameCounter;
        game.dealerTurn = false;
        game.timestamp = block.timestamp;
        
        delete game.playerCards;
        delete game.dealerCards;
        
        _dealCard(msg.sender, false);
        _dealCard(msg.sender, true);
        _dealCard(msg.sender, false);
        _dealCard(msg.sender, true);
        
        emit GameStarted(msg.sender, gameCounter, msg.value, block.timestamp);
        
        if (_getHandValue(game.playerCards) == 21) {
            if (_getHandValue(game.dealerCards) == 21) {
                _endGame(msg.sender, 3);
            } else {
                _endGame(msg.sender, 1);
            }
        }
    }
    
    function hit() external activeGame {
        GameState storage game = currentGames[msg.sender];
        require(!game.dealerTurn, "Not player's turn");
        
        _dealCard(msg.sender, false);
        
        if (_getHandValue(game.playerCards) > 21) {
            _endGame(msg.sender, 2);
        }
    }
    
    function stand() external activeGame {
        GameState storage game = currentGames[msg.sender];
        require(!game.dealerTurn, "Not player's turn");
        
        game.dealerTurn = true;
        
        while (_getHandValue(game.dealerCards) < 17) {
            _dealCard(msg.sender, true);
        }
        
        uint256 playerValue = _getHandValue(game.playerCards);
        uint256 dealerValue = _getHandValue(game.dealerCards);
        
        if (dealerValue > 21) {
            _endGame(msg.sender, 1);
        } else if (playerValue > dealerValue) {
            _endGame(msg.sender, 1);
        } else if (dealerValue > playerValue) {
            _endGame(msg.sender, 2);
        } else {
            _endGame(msg.sender, 3);
        }
    }
    
    function _dealCard(address player, bool isDealer) private {
        GameState storage game = currentGames[player];
        
        uint256 randomHash = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            player,
            game.gameId,
            game.playerCards.length + game.dealerCards.length
        )));
        
        uint8 suit = uint8(randomHash % 4);
        uint8 value = uint8((randomHash >> 8) % 13) + 1;
        
        Card memory newCard = Card(suit, value);
        
        if (isDealer) {
            game.dealerCards.push(newCard);
        } else {
            game.playerCards.push(newCard);
        }
        
        emit CardDealt(player, game.gameId, suit, value, isDealer, block.timestamp);
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
        
        if (result == 1) {
            if (game.playerCards.length == 2 && _getHandValue(game.playerCards) == 21) {
                payout = game.bet + (game.bet * 3) / 2;
            } else {
                payout = game.bet * 2;
            }
            stats.wins++;
            stats.totalWon += payout;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
            payable(player).transfer(payout);
        } else if (result == 2) {
            stats.losses++;
            stats.currentStreak = 0;
        } else {
            payout = game.bet;
            stats.pushes++;
            payable(player).transfer(payout);
        }
        
        stats.totalGames++;
        stats.totalWagered += game.bet;
        
        emit GameEnded(player, game.gameId, result, payout, block.timestamp);
        
        if (monadGamesIDContract != address(0)) {
            try IMonadGamesID(monadGamesIDContract).updatePlayerData(
                player,
                result == 1 ? 1 : 0,
                1
            ) {} catch {}
        }
    }
    
    function getGameState(address player) external view returns (GameState memory) {
        return currentGames[player];
    }
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function isGameActive(address player) external view returns (bool) {
        return currentGames[player].isActive;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}